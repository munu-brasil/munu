package id

import (
	"math/rand"
	"strings"

	"time"

	bc "github.com/chtison/baseconverter"
	"github.com/speps/go-hashids/v2"
)

var (
	a = "abcdefghijklmnopqrstuvwxyz0123456789"
	z = "\uFEFF\u200B\u200A\u2009\u2008"
	r = rand.New(rand.NewSource(time.Now().UTC().UnixNano()))
)

func EncodeID(id string) (string, error) {
	c, err, err2 := bc.BaseToBase(id, a, z)
	if err != nil {
		return "", err
	}
	if err2 != nil {
		return "", err2
	}
	return c, nil
}

func DecodeID(id string) (string, error) {
	c, err, err2 := bc.BaseToBase(id, z, a)
	if err != nil {
		return "", err
	}
	if err2 != nil {
		return "", err2
	}
	return c, nil
}

func GenerateID() (string, error) {
	hd := hashids.NewData()
	hd.Alphabet = a
	hd.Salt = "communa"
	hd.MinLength = 6
	h, err := hashids.NewWithData(hd)
	if err != nil {
		return "", err
	}
	id, err := h.Encode([]int{r.Intn(999), int(time.Now().Unix() / 1000), r.Intn(999)})
	if err != nil {
		return "", err
	}

	return strings.Join([]string{id[0:3], id[3:7], id[7:]}, "-"), err
}

func FindID(id string) []string {
	ids := []string{}

	for _, c := range []rune(id) {
		col := []rune{}
		for _, r := range []rune(z) {
			if r == c {
				col = append(col, c)
			}
		}
		ids = append(ids, string(col))
	}
	return ids
}
