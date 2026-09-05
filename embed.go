package nawasena

import "embed"

//go:embed data/*
var DataFS embed.FS

//go:embed web/dist/*
//go:embed web/dist/assets/*
var WebFS embed.FS
