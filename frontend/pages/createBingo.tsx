import React, { useState } from 'react';
import { useRouter } from "next/router";
import styles from '@/styles/createBingo.module.scss'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRequestSchema, CreateRequest } from "../schemas/bingo";

// 目標の入力フォームの初期値
const INITIAL_GOALS = Array(8).fill("");

// ビンゴ作成のコンポーネント
const CreateBingo = () => {
  // 作成ボタン入力後のローディングを管理
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // react-hook-formの設定
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateRequest>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      goals: INITIAL_GOALS,
    },
    mode: "onChange", // リアルタイムでバリデーション
  });

  // 現在の入力値を監視
  const goals = watch("goals") || INITIAL_GOALS;

  // 配列の更新用
  function updateGoal(index: number, value: string) {
    const newGoals = [...goals];
    newGoals[index] = value;
    setValue(`goals.${index}`, value, { shouldValidate: true });
  }

  async function onSubmit(data: CreateRequest) {
    // ローディング開始
    setLoading(true); 

    try {
      // 内部APIを呼び出して，目標を登録
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/createGoals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goals: data.goals }),
      });

      // 内部APIを問題なく動作できたか確認
      const json = await res.json();
      if (!res.ok) {
          alert(json.error ?? "登録に失敗しました");
          return;
      }

      // 目標の入力値を初期化
      setValue("goals", INITIAL_GOALS);

      // サーバーが生成した bingoId を受け取り、詳細ページに遷移
      router.push(`/33bingos/${encodeURIComponent(json.bingoId)}`);
    } finally {
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
        onSubmit={handleSubmit(onSubmit)}
        >
        {/* goals配列分入力フォームを設置 */}
        {goals.map((goal: string, i: number) => {
          const { onChange, ...registerProps } = register(`goals.${i}`);
          return (
            <div key={i}>
              <input
                className={styles.goalForm}
                type="text"
                value={goal}
                {...registerProps}
                onChange={(e) => {
                  updateGoal(i, e.target.value);
                  onChange(e);
                }}
                // placeholder={`目標 ${i + 1}`}
              />
              {errors.goals?.[i] && (
                <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.goals[i]?.message}
                </p>
              )}
            </div>
          );
        })}
        {/* 配列全体のエラー（8個未満の場合など） */}
        {errors.goals && typeof errors.goals.message === 'string' && (
          <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {errors.goals.message}
          </p>
        )}
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
            ・目標は日本語または英数字(30文字以内)で入力してください。
            <br></br>
            ・個人情報等，他人に知られてはいけないことは入力しないでください。
        </div>
      </div>
    
    </div>
  );
};

export default CreateBingo;
