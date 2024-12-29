package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"time"
)

const (
	httpReadTimeout  = 5 * time.Second
	httpWriteTimeout = 10 * time.Second
	defaultHost      = "127.0.0.1"
	defaultPort      = 9090
)

func main() {
	host := flag.String("host", defaultHost, "Host to listen on")
	port := flag.Int("port", defaultPort, "Port to listen on")
	flag.Parse()

	addr := fmt.Sprintf("%s:%d", *host, *port)
	log.Printf("Starting server on %s\n", addr)

	srv := &http.Server{
		Addr:         addr,
		ReadTimeout:  httpReadTimeout,
		WriteTimeout: httpWriteTimeout,
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()

		var mm map[string]any
		if err := json.NewDecoder(r.Body).Decode(&mm); err != nil {
			panic(err)
		}

		log.Printf("Request received for %s, body: %+v, header: %+v", r.URL.Path, mm, r.Header)
	})

	srv.Handler = http.DefaultServeMux
	if err := srv.ListenAndServe(); err != nil {
		fmt.Printf("Error starting server: %s\n", err)
	}
}
