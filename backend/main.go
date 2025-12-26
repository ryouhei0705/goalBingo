package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

// フロントエンドの GoalRow 型に合わせる
type GoalRow struct {
	BingoID string `json:"bingoId"`
	Goal    string `json:"goal"`
}

// フロントエンドの送信形式に合わせる
type CreateRequest struct {
	Goals []string `json:"goals"`
}

var db *sql.DB

func main() {
	// Railwayが提供する環境変数から接続情報を取得
	dbUser := os.Getenv("MYSQLUSER")
    dbPass := os.Getenv("MYSQLPASSWORD")
    dbHost := os.Getenv("MYSQLHOST")
    dbPort := os.Getenv("MYSQLPORT")
    dbName := os.Getenv("MYSQLDATABASE")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
	 dbUser, dbPass, dbHost, dbPort, dbName)

	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}

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
		// w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000") // Next.jsからのアクセスを許可
		w.Header().Set("Access-Control-Allow-Origin", "https://goal-bingo.vercel.app") // Next.jsからのアクセスを許可
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

	bingoId := r.URL.Query().Get("bingoId")
	if bingoId == "" {
		http.Error(w, "bingoId is required", http.StatusBadRequest)
		return
	}

	rows, err := db.Query("SELECT bingo_id, content FROM goal_items WHERE bingo_id = ?", bingoId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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

	// 1. 新しい BingoID を生成
	newBingoId := uuid.New().String()

	tx, _ := db.Begin()

	// 2. 親テーブルに保存
	_, err := tx.Exec("INSERT INTO bingos (id, title) VALUES (?, ?)", newBingoId, "マイビンゴ")
	if err != nil {
		tx.Rollback()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// 3. 子テーブルに8つの目標を保存
	for _, goalText := range req.Goals {
		itemId := uuid.New().String()
		_, err := tx.Exec("INSERT INTO goal_items (id, bingo_id, content, is_achieved) VALUES (?, ?, ?, ?)",
			itemId, newBingoId, goalText, false)
		if err != nil {
			tx.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	tx.Commit()

	// フロントエンドが期待する {"bingoId": "..."} を返す
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"bingoId": newBingoId})
}
