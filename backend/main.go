package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"

	validator "github.com/go-playground/validator/v10"
	"github.com/go-sql-driver/mysql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

// readのapiのリクエスト形式
type ReadRequest struct {
	BingoID string `validate:"required,uuid"`
}

// フロントエンドの GoalRow 型に合わせる
type GoalRow struct {
	BingoID string `json:"bingoId"`
	Goal    string `json:"goal"`
}

// createのapiのリクエスト形式
type CreateRequest struct {
	Goals []string `json:"goals" validate:"required,len=8,dive,required,min=1,max=30,japanese_alphanum"`
}

// 日本語（ひらがな・カタカナ・漢字）と英数字を許可する正規表現
// ひらがな: \u3040-\u309F
// カタカナ: \u30A0-\u30FF
// 漢字: \u4E00-\u9FAF
var jpAlphanumRegex = regexp.MustCompile("^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$")

// 日本語（ひらがな・カタカナ・漢字）と英数字をバリデーションするカスタム関数
func japaneseAlphanum(fl validator.FieldLevel) bool {
	return jpAlphanumRegex.MatchString(fl.Field().String())
}

var db *sql.DB
var validate = validator.New()

func init() {
	validate.RegisterValidation("japanese_alphanum", japaneseAlphanum)
}

func initDB() (*sql.DB, error) {
	cfg := mysql.Config{
		User:      os.Getenv("MYSQLUSER"),
		Passwd:    os.Getenv("MYSQLPASSWORD"),
		Net:       "tcp",
		Addr:      fmt.Sprintf("%s:%s", os.Getenv("MYSQLHOST"), os.Getenv("MYSQLPORT")),
		DBName:    os.Getenv("MYSQLDATABASE"),
		ParseTime: true,
	}

	// DSNを生成して接続を開く
	db, err := sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		return nil, err
	}

	// 実際に接続できるか確認（Ping）
	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}

func main() {
	// ローカル実行時のみ .env を読み込む
	godotenv.Load()

	var err error
	db, err = initDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	log.Printf("DB接続に成功しました\n")

	// apiリクエストを処理する関数を仕分ける
	mux := http.NewServeMux()
	mux.HandleFunc("/api/goals", handleGoals)        // GET: 取得
	mux.HandleFunc("/api/createGoals", handleCreate) // POST: 作成

	// Railwayが指定するポート番号を取得
	port := os.Getenv("PORT")
	if port == "" {
		// ローカル実行用のデフォルトポート
		port = "8080"
	}
	fmt.Printf("サーバー起動: http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, withCORS(mux)))
}

// CORSミドルウェア
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", os.Getenv("FRONTENDURL")) // Next.jsからのアクセスを許可
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// GET /api/goals?bingoId=xxx
func handleGoals(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	// クエリからbingoIdを取得
	bingoId := r.URL.Query().Get("bingoId")
	query := ReadRequest{
		BingoID: bingoId,
	}

	// バリデーションチェック
	if err := validate.Struct(query); err != nil {
		http.Error(w, "無効なクエリです。", http.StatusBadRequest)
		return
	}

	rows, err := db.Query("SELECT bingo_id, content FROM goal_items WHERE bingo_id = ?", bingoId)
	if err != nil {
		log.Printf("ERROR: データベース goal_items WHERE bingo_id = (%v) の取得に失敗しました: %v \n", bingoId, err)

		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var results []GoalRow
	for rows.Next() {
		var g GoalRow
		if err := rows.Scan(&g.BingoID, &g.Goal); err != nil {
			log.Println(err)
			continue
		}
		results = append(results, g)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// POST /api/createGoals 担当
func handleCreate(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	// バリデーションチェック
	if err := validate.Struct(req); err != nil {
		http.Error(w, "入力内容が正しくありません: 8個の目標を、日本語または英数字(1-30文字)で入力してください", http.StatusBadRequest)
		log.Printf("Validation Error: %v\n", err)
		return
	}

	// 1. 新しい BingoID を生成
	newBingoId := uuid.New().String()

	tx, _ := db.Begin()

	// 2. 親テーブルに保存
	_, err := tx.Exec("INSERT INTO bingos (id, title) VALUES (?, ?)", newBingoId, "マイビンゴ")
	if err != nil {
		tx.Rollback()
		log.Printf("ERROR: データベース bingos (id, title) = (%v, %v)の保存に失敗しました: %v \n", newBingoId, "マイビンゴ", err)

		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// 3. 子テーブルに8つの目標を保存
	for _, goalText := range req.Goals {
		itemId := uuid.New().String()
		_, err := tx.Exec("INSERT INTO goal_items (id, bingo_id, content, is_achieved) VALUES (?, ?, ?, ?)",
			itemId, newBingoId, goalText, false)
		if err != nil {
			tx.Rollback()
			log.Printf("ERROR: データベース goal_items (id, bingo_id, content, is_achieved) = (%v, %v, %v, %v)の保存に失敗しました: %v \n", itemId, newBingoId, goalText, false, err)

			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}

	tx.Commit()

	// フロントエンドが期待する {"bingoId": "..."} を返す
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"bingoId": newBingoId})
}
