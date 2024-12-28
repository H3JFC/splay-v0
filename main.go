package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"splay/ui"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

var (
	ErrFetchingBucket      = errors.New("Error fetching bucket")
	ErrInsertingReceiveLog = errors.New("Error inserting bucket receive log")
	ErrDecodingBody        = errors.New("Error decoding request body into json")
	ErrDecodingHeaders     = errors.New("Error decoding request headers into json")
)

type BoundFunc = func(e *core.ServeEvent) error

func main() {
	app := pocketbase.New()
	app.OnServe().BindFunc(BindFunc(app))

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

type Bucket struct {
	Id          string `json:"id,omitempty" db:"id"`
	Slug        string `json:"slug,omitempty" db:"slug"`
	Name        string `json:"name,omitempty" db:"name"`
	Description string `json:"description,omitempty" db:"description"`
	UserID      string `json:"user_id,omitempty" db:"user"`
}

func BindFunc(app *pocketbase.PocketBase) BoundFunc {
	return func(se *core.ServeEvent) error {
		se.Router.GET("/", func(e *core.RequestEvent) error {
			html := &strings.Builder{}
			if err := ui.Hello("hector").Render(context.Background(), html); err != nil {
				return e.NotFoundError("", err)
			}

			return e.HTML(http.StatusOK, html.String())
		})

		se.Router.POST("/buckets/{slug}", func(e *core.RequestEvent) error {
			slug := e.Request.PathValue("slug")

			b := Bucket{}
			err := app.DB().
				Select("id", "slug", "name", "description", "user").
				From("buckets").
				Where(dbx.NewExp("slug = {:slug}", dbx.Params{"slug": slug})).
				One(&b)
			if err != nil {
				err = errors.Join(ErrFetchingBucket, err)
				return e.NotFoundError("", err)
			}

			app.Logger().Info(fmt.Sprintf("Bucket: %+v\n", b))

			decoder := json.NewDecoder(e.Request.Body)
			var body map[string]any
			if err = decoder.Decode(&body); err != nil {
				err = errors.Join(ErrDecodingBody, err)
				return e.BadRequestError("body is not json", err)
			}

			bb, err := json.Marshal(body)
			if err != nil {
				return e.InternalServerError("err marshalling json body", err)
			}

			hh, err := json.Marshal(e.Request.Header)
			if err != nil {
				return e.InternalServerError("err marshalling json headers", err)
			}

			p := dbx.Params{
				"body":    string(bb),
				"headers": string(hh),
				"bucket":  b.Id,
			}

			if ip, err := GetIP(e.Request); err == nil {
				p["ip"] = ip
			}

			_, err = app.DB().Insert("bucket_receive_logs", p).Execute()
			if err != nil {
				err = errors.Join(ErrInsertingReceiveLog, err)

				app.Logger().Error(err.Error())
				return e.InternalServerError("", ErrInsertingReceiveLog)
			}

			return e.JSON(http.StatusOK, map[string]string{"success": "true"})
		})

		return se.Next()
	}
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
