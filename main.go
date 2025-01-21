package main

import (
	"bytes"
	"context"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log"
	"log/slog"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/kelseyhightower/envconfig"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// Dist is where the static files are stored
//
//go:embed app/dist/*
var AppDist embed.FS

const (
	StaticWildcardParam    = "path"
	timeout                = 10 * time.Second
	XForwardedFor          = "X-Forwarded-For"
	maxRetries             = 4
	minSleepSeconds        = 1
	maxSleepSeconds        = 20
	NoStatus               = ""
	StatusOkBot            = 200
	StatusOkTop            = 300
	insertBucketReceiveLog = "INSERT INTO bucket_receive_logs(bucket, body, headers, ip, created, updated) VALUES ({:bucket}, {:body}, {:headers}, {:ip}, {:created}, {:updated}) RETURNING *"
	insertBucketForwardLog = "INSERT INTO bucket_forward_logs(bucket, bucket_receive_log, destination_url, body, headers, status_code, created, updated) VALUES ({:bucket}, {:bucket_receive_log}, {:destination_url}, {:body}, {:headers}, {:status_code}, {:created}, {:updated})"
)

var (
	ErrFetchingBucket          = errors.New("Error fetching bucket")
	ErrInsertingReceiveLog     = errors.New("Error inserting bucket receive log")
	ErrInsertingForwardLog     = errors.New("Error inserting bucket forward log")
	ErrDecodingBody            = errors.New("Error decoding request body into json")
	ErrDecodingHeaders         = errors.New("Error decoding request headers into json")
	ErrFetchingForwardSettings = errors.New("Error fetching forward settings")
	ErrCreatingRequest         = errors.New("Error creating request")
	ErrForwardingRequest       = errors.New("Error forwarding request")
)

var (
	httpClient = &http.Client{
		Timeout: timeout,
	}

	// Commit is the git commit hash.
	Commit string

	config Config

	static fs.FS
)

type Config struct {
	Env    string `default:"development"`
	Debug  bool   `default:"false"`
	Commit string `default:"" required:"false"`
}

type BoundFunc = func(e *core.ServeEvent) error
type RequestFunc = func(e *core.RequestEvent) error
type BucketReceiveLog struct {
	ID      string `json:"id,omitempty" db:"id"`
	Bucket  string `json:"bucket,omitempty" db:"bucket"`
	Body    string `json:"body,omitempty" db:"body"`
	Headers string `json:"headers,omitempty" db:"headers"`
	IP      string `json:"ip,omitempty" db:"ip"`
	Created string `json:"created,omitempty" db:"created"`
	Updated string `json:"updated,omitempty" db:"updated"`
}
type BucketForwardLog struct {
	ID               string    `json:"id,omitempty" db:"id"`
	Bucket           string    `json:"bucket,omitempty" db:"bucket"`
	BucketReceiveLog string    `json:"bucket_receive_log,omitempty" db:"bucket_receive_log"`
	DestinationURL   string    `json:"destination_url,omitempty" db:"destination_url"`
	Headers          string    `json:"headers,omitempty" db:"headers"`
	Body             string    `json:"body,omitempty" db:"body"`
	StatusCode       int       `json:"status_code,omitempty" db:"status_code"`
	Created          time.Time `json:"created,omitempty" db:"created"`
	Updated          time.Time `json:"updated,omitempty" db:"updated"`
}

func init() {
	err := envconfig.Process("splay", &config)
	if err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}

	config.Commit = Commit

	var level slog.Level = slog.LevelInfo
	if config.Debug {
		level = slog.LevelDebug
	}

	h := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level})
	l := slog.New(h)
	slog.SetDefault(l)
	slog.Debug("Config", fmt.Sprintf("%+v", config))

	static, err = fs.Sub(AppDist, "app/dist")
	if err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}
}

