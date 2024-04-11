package md

import (
	"strings"

	"github.com/microcosm-cc/bluemonday"
)

func SanitizeMarkdown(text string) string {
	mdtext := strings.ReplaceAll(text, "\\<", "&#60;")
	p := bluemonday.StrictPolicy()
	return p.Sanitize(mdtext)
}
