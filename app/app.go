// Package app
package app

import "embed"

// Dist is where the static files are stored
//
//go:embed dist/*
var Dist embed.FS