func main() {
	app := pocketbase.New()
	app.OnServe().BindFunc(BindFunc(app, config))

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

func BindFunc(app *pocketbase.PocketBase, c Config) BoundFunc {
	return func(se *core.ServeEvent) error {
		se.Router.GET("/{path...}", apis.Static(static, true)).BindFunc(func(e *core.RequestEvent) error {
			// ignore root path
			if e.Request.PathValue(StaticWildcardParam) != "" {
				e.Response.Header().Set("Cache-Control", "max-age=1209600, stale-while-revalidate=86400")
			}

			// add a default CSP
			if e.Response.Header().Get("Content-Security-Policy") == "" {
				e.Response.Header().Set("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' http://127.0.0.1:* data: blob:; connect-src 'self' http://127.0.0.1:*; script-src 'self' 'sha256-GRUzBA7PzKYug7pqxv5rJaec5bwDCw1Vo6/IXwvD3Tc='")
			}
			return e.Next()
		}).Bind(apis.Gzip())

		se.Router.POST("/buckets/{slug}", HandleBucketReceive(app))

		return se.Next()
	}
}

type Bucket struct {
	ID          string `json:"id,omitempty" db:"id"`
	Slug        string `json:"slug,omitempty" db:"slug"`
	Name        string `json:"name,omitempty" db:"name"`
	Description string `json:"description,omitempty" db:"description"`
	UserID      string `json:"user_id,omitempty" db:"user"`
}

type ForwardSetting struct {
	ID       string `json:"id,omitempty" db:"id"`
	Name     string `json:"name,omitempty" db:"name"`
	URL      string `json:"url,omitempty" db:"url"`
	BucketID string `json:"bucket_id,omitempty" db:"bucket"`
}

func HandleBucketReceive(app *pocketbase.PocketBase) RequestFunc {
	return func(e *core.RequestEvent) error {
		slug := e.Request.PathValue("slug")

		b := Bucket{}
		err := app.DB().
			Select("id", "slug", "name", "description", "user").
			From("buckets").
			Where(dbx.NewExp("slug = {:slug}", dbx.Params{"slug": slug})).
			One(&b)
		if err != nil {
			return e.NotFoundError("bucket not found", errors.Join(ErrFetchingBucket, err))
		}

		decoder := json.NewDecoder(e.Request.Body)
		var body map[string]any
		if err = decoder.Decode(&body); err != nil {
			return e.BadRequestError("body is not json", errors.Join(ErrDecodingBody, err))
		}

		bb, err := json.Marshal(body)
		if err != nil {
			return e.InternalServerError("err marshalling json body", err)
		}

		hh, err := json.Marshal(e.Request.Header)
		if err != nil {
			return e.InternalServerError("err marshalling json headers", err)
		}

		created := time.Now()
		p := dbx.Params{
			"body":    string(bb),
			"headers": string(hh),
			"bucket":  b.ID,
			"created": created.Format(time.DateTime),
			"updated": created.Format(time.DateTime),
		}

		ip, err := GetIP(e.Request)
		if err == nil {
			p["ip"] = ip
		}

		receivedQuery := app.DB().NewQuery(insertBucketReceiveLog)
		receivedQuery.Prepare()
		defer receivedQuery.Close()

		receivedQuery.Bind(p)

		brl := BucketReceiveLog{}
		err = receivedQuery.One(&brl)
		if err != nil {
			return e.InternalServerError("could not insert bucket receive log", errors.Join(ErrInsertingReceiveLog, err))
		}

		ff := []ForwardSetting{}
		err = app.DB().
			Select("id", "name", "url", "bucket").
			From("forward_settings").
			Where(dbx.NewExp("bucket = {:bucket}", dbx.Params{"bucket": b.ID})).
			All(&ff)
		if err != nil {
			return e.InternalServerError("could not fetch forward settings", errors.Join(ErrFetchingForwardSettings, err))
		}

		for _, f := range ff {
			go func() {
				// Running ForwardLog in a goroutine to avoid blocking the request and avoiding the error
				_ = ForwardLog(app, e, &brl, f.URL, ip, hh, bb)
			}()
		}

		return e.JSON(http.StatusOK, map[string]string{"success": "true"})
	}
}

func ForwardLog(app *pocketbase.PocketBase, e *core.RequestEvent, brl *BucketReceiveLog, url, ip string, headers, body []byte) error {
	req, err := http.NewRequestWithContext(context.Background(), http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return errors.Join(ErrCreatingRequest, err)
	}

	req.Header = make(http.Header)
	if err = json.Unmarshal(headers, &req.Header); err != nil {
		return errors.Join(ErrDecodingHeaders, err)
	}

	req.Header.Add(XForwardedFor, ip)

	resp, err := httpClient.Do(req)
	if err != nil {
		return errors.Join(ErrForwardingRequest, err)
	}
	defer resp.Body.Close()

	statusOK := resp.StatusCode >= StatusOkBot && resp.StatusCode < StatusOkTop
	if !statusOK {
		app.Logger().Debug("Forwarding request failed", fmt.Sprintf("status code: %d", resp.StatusCode))
	}

	created := time.Now().Format(time.DateTime)
	p := dbx.Params{
		"bucket":             brl.Bucket,
		"bucket_receive_log": brl.ID,
		"destination_url":    url,
		"body":               string(body),
		"headers":            string(headers),
		"status_code":        resp.StatusCode,
		"created":            created,
		"updated":            created,
	}

	forwardQuery := app.DB().NewQuery(insertBucketForwardLog)
	forwardQuery.Prepare()
	defer forwardQuery.Close()

	forwardQuery.Bind(p)
	if _, err = forwardQuery.Execute(); err != nil {
		return errors.Join(ErrInsertingForwardLog, err)
	}

	return nil
}

func GetIP(r *http.Request) (string, error) {
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		return forwarded, nil
	}

	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return "", err
	}

	return ip, nil
}
