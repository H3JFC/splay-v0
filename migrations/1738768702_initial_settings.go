package migrations

import (
	"strings"

	"github.com/kelseyhightower/envconfig"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

type Config struct {
	Env          string `default:"development"`
	LogLevel     string `default:"info" split_words:"true"`
	LogRetention int    `default:"7" split_words:"true"`
	OrgName      string `default:""  split_words:"true"`
	SlugName     string `default:""  split_words:"true"`
	SMTPEnabled  bool   `default:"false" envconfig:"smtp_enabled"`
	SMTPPort     int    `default:"587" envconfig:"smtp_port"`
	SMTPHost     string `default:"" envconfig:"smtp_host"`
	SMTPUsername string `default:"" envconfig:"smtp_username"`
	SMTPPassword string `default:"" envconfig:"smtp_password"`
}

func (c *Config) LogLevelInt() int {
	switch strings.ToUpper(c.LogLevel) {
	case "DEBUG":
		return -4
	case "INFO":
		return 0
	case "WARN":
		return 4
	case "ERROR":
		return 8
	default:
		return 0
	}
}

func (c *Config) LogDays() int {
	if c.LogRetention < 0 {
		return 7
	}

	return c.LogRetention
}

func (c *Config) AppName() string {
	return strings.TrimLeft(c.OrgName+" Splay App", " ")
}

func (c *Config) AppURL() string {
	if c.Env == "development" {
		return "http://localhost:8090"
	}

	return c.SlugName + ".splay.sh"
}

func (c *Config) SenderName() string {
	return ""
}

func (c *Config) SenderAddress() string {
	return ""
}

var (
	config Config
)

func init() {
	err := envconfig.Process("splay", &config)
	if err != nil {
		panic(err)
	}

	m.Register(func(app core.App) error {
		settings := app.Settings()
		settings.Meta.AppName = config.AppName()
		settings.Meta.AppURL = config.AppURL()
		settings.Logs.MaxDays = config.LogDays()
		settings.Logs.MinLevel = config.LogLevelInt()
		settings.RateLimits.Enabled = true
		settings.RateLimits.Rules = append(settings.RateLimits.Rules, core.RateLimitRule{
			Label:       "/buckets/",
			Audience:    "",
			Duration:    3,
			MaxRequests: 150,
		})

		if config.SMTPEnabled {
			settings.Meta.SenderName = config.SenderName()
			settings.Meta.SenderAddress = config.SenderAddress()
			settings.SMTP.Enabled = true
			settings.SMTP.Port = config.SMTPPort
			settings.SMTP.Host = config.SMTPHost
			settings.SMTP.Username = config.SMTPUsername
			settings.SMTP.Password = config.SMTPPassword
		}

		return app.Save(settings)
	}, func(app core.App) error {
		return nil
	})
}
