package cte

import (
	"testing"

	sq "github.com/munu-brasil/munu/backend/lib/sqrl"
)

func TestCTEFromString(t *testing.T) {
	_, err := CTEFromString("test", `select aa, bb, a.c, 1 +2 as res, 4/ 4 from (select * from nothing) a `, nil)
	if err == nil {
		t.Errorf("should fail to accept %s as column name", "4/ 4")
	}

	stringCTE, err := CTEFromString("teste", `select aa, bb, a.c, 1 +2 as res, 4/ 4 as ok from any_table`, nil)
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}
	if stringCTE != nil && len(stringCTE.Columns()) != 5 {
		t.Errorf("wrong number of columns, expected 5, got %d", len(stringCTE.Columns()))
	}

	argsCTE, err := CTEFromString("arguments", `
	SELECT
		$1::int8 AS prin_id,
		pp.plli_id,
		pp.sort_order
	FROM product_playlist pp
	WHERE prin_id = $2::int8
`, []interface{}{123, 321})
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}
	if len(argsCTE.Columns()) != 3 {
		t.Errorf("wrong number of columns, expected 3, got %d", len(argsCTE.Columns()))
	}
}

func TestCTEFromSelectBuilder(t *testing.T) {
	builder1 := sq.Select("'abc' AS col1", "'xyz' AS col2").
		From("test").
		Where(sq.Eq{"1": "1"})

	_, err := CTEFromSelectBuilder("test_cte", builder1)
	if err == nil {
		t.Errorf("should fail to accept queries with place holder format question")
	}

	testCTE, err := CTEFromSelectBuilder("test_cte", builder1.PlaceholderFormat(sq.Dollar))
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}
	if testCTE != nil && len(testCTE.Columns()) != 2 {
		t.Errorf("wrong number of columns, expected 2, got %d", len(testCTE.Columns()))
	}

}

func TestCTEFromUpdateBuilder(t *testing.T) {
	builder1 := sq.Update("test").
		Set("col1", "abc").
		Set("col2", "xyz").
		Returning("col1", "col2")

	_, err := CTEFromUpdateBuilder("test_cte", builder1)
	if err == nil {
		t.Errorf("should fail to accept queries with place holder format question")
	}

	testCTE, err := CTEFromUpdateBuilder("test_cte", builder1.PlaceholderFormat(sq.Dollar))
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}
	if testCTE != nil && len(testCTE.Columns()) != 2 {
		t.Errorf("wrong number of columns, expected 2, got %d", len(testCTE.Columns()))
	}

	builder2 := sq.Update("test").
		Set("col1", "abc").
		Set("col2", "xyz").
		PlaceholderFormat(sq.Dollar)

	testCTE2, err := CTEFromUpdateBuilder("test_cte_2", builder2)
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}
	if testCTE2 != nil && len(testCTE2.Columns()) != 0 {
		t.Errorf("wrong number of columns, expected 0, got %d", len(testCTE.Columns()))
	}

	builder3 := sq.Update("test").
		Set("col1", "abc").
		Set("col2", "xyz").
		Suffix("RETURNING col1, col2").
		PlaceholderFormat(sq.Dollar)

	testCTE3, err := CTEFromUpdateBuilder("test_cte", builder3)
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}
	if testCTE3 != nil && len(testCTE3.Columns()) != 2 {
		t.Errorf("wrong number of columns, expected 2, got %d", len(testCTE3.Columns()))
	}

}

func TestCTEFromDeleteBuilder(t *testing.T) {
	builder1 := sq.Delete("test").
		Where(sq.Eq{"1": "1"}).
		Returning("col1", "col2")

	_, err := CTEFromDeleteBuilder("test_cte", builder1)
	if err == nil {
		t.Errorf("should fail to accept queries with place holder format question")
	}

	testCTE, err := CTEFromDeleteBuilder("test_cte", builder1.PlaceholderFormat(sq.Dollar))
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}
	if testCTE != nil && len(testCTE.Columns()) != 2 {
		t.Errorf("wrong number of columns, expected 2, got %d", len(testCTE.Columns()))
	}

	builder2 := sq.Delete("test").
		Where(sq.Eq{"1": "1"}).
		PlaceholderFormat(sq.Dollar)

	testCTE2, err := CTEFromDeleteBuilder("test_cte_2", builder2)
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}
	if testCTE2 != nil && len(testCTE2.Columns()) != 0 {
		t.Errorf("wrong number of columns, expected 0, got %d", len(testCTE.Columns()))
	}

	builder3 := sq.Delete("test").
		Where(sq.Eq{"1": "1"}).
		Suffix("RETURNING col1, col2").
		PlaceholderFormat(sq.Dollar)

	testCTE3, err := CTEFromDeleteBuilder("test_cte", builder3)
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}
	if testCTE3 != nil && len(testCTE3.Columns()) != 2 {
		t.Errorf("wrong number of columns, expected 2, got %d", len(testCTE3.Columns()))
	}

}

func TestCTEFromInsertBuilder(t *testing.T) {
	builder1 := sq.Insert("test").Columns("col1", "col2").
		Select(sq.Select("'abc' AS col1", "'xyz' AS col2").
			From("test")).
		Returning("col1", "col2")

	testCTE, err := CTEFromInsertBuilder("test_cte", builder1)
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}
	if testCTE != nil && len(testCTE.Columns()) != 2 {
		t.Errorf("wrong number of columns, expected 2, got %d", len(testCTE.Columns()))
	}

	builder2 := sq.Insert("test").Columns("col1", "col2").
		Select(sq.Select("'abc' AS col1", "'xyz' AS col2").
			From("test"))

	testCTE2, err := CTEFromInsertBuilder("test_cte_2", builder2)
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}
	if testCTE2 != nil && len(testCTE2.Columns()) != 0 {
		t.Errorf("wrong number of columns, expected 0, got %d", len(testCTE.Columns()))
	}

	builder3 := sq.Insert("test").Columns("col1", "col2").Values("'abc'", "'xyz'").Returning("col1", "col2")

	_, err = CTEFromInsertBuilder("test_cte_3", builder3)
	if err == nil {
		t.Errorf("should fail to accept queries with place holder format question")
	}

	testCTE3, err := CTEFromInsertBuilder("test_cte_3", builder3.PlaceholderFormat(sq.Dollar))
	if err != nil {
		t.Error("unexpected error for valid query:", err)
	}
	if testCTE3 != nil && len(testCTE3.Columns()) != 2 {
		t.Errorf("wrong number of columns, expected 2, got %d", len(testCTE3.Columns()))
	}
}
