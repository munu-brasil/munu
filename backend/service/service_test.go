package service

import (
	"encoding/json"
	"testing"
)

type message struct {
	From    string              `json:"from"`
	To      QueryParams[string] `json:"to"`
	Message string              `json:"message"`
}

func TestTo(t *testing.T) {

	jsonMsg := []byte(`{ "from": "me", "to": "you",  "message": "hello you" }`)
	var msg message

	err := json.Unmarshal(jsonMsg, &msg)

	if err != nil {
		t.Error(err)
	}
}
