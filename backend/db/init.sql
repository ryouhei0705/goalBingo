-- 1. データベースの作成（TiDB Cloud上で行う場合）
CREATE DATABASE IF NOT EXISTS goal_bingo_dev;
USE goal_bingo_dev;

-- 2. 親テーブル：ビンゴ本体
CREATE TABLE IF NOT EXISTS bingos (
    id VARCHAR(36) PRIMARY KEY,         -- Goで生成するUUID
    title VARCHAR(255) NOT NULL,        -- ビンゴのタイトル
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 子テーブル：ビンゴの各マス
CREATE TABLE IF NOT EXISTS goal_items (
    id VARCHAR(36) PRIMARY KEY,         -- Goで生成するUUID
    bingo_id VARCHAR(36) NOT NULL,      -- どのビンゴに属するか（外部キー）
    content TEXT NOT NULL,              -- 目標の内容
    is_achieved BOOLEAN DEFAULT FALSE,  -- 達成したかどうか
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- 親のビンゴが消えたら、紐づく目標も消えるように設定
    FOREIGN KEY (bingo_id) REFERENCES bingos(id) ON DELETE CASCADE
);