package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "log"
// import "net/http" // removed unused import
    "os"
    "path/filepath"

    "github.com/dghubble/oauth1"
)

type Config struct {
    ConsumerKey    string
    ConsumerSecret string
    CallbackURL    string
    DataDir        string
}

func loadConfig() Config {
    cfg := Config{
        ConsumerKey:    os.Getenv("xConsumerKey"),
        ConsumerSecret: os.Getenv("xSecretKey"),
        CallbackURL:    os.Getenv("TWITTER_CALLBACK_URL"),
        DataDir:        os.Getenv("SCHEDULER_DATA_DIR"),
    }
    if cfg.CallbackURL == "" {
        cfg.CallbackURL = "http://localhost:8080/api/auth/twitter/callback"
    }
    if cfg.DataDir == "" {
        cfg.DataDir = "./data"
    }
    return cfg
}

func tokenFilePath() string {
    cfg := loadConfig()
    return filepath.Join(cfg.DataDir, "twitter-oauth.json")
}

func saveToken(token, secret string) error {
    t := map[string]string{"token": token, "secret": secret}
    data, _ := json.MarshalIndent(t, "", "  ")
    return os.WriteFile(tokenFilePath(), data, 0600)
}

func loadToken() (string, string, error) {
    b, err := os.ReadFile(tokenFilePath())
    if err != nil {
        return "", "", err
    }
    var t struct {
        Token  string `json:"token"`
        Secret string `json:"secret"`
    }
    if err := json.Unmarshal(b, &t); err != nil {
        return "", "", err
    }
    return t.Token, t.Secret, nil
}

func startOAuth(cfg Config) (string, string, error) {
    oauthCfg := oauth1.Config{
        ConsumerKey:    cfg.ConsumerKey,
        ConsumerSecret: cfg.ConsumerSecret,
        CallbackURL:    cfg.CallbackURL,
        Endpoint: oauth1.Endpoint{RequestTokenURL: "https://api.twitter.com/oauth/request_token", AuthorizeURL: "https://api.twitter.com/oauth/authorize", AccessTokenURL: "https://api.twitter.com/oauth/access_token"},
    }
    requestToken, requestSecret, err := oauthCfg.RequestToken()
    if err != nil {
        return "", "", err
    }
    authURL, err := oauthCfg.AuthorizationURL(requestToken)
    if err != nil {
        return "", "", err
    }
    fmt.Println("Open the following URL in your browser, authorize the app, then copy the PIN (oauth_verifier) from the redirected URL:")
    fmt.Println(authURL.String())
    fmt.Print("Verifier (PIN): ")
    var verifier string
    fmt.Scanln(&verifier)
    accessToken, accessSecret, err := oauthCfg.AccessToken(requestToken, requestSecret, verifier)
    if err != nil {
        return "", "", err
    }
    return accessToken, accessSecret, nil
}

func postTweet(content, token, secret string, cfg Config) error {
    oauthCfg := oauth1.Config{
        ConsumerKey:    cfg.ConsumerKey,
        ConsumerSecret: cfg.ConsumerSecret,
        Endpoint: oauth1.Endpoint{RequestTokenURL: "https://api.twitter.com/oauth/request_token", AuthorizeURL: "https://api.twitter.com/oauth/authorize", AccessTokenURL: "https://api.twitter.com/oauth/access_token"},
    }
    accessToken := oauth1.NewToken(token, secret)
    client := oauthCfg.Client(oauth1.NoContext, accessToken)
    body := map[string]string{"text": content}
    payload, _ := json.Marshal(body)
    resp, err := client.Post("https://api.twitter.com/2/tweets", "application/json", bytes.NewReader(payload))
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    if resp.StatusCode >= 400 {
        raw, _ := ioutil.ReadAll(resp.Body)
        return fmt.Errorf("Twitter API %d: %s", resp.StatusCode, string(raw))
    }
    fmt.Println("✅ Tweet posted!")
    return nil
}

func main() {
    if len(os.Args) < 2 {
        fmt.Println("Usage: go run ./cmd/publish_x/main.go \"Your tweet text\"")
        os.Exit(1)
    }
    tweet := os.Args[1]
    cfg := loadConfig()
    token, secret, err := loadToken()
    if err != nil || token == "" {
        fmt.Println("No saved credentials – starting OAuth flow.")
        token, secret, err = startOAuth(cfg)
        if err != nil {
            log.Fatalf("OAuth failed: %v", err)
        }
        if err := saveToken(token, secret); err != nil {
            log.Fatalf("Failed to save token: %v", err)
        }
        fmt.Println("Credentials saved.")
    }
    if err := postTweet(tweet, token, secret, cfg); err != nil {
        log.Fatalf("Publish failed: %v", err)
    }
}
