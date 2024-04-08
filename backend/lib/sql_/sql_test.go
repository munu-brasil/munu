package sql_

import (
	"strings"
	"testing"
	"time"

	"github.com/munu-brasil/munu/backend/internal/test"
	sq "github.com/munu-brasil/munu/backend/lib/sqrl"
	"github.com/sergi/go-diff/diffmatchpatch"
	"gopkg.in/guregu/null.v3"
)

func TestUnion(t *testing.T) {
	builder1 := sq.Select("'abc' AS col1", "'xyz' AS col2")
	builder2 := sq.Select("'123' AS col1", "'891' AS col2")
	result := "SELECT 'abc' AS col1, 'xyz' AS col2  UNION SELECT '123' AS col1, '891' AS col2"

	b, err := Union(builder1, builder2)
	if err != nil {
		t.Error("unexpected error for valid union:", err)
	}

	qSQL, args, err := b.ToSql()
	if err != nil {
		t.Error("unexpected error for valid union:", err)
	}

	if qSQL != result {
		t.Errorf("expected %s, got %s", result, qSQL)
	}

	if len(args) != 0 {
		t.Errorf("expected args length of 0, got %d", len(args))
	}
}

func TestJoinSelect(t *testing.T) {
	builder1 := sq.Select("'abc' AS col1")
	builder2 := sq.Select("'abc' AS col1", "'xyz' AS col2")
	builder3 := sq.Select("s1.col1", "s2.col2").FromSelect(builder1, "s1")
	result := "SELECT s1.col1, s2.col2 FROM (SELECT 'abc' AS col1) AS s1 JOIN ( SELECT 'abc' AS col1, 'xyz' AS col2 )  AS s2 USING(col1)"

	b, err := JoinSelect(builder3, builder2, " AS s2 USING(col1)")
	if err != nil {
		t.Error("unexpected error for valid union:", err)
	}

	qSQL, args, err := b.ToSql()
	if err != nil {
		t.Error("unexpected error for valid union:", err)
	}

	if qSQL != result {
		t.Errorf("expected %s, got %s", result, qSQL)
	}

	if len(args) != 0 {
		t.Errorf("expected args length of 0, got %d", len(args))
	}
}

func TestUpdateWhereInSelect(t *testing.T) {
	builder1 := sq.Update("test").
		Set("col1", "abc").
		Set("col2", "xyz").
		Returning("col1", "col2")
	builder2 := sq.Select("'abc' AS col1")
	result := "UPDATE test SET col1 = ?, col2 = ? WHERE col1 IN ( SELECT 'abc' AS col1 ) RETURNING col1, col2"

	b, err := UpdateWhereInSelect(builder1, "col1", builder2)
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}

	qSQL, args, err := b.ToSql()
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}

	if qSQL != result {
		t.Errorf("expected %s, got %s", result, qSQL)
	}

	if len(args) != 2 {
		t.Errorf("expected args length of 2, got %d", len(args))
	}
}

func TestUnsuportedSQL(t *testing.T) {
	args := []interface{}{"df3db005-779b-4e75-bd33-4c36146e7dab", "cbl8as1n6933tj6pt0jg", "cbug2vhn69345p5uim2g"}
	sql := `WITH
	write_appointment_attachment_permission_cte AS (SELECT DISTINCT appo_id, user_id FROM (SELECT appo_id, user_id FROM appointment WHERE user_id = 'df3db005-779b-4e75-bd33-4c36146e7dab' AND appo_id = '%!s(*string=0xc001904c00)'  UNION ALL SELECT appo_id, doc.user_id FROM appointment_settings JOIN doctor doc USING(doct_id)  WHERE doc.user_id = 'df3db005-779b-4e75-bd33-4c36146e7dab' AND appo_id = '%!s(*string=0xc001904c00)'  UNION ALL SELECT null AS appo_id, null AS user_id WHERE 1<>1  UNION ALL SELECT null AS appo_id, null AS user_id WHERE 1<>1) AS valid_appo_id WHERE appo_id IS NOT NULL),
	write_document_permission_cte AS (SELECT DISTINCT docu_id, user_id FROM (SELECT docu_id, pat.user_id FROM "document" JOIN patient_document pd USING(docu_id)  JOIN patient pat USING(pati_id)  WHERE pat.user_id = 'df3db005-779b-4e75-bd33-4c36146e7dab'  UNION ALL SELECT null AS docu_id, null AS user_id WHERE 1<>1  UNION ALL SELECT docu_id, doc.user_id FROM "document" JOIN doctor_document d USING(docu_id)  JOIN doctor doc USING(doct_id)  WHERE doc.user_id = 'df3db005-779b-4e75-bd33-4c36146e7dab'  UNION ALL SELECT null AS docu_id, null AS user_id WHERE 1<>1  UNION ALL SELECT null AS docu_id, null AS user_id WHERE 1<>1) AS valid_docu_id)
	 INSERT INTO appointment_document (appo_id,docu_id) SELECT appo_id, docu_id FROM write_appointment_attachment_permission_cte, write_document_permission_cte WHERE appo_id = 'cbl8as1n6933tj6pt0jg' AND docu_id = 'cbug2vhn69345p5uim2g' RETURNING appo_id, 'document' as resource, docu_id as resource_id`

	res := DebugQuery(sql, args)
	if len(strings.Split(res, "\n")) != 4 {
		t.Error("unexpected query format")
	}
}

