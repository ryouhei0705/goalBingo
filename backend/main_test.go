package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

// TestHandleGoals_Success は、bingoIdが有効な場合の正常動作をテストします
func TestHandleGoals_Success(t *testing.T) {
	// モックDBのセットアップ
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("モックDBの作成に失敗しました: %s", err)
	}
	defer mockDB.Close()

	// グローバルdbを一時的に置き換え
	oldDB := db
	db = mockDB
	defer func() { db = oldDB }()

	// モックの期待値を設定
	testBingoID := "550e8400-e29b-41d4-a716-446655440000"
	rows := sqlmock.NewRows([]string{"id", "bingo_id", "content", "is_achieved"}).
		AddRow("id1", testBingoID, "目標1", false).
		AddRow("id2", testBingoID, "目標2", false).
		AddRow("id3", testBingoID, "目標3", false)

	mock.ExpectQuery("SELECT id, bingo_id, content, is_achieved FROM goal_items WHERE bingo_id = ?").
		WithArgs(testBingoID).
		WillReturnRows(rows)

	// テストリクエストを作成
	req, err := http.NewRequest("GET", "/api/goals?bingoId="+testBingoID, nil)
	if err != nil {
		t.Fatal(err)
	}

	// レスポンスレコーダーを作成
	rr := httptest.NewRecorder()

	// ハンドラーを実行
	handler := http.HandlerFunc(handleGoals)
	handler.ServeHTTP(rr, req)

	// ステータスコードの確認
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("期待するステータスコード: %v, 実際: %v", http.StatusOK, status)
	}

	// レスポンスボディの確認
	var results []GoalRow
	if err := json.NewDecoder(rr.Body).Decode(&results); err != nil {
		t.Fatalf("レスポンスのデコードに失敗しました: %v", err)
	}

	// 結果の検証
	if len(results) != 3 {
		t.Errorf("期待する結果の数: 3, 実際: %d", len(results))
	}

	if results[0].Goal != "目標1" {
		t.Errorf("期待する目標: '目標1', 実際: '%s'", results[0].Goal)
	}

	// モックの期待値が満たされたか確認
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("モックの期待値が満たされませんでした: %s", err)
	}
}

// TestHandleGoals_MissingBingoId は、bingoIdが欠けている場合のエラーハンドリングをテストします
func TestHandleGoals_MissingBingoId(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/goals", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handleGoals)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("期待するステータスコード: %v, 実際: %v", http.StatusBadRequest, status)
	}
}

// TestHandleGoals_InvalidMethod は、GETメソッド以外のリクエストを拒否することをテストします
func TestHandleGoals_InvalidMethod(t *testing.T) {
	req, err := http.NewRequest("POST", "/api/goals?bingoId=test-123", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handleGoals)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusMethodNotAllowed {
		t.Errorf("期待するステータスコード: %v, 実際: %v", http.StatusMethodNotAllowed, status)
	}
}

// TestHandleCreate_Success は、正常な目標作成をテストします
func TestHandleCreate_Success(t *testing.T) {
	// モックDBのセットアップ
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("モックDBの作成に失敗しました: %s", err)
	}
	defer mockDB.Close()

	oldDB := db
	db = mockDB
	defer func() { db = oldDB }()

	// トランザクションのモック設定
	mock.ExpectBegin()
	mock.ExpectExec("INSERT INTO bingos").
		WithArgs(sqlmock.AnyArg(), "マイビンゴ").
		WillReturnResult(sqlmock.NewResult(1, 1))

	// 8つの目標を挿入
	for i := 0; i < 8; i++ {
		mock.ExpectExec("INSERT INTO goal_items").
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), false).
			WillReturnResult(sqlmock.NewResult(1, 1))
	}

	mock.ExpectCommit()

	// リクエストボディを作成
	reqBody := CreateRequest{
		Goals: []string{
			"目標1", "目標2", "目標3", "目標4",
			"目標5", "目標6", "目標7", "目標8",
		},
	}
	bodyBytes, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", "/api/createGoals", bytes.NewBuffer(bodyBytes))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handleCreate)
	handler.ServeHTTP(rr, req)

	// ステータスコードの確認
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("期待するステータスコード: %v, 実際: %v", http.StatusOK, status)
	}

	// レスポンスボディの確認
	var response map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&response); err != nil {
		t.Fatalf("レスポンスのデコードに失敗しました: %v", err)
	}

	if _, ok := response["bingoId"]; !ok {
		t.Error("レスポンスにbingoIdが含まれていません")
	}

	// モックの期待値が満たされたか確認
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("モックの期待値が満たされませんでした: %s", err)
	}
}

// TestHandleCreate_InvalidMethod は、POSTメソッド以外のリクエストを拒否することをテストします
func TestHandleCreate_InvalidMethod(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/createGoals", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handleCreate)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusMethodNotAllowed {
		t.Errorf("期待するステータスコード: %v, 実際: %v", http.StatusMethodNotAllowed, status)
	}
}

// TestHandleCreate_InvalidJSON は、不正なJSONの場合のエラーハンドリングをテストします
func TestHandleCreate_InvalidJSON(t *testing.T) {
	req, err := http.NewRequest("POST", "/api/createGoals", bytes.NewBufferString("{invalid json}"))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handleCreate)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("期待するステータスコード: %v, 実際: %v", http.StatusBadRequest, status)
	}
}

// TestWithCORS は、CORSミドルウェアの動作をテストします
func TestWithCORS(t *testing.T) {
	// 環境変数を設定
	t.Setenv("FRONTENDURL", "https://goal-bingo.vercel.app")

	// ダミーハンドラーを作成
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// CORSミドルウェアを適用
	corsHandler := withCORS(handler)

	// 通常のリクエストをテスト
	req, err := http.NewRequest("GET", "/api/goals", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	corsHandler.ServeHTTP(rr, req)

	// CORSヘッダーの確認
	if origin := rr.Header().Get("Access-Control-Allow-Origin"); origin != "https://goal-bingo.vercel.app" {
		t.Errorf("期待するOrigin: 'https://goal-bingo.vercel.app', 実際: '%s'", origin)
	}

	if methods := rr.Header().Get("Access-Control-Allow-Methods"); methods != "GET, POST, PUT, OPTIONS" {
		t.Errorf("期待するMethods: 'GET, POST, PUT, OPTIONS', 実際: '%s'", methods)
	}

	if headers := rr.Header().Get("Access-Control-Allow-Headers"); headers != "Content-Type" {
		t.Errorf("期待するHeaders: 'Content-Type', 実際: '%s'", headers)
	}
}

// TestWithCORS_OptionsRequest は、OPTIONSリクエストの処理をテストします
func TestWithCORS_OptionsRequest(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Error("OPTIONSリクエストでハンドラーが呼ばれるべきではありません")
	})

	corsHandler := withCORS(handler)

	req, err := http.NewRequest("OPTIONS", "/api/goals", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	corsHandler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("期待するステータスコード: %v, 実際: %v", http.StatusOK, status)
	}
}
