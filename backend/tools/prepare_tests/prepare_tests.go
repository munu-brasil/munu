package main

import (
	"errors"
	"flag"
	"fmt"
	"log"
	"os"
	"runtime"
	"strconv"
	"strings"
)

var file = flag.String("file", ".env", "env file to parse")

func main() {
	flag.Parse()

	parsed := []string{}

	content, err := os.ReadFile(*file)
	if err != nil {
		log.Fatalln(err)
	}
	lines := strings.Split(string(content), "\r\n")
	for i, line := range lines {
		if strings.HasPrefix(line, "#") {
			continue
		}
		kv := strings.Split(line, "=")
		if len(kv) < 2 {
			log.Fatalln(errors.New("couldn't parse line: " + strconv.Itoa(i+1)))
		}
		if runtime.GOOS == "windows" {
			parsed = append(parsed, fmt.Sprintf("$$env:%s=\"%s\"", kv[0], strings.Join(kv[1:], "")))
		} else {
			parsed = append(parsed, fmt.Sprintf("%s=\"%s\"", kv[0], strings.Join(kv[1:], "")))
		}
	}

	if runtime.GOOS == "windows" {
		fmt.Print(strings.Join(parsed, "; ") + "; server")
	} else {
		fmt.Print(strings.Join(parsed, " ") + " server")
	}
}
