import React, { useState, useEffect,useCallback,useMemo } from 'react';
import { useRouter } from "next/router";
import styles from '@/styles/bingo.module.scss'
import Image from 'next/image';
import Head from 'next/head';

// ビンゴ作成のコンポーネント
const CreateBingo = () => {
  // 8個の入力欄を用意（初期値は空文字）
  const [goals, setGoals] = useState<string[]>(Array(8).fill(""));
  const router = useRouter();

//   配列の更新用
  function updateGoal(index: number, value: string) {
    const copy = [...goals];
    copy[index] = value;
    setGoals(copy);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 全て入力されているか確認
    const filteredGoals = goals.map((g) => g.trim()).filter((g) => g.length > 0);
    if (filteredGoals.length !== 8) {
      alert("目標は8つ入力してください");
      return;
    }

    // 内部APIを呼び出して，目標を登録
    const res = await fetch("/api/createGoals", {
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

    // サーバーが生成した bingoId を受け取り、詳細ページに遷移
    router.push(`/33bingos/${encodeURIComponent(json.bingoId)}`);
  }

  return (
    <main style={{ padding: 16 }}>
      <h1>目標を8つ登録</h1>
      {/* 登録フォーム */}
      <form onSubmit={onSubmit}>
        {/* goals配列分入力フォームを設置 */}
        {goals.map((goal, i) => (
          <div key={i}>
            <label>
              Goal {i + 1}:{" "}
              <input
                type="text"
                value={goal}
                onChange={(e) => updateGoal(i, e.target.value)}
                placeholder={`目標 ${i + 1}`}
              />
            </label>
          </div>
        ))}
        <button type="submit">登録</button>
      </form>
    </main>
  );
};

export default CreateBingo;