func TestFormatArguments(t *testing.T) {
	dt, err := time.Parse("2006-01-02", "2019-01-31")
	if err != nil {
		t.Error("unexpected error:", err)
	}
	var strPtr *string
	vals := []struct {
		arg      interface{}
		expected string
	}{
		/*0*/ {arg: 10, expected: "10"},
		/*1*/ {arg: test.IntPtr(10), expected: "10"},
		/*2*/ {arg: uint8(10), expected: "10"},
		/*3*/ {arg: float64(10), expected: "10.000000"},
		/*4*/ {arg: test.FloatPtr(float64(10)), expected: "10.000000"},
		/*5*/ {arg: true, expected: "true"},
		/*6*/ {arg: test.BoolPtr(false), expected: "false"},
		/*7*/ {arg: "10", expected: "'10'"},
		/*8*/ {arg: test.StrPtr("10"), expected: "'10'"},
		/*9*/ {arg: dt, expected: "'2019-01-31T00:00:00Z'"},
		/*10*/ {arg: null.TimeFrom(dt), expected: "'2019-01-31T00:00:00Z'"},
		/*11*/ {arg: nil, expected: "NULL"},
		/*12*/ {arg: strPtr, expected: "NULL"},
	}

	qsql := "SELECT $1"
	esql := `
   SELECT
     $1
`

	for i, v := range vals {
		res := DebugQuery(qsql, []interface{}{v.arg})
		if strings.Replace(esql, "$1", v.expected, 1) != res {
			e := strings.Replace(esql, "$1", "", 1)
			t.Errorf("[%d] expected %s, got %s", i, v.expected, strings.ReplaceAll(res, e, ""))
		}
	}
}

func TestPaginationLastID(t *testing.T) {
	s := PaginationAfterID(NewAfterID("sc1.prod_id", "!=", "ppg.prod_id"),
		NewPaginationOrder("ts_rank(search_text_simple, websearch_to_tsquery('simple', arg.text_param))", "<=", "ppg.rank_0"),
		NewPaginationOrder("ts_rank( search_text, websearch_to_tsquery ( 'portuguese', arg.text_param ) )", "<=", "ppg.rank_1"),
		NewPaginationOrder("ts_rank( search_text, to_tsquery( 'portuguese', split_part( websearch_to_tsquery ( 'portuguese', 'pessoa preta' )::TEXT, ' '::TEXT, 1) ) )", "<=", "ppg.rank_2"),
		NewPaginationOrder("sc1.created_at", "<=", "ppg.created_at"),
	)
	expected := strings.ReplaceAll(`ppg.prod_id <> sc1.prod_id|||AND ts_rank(search_text_simple, websearch_to_tsquery('simple', arg.text_param)) <= ppg.rank_0|||AND CASE WHEN|||ts_rank(search_text_simple, websearch_to_tsquery('simple', arg.text_param)) = ppg.rank_0 |||THEN ts_rank( search_text, websearch_to_tsquery ( 'portuguese', arg.text_param ) ) <= ppg.rank_1 ELSE TRUE END|||AND CASE WHEN|||ts_rank(search_text_simple, websearch_to_tsquery('simple', arg.text_param)) = ppg.rank_0 |||AND ts_rank( search_text, websearch_to_tsquery ( 'portuguese', arg.text_param ) ) = ppg.rank_1 |||THEN ts_rank( search_text, to_tsquery( 'portuguese', split_part( websearch_to_tsquery ( 'portuguese', 'pessoa preta' )::TEXT, ' '::TEXT, 1) ) ) <= ppg.rank_2 ELSE TRUE END|||AND CASE WHEN|||ts_rank(search_text_simple, websearch_to_tsquery('simple', arg.text_param)) = ppg.rank_0 |||AND ts_rank( search_text, websearch_to_tsquery ( 'portuguese', arg.text_param ) ) = ppg.rank_1 |||AND ts_rank( search_text, to_tsquery( 'portuguese', split_part( websearch_to_tsquery ( 'portuguese', 'pessoa preta' )::TEXT, ' '::TEXT, 1) ) ) = ppg.rank_2 |||THEN sc1.created_at <= ppg.created_at ELSE TRUE END|||`, "|||", "\n")
	if s != expected {
		dmp := diffmatchpatch.New()

		diffs := dmp.DiffMain(expected, s, false)

		t.Errorf(dmp.DiffPrettyText(diffs))
	}
}
