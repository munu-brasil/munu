package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/url"
	"os"
	"os/exec"
	"regexp"
	"runtime"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
	"github.com/shurcooL/githubv4"
	"golang.org/x/oauth2"
)

var envsFlag = flag.String("envs", "", "environment variables .env")

func openbrowser(url string) {
	var err error

	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		err = fmt.Errorf("unsupported platform")
	}
	if err != nil {
		fmt.Println(err)
	}
}

func prUrl(branch string) string {
	baseUrl := "https://github.com"
	repo := os.Getenv("GITHUB_REPO")
	return baseUrl + "/" + repo + "/compare/master..." + branch + "?template=release.md&expand=1"
}

func openPRInBrowser() {
	exec.Command("git", "fetch", "-all").Run()
	args := []string{"for-each-ref", "--sort=-committerdate", "refs/heads", "refs/remotes", "--format=%(color:yellow)%(refname:short)%(color:reset)"}
	cmd := exec.Command("git", args...)
	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		fmt.Println(err)
	}
	releaseFiles := strings.Split(out.String(), "\n")
	for _, branch := range releaseFiles {
		strings.Replace(branch, "origin/release/", "release/", 1)
		if strings.Contains(branch, "release/") {
			openbrowser(prUrl(branch))
			break
		}
	}
}

type Issue struct {
	Number int
	Title  string
}

func getIssuesFromPullRequest(pullRequestID int) []Issue {
	fmt.Println("getIssuesFromPullRequest #", pullRequestID)
	src := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: os.Getenv("GRAPHQL_TOKEN")})
	httpClient := oauth2.NewClient(context.Background(), src)
	client := githubv4.NewClient(httpClient)

	var query struct {
		Resource struct {
			PullRequest struct {
				TimelineItems struct {
					Nodes []struct {
						ConnectedEvent struct {
							ID      githubv4.String
							Subject struct {
								Issue struct {
									Number githubv4.Int
									Title  githubv4.String
								} `graphql:"... on Issue"`
							} `graphql:"subject"`
						} `graphql:"... on ConnectedEvent"`
						DisconnectedEvent struct {
							ID      githubv4.String
							Subject struct {
								Issue struct {
									Number githubv4.Int
									Title  githubv4.String
								} `graphql:"... on Issue"`
							} `graphql:"subject"`
						} `graphql:"... on DisconnectedEvent"`
					} `graphql:"nodes"`
				} `graphql:"timelineItems(itemTypes: [CONNECTED_EVENT, DISCONNECTED_EVENT], first: 100)"`
			} `graphql:"... on PullRequest"`
		} `graphql:"resource(url: $url)"`
	}
	repo := os.Getenv("GITHUB_REPO")
	parsedURL, err := url.Parse(fmt.Sprintf("https://github.com/%s/pull/%d", repo, pullRequestID))
	if err != nil {
		log.Fatal(err)
	}
	variables := map[string]interface{}{
		"url": githubv4.URI{URL: parsedURL},
	}
	err = client.Query(context.Background(), &query, variables)
	if err != nil {
		fmt.Println("failed to get issues")
		log.Fatal(err)
	}

	issues := []Issue{}
	for _, node := range query.Resource.PullRequest.TimelineItems.Nodes {
		number := int(node.ConnectedEvent.Subject.Issue.Number)
		title := string(node.ConnectedEvent.Subject.Issue.Title)
		issues = append(issues, Issue{Number: number, Title: title})
	}
	return issues
}

func extractPullRequestID(commitMessage string) (int, error) {
	re := regexp.MustCompile(`Merge pull request #(\d+)`)
	matches := re.FindStringSubmatch(commitMessage)
	if len(matches) < 2 {
		return 0, fmt.Errorf("failed to extract pull request ID")
	}

	return strconv.Atoi(matches[1])
}

func generateReleaseText() {
	fmt.Println("generateReleaseText")
	args := []string{"log", "--merges", "--oneline", "--grep=Merge pull request #", "--decorate", "origin/develop"}
	cmd := exec.Command("git", args...)
	var pulls bytes.Buffer
	cmd.Stdout = &pulls

	if err := cmd.Run(); err != nil {
		fmt.Println(err)
	}

	re := regexp.MustCompile(`[a-z0-9]{8} \(.*?master.*?\)`)
	submatches := re.Split(pulls.String(), -1)
	developPulls := ""
	if len(submatches) > 0 {
		re := regexp.MustCompile(`\(.*?origin\/develop.*?\)`)
		developPulls = re.ReplaceAllString(submatches[0], "")
	}

	releaseText := "### Release issues:\n"
	changelogPrompt := "Dado o conteudo do PR de uma release para produção, crie um changelog em pt-br com uma descrição simples em linguagem para leigos no formato markdown (imprima como codigo para que seja possivel copiar as marcações): "
	list := strings.Split(developPulls, "\n")
	fmt.Println("Release pull requests:", len(list))
	for _, pull := range list {
		id, err := extractPullRequestID(pull)
		if err == nil {
			issues := getIssuesFromPullRequest(id)
			if len(issues) > 0 {
				for _, issue := range issues {
					releaseText += fmt.Sprintf("- [ ] #%d - PR( #%d )\n", issue.Number, id)
					changelogPrompt += fmt.Sprintf("%s - PR( #%d ) ", issue.Title, id)
				}
			} else {
				releaseText += fmt.Sprintf("- [ ] PR( #%d )\n", id)
				changelogPrompt += fmt.Sprintf("%s - PR( #%d ) ", pull, id)
			}
		}
	}
	fmt.Println("releaseText=>\n", strings.TrimSpace(releaseText))
	queryString, _ := toQueryString(struct {
		Q string `json:"q"`
	}{
		Q: changelogPrompt,
	})
	openbrowser("https://chat.openai.com/chat?q=" + queryString)
}

func main() {
	flag.Parse()

	if *envsFlag != "" {
		err := godotenv.Load(*envsFlag)
		if err != nil {
			log.Fatal("error loading .env file")
		}
	}

	generateReleaseText()
	openPRInBrowser()
}

func toQueryString(filter interface{}) (string, error) {
	jsonF, err := json.Marshal(filter)
	if err != nil {
		return "", err
	}

	query, err := url.ParseQuery("")
	if err != nil {
		return "", err
	}

	f := map[string]interface{}{}
	err = json.Unmarshal(jsonF, &f)
	if err != nil {
		return "", err
	}

	for key, val := range f {
		switch v := val.(type) {
		case string:
			query.Add(key, string(v))
		case []interface{}:
			for _, a := range v {
				query.Add(key, fmt.Sprint(a))
			}
		case nil:

		default:
			return "", errors.New("failed to find parameter type")
		}
	}

	return query.Encode(), nil
}
