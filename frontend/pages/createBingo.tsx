import React, { useState, useEffect,useCallback,useMemo } from 'react';
import { useRouter } from "next/router";
import styles from '@/styles/createBingo.module.scss'
import Image from 'next/image';
import Head from 'next/head';

// 目標の入力フォームの初期値
const INITIAL_GOALS = Array(8).fill("");

// ビンゴ作成のコンポーネント
const CreateBingo = () => {
  // 作成ボタン入力後のローディングを管理
  const [loading, setLoading] = useState(false);

  // 8個の入力欄を用意（初期値は空文字）
  const [goals, setGoals] = useState<string[]>(INITIAL_GOALS);
  const router = useRouter();

//   配列の更新用
  function updateGoal(index: number, value: string) {
    const copy = [...goals];
    copy[index] = value;
    setGoals(copy);
  }

  async function onSubmit(e: React.FormEvent) {
    // ローディング開始
    setLoading(true); 

    try{
        e.preventDefault();

        // 全て入力されているか確認
        const filteredGoals = goals.map((g) => g.trim()).filter((g) => g.length > 0);
        if (filteredGoals.length !== 8) {
            alert("目標は必ず8個入力してください");
        return;
        }

        // 内部APIを呼び出して，目標を登録
        const res = await fetch("http://localhost:8080/api/createGoals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ goals: filteredGoals }),
        });

        // 内部APIを問題なく動作できたか確認
        const json = await res.json();
        if (!res.ok) {
            alert(json.error ?? "登録に失敗しました");
        return;
        }

        // 目標の入力値を初期化
        setGoals(INITIAL_GOALS);

        // サーバーが生成した bingoId を受け取り、詳細ページに遷移
        router.push(`/33bingos/${encodeURIComponent(json.bingoId)}`);
    }finally{
        // 画面遷移後にローディング終了
        setLoading(false); 
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        目標ビンゴを作成しよう!!
        </h1>
      {/* 登録フォーム */}
      <form 
        className={styles.container}
        onSubmit={onSubmit}
        >
        {/* goals配列分入力フォームを設置 */}
        {goals.map((goal, i) => (
            <input
            key={i}
            className={styles.goalForm}
            type="text"
            value={goal}
            onChange={(e) => updateGoal(i, e.target.value)}
            // placeholder={`目標 ${i + 1}`}
            />
        ))}
        <button 
            className={styles.button}
            type="submit"
            disabled={loading}
        >
            作成
        </button>
      </form>

        {/* ローディング中の表示 */}
        {loading && (
            <div className={styles.overlay}>
                <p>作成中です...</p>
            </div>
        )}
       

      <div className={styles.container}>
        <div className={styles.ruleText}>
            ・目標を8個入力してください。
            <br></br>
            ・個人情報等，他人に知られてはいけないことは入力しないでください。
        </div>
      </div>
    
    </div>
  );
};

export default CreateBingo;
