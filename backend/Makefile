mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(dir $(mkfile_path))
CMDprepareTest := go run tools/prepare_tests/prepare_tests.go -file $(current_dir)test.env
CMDRunTest := go run tools/run_tests/run_tests.go -file $(current_dir)test.env
CC := gcc

# Check the operating system and set the proper commands
ifeq ($(OS),Windows_NT)
	# Windows
	RM := powershell -command rm -r
	PREPARE_TEST_CMD := powershell -command "$(CMDprepareTest)"
	RUN_TEST_CMD := powershell -command "$(CMDRunTest)"
	BUILD_LINUX_BACKEND_CMD := $Env:GOOS = "linux"; $Env:GOARCH = "amd64"; go build -o $(current_dir)/builds/reportdev .\main.go
else
	UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Darwin)
		# macOS
		RM := rm -f
		PREPARE_TEST_CMD := $(CMDprepareTest)
		RUN_TEST_CMD := $(CMDRunTest)
		BUILD_LINUX_BACKEND_CMD := GOOS=linux GOARCH=amd64 go build -o $(current_dir)/builds/reportdev ./main.go
	else
		# Linux (and other Unix-like systems)
		RM := rm -f
		PREPARE_TEST_CMD := $(CMDprepareTest)
		RUN_TEST_CMD := $(CMDRunTest)
		BUILD_LINUX_BACKEND_CMD := GOOS=linux GOARCH=amd64 go build -o $(current_dir)/builds/reportdev ./main.go
	endif
endif

.PHONY: main prepare-test run-test build-linux-backend docs generate-zod-docs build release-pr dev worker

main:
	echo "select make action"

prepare-test:
	cd .. && go install github.com/allaboutapps/integresql/cmd/server@latest
	$(PREPARE_TEST_CMD)

run-test:
	cd .. && $(RUN_TEST_CMD)

build-linux-backend:
	$(BUILD_LINUX_BACKEND_CMD)

docs:
	go run main.go openapi --generate_api_file

generate-zod-docs: docs
	npx --yes openapi-zod-client -a ./munu.json -o ../frontend/packages/core-lib/src/api/zodios/munu.ts
	$(RM) ./munu.json

build: build-linux-backend

release-pr:
	go run tools/git_release/git_release.go -repo munu-brasil/munu

dev: generate-zod-docs

	go run .\main.go serve --config=./config.yml