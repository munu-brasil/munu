package mailmaid

import (
	"encoding/json"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/sergi/go-diff/diffmatchpatch"
)

func TestTemplateTable(t *testing.T) {
	type row struct {
		ColumnA int `json:"column a is very long âÃ"`
		ColumnB string
		ColumnC time.Time `align:"right"`
	}
	now := time.Now()
	table := []row{{ColumnA: 10, ColumnB: "lets go", ColumnC: now}}
	tab := NewTable(table)
	jsonNow, _ := json.Marshal(now)
	expected := "<table style=\"background-color: #f5f5f5; border-radius: 5px;\">\n\t<tr\n\t\tstyle=\"\n\t\tborder-bottom-width: 1px;\n\t\tborder-bottom-style: solid;\n\t\tborder-color: #fff;\n\t\t\"\n\t>\n\t\t\n\t\t\t<th\n\t\t\tstyle=\"\n\t\t\t\tpadding: 10px 40px;\n\t\t\t\tcolor: #000;\n\t\t\t\tborder-bottom-width: 1px;\n\t\t\t\tborder-bottom-style: solid;\n\t\t\t\tborder-color: #fff;\n\t\t\t\ttext-align: center;\n\t\t\t\"\n\t\t\t>\n\t\t\tcolumn a is very long âÃ\n\t\t\t</th>\n\t\t\n\t\t\t<th\n\t\t\tstyle=\"\n\t\t\t\tpadding: 10px 40px;\n\t\t\t\tcolor: #000;\n\t\t\t\tborder-bottom-width: 1px;\n\t\t\t\tborder-bottom-style: solid;\n\t\t\t\tborder-color: #fff;\n\t\t\t\ttext-align: center;\n\t\t\t\"\n\t\t\t>\n\t\t\tColumnB\n\t\t\t</th>\n\t\t\n\t\t\t<th\n\t\t\tstyle=\"\n\t\t\t\tpadding: 10px 40px;\n\t\t\t\tcolor: #000;\n\t\t\t\tborder-bottom-width: 1px;\n\t\t\t\tborder-bottom-style: solid;\n\t\t\t\tborder-color: #fff;\n\t\t\t\ttext-align: center;\n\t\t\t\"\n\t\t\t>\n\t\t\tColumnC\n\t\t\t</th>\n\t\t\n\t</tr>\n\t\n\t\t<tr\n\t\tstyle=\"\n\t\t\tborder-bottom-width: 1px;\n\t\t\tborder-bottom-style: solid;\n\t\t\tborder-color: #fff;\n\t\t\tcolor: black;\n\t\t\"\n\t\t>\n\t\t\n\t\t\t<td style=\"font-size: 10px; text-align: center;\">\n\t\t\t\t10\n\t\t\t</td>\n\t\t\n\t\t\t<td style=\"font-size: 10px; text-align: center;\">\n\t\t\t\tlets go\n\t\t\t</td>\n\t\t\n\t\t\t<td style=\"font-size: 10px; text-align: right;\">\n\t\t\t\t" + strings.Trim(string(jsonNow), "\"") + "\n\t\t\t</td>\n\t\t\n\t\t</tr>\n\t\n</table>\n"

	if string(tab) != expected {
		t.Error("Unexpected template render")
		dmp := diffmatchpatch.New()
		diffs := dmp.DiffMain(string(tab), expected, false)
		fmt.Println(dmp.DiffPrettyText(diffs))
	}
}
