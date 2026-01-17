import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import Bingo from '../bingo';
import CreateBingo from '../createBingo';
import Head from 'next/head';
import Link from 'next/link';
import { readRequestSchema } from '../../schemas/bingo';

// APIのベースurl
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/goals`;

// APIから受け取る型
type ApiGoalRow = {
  goalId: string;
  bingoId: string;
  goal: string;
  isAchieved: boolean;
};

// Bingoに渡す型（bingoIdなし）
type Goal = {
  id: string;
  goal: string;
  isAchieved: boolean;
};

type HomeProps = {
  goals: Goal[];
  bingoId: string;
};

// ページ読み込み時に起動する
export const getServerSideProps: GetServerSideProps<HomeProps> = async ({ params }) => {
  // 動的ルーティングのパラメータを取得
  const bingoId = params!.bingoId as string;

  // bingoIdのバリデーション
  const validationResult = readRequestSchema.safeParse({ bingoId });
  if (!validationResult.success) {
    // バリデーションエラーの場合は404を返す
    return { notFound: true };
  }

  // バリデーション済みのbingoIdを使用
  const validatedBingoId = validationResult.data.bingoId;

  // apiを使用して{bingoId}の目標をデータベースから取得
  const res = await fetch(`${BASE_URL}?bingoId=${validatedBingoId}`);

  // APIから問題なくデータを取得できたか確認
  if (!res.ok) {
    // 404にしたいなら
    return { notFound: true };
  }

  const rows = (await res.json()) as ApiGoalRow[];
  // bingoIdを落としてBingo用の型に変換
  const goals: Goal[] = rows.map(({ goalId, goal, isAchieved }) => ({
    id: goalId,
    goal,
    isAchieved,
  }));

  return {
    props: {
      goals,
      bingoId: validatedBingoId,
    },
  };
};

// メインのページ
const Home = ({ goals, bingoId }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  // サーバーレンダリングが終わるのを待つ
  const router = useRouter();
  if (!router.isReady) return <p>Loading...</p>;

  return (
    <div>
      <Head>
        <title>目標ビンゴ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Bingo goals={goals} bingoId={bingoId} /> {/* ビンゴ */}
      <CreateBingo /> {/* ビンゴの作成 */}
    </div>
  );
};

export default Home;