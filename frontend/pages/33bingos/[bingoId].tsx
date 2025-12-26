import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import Bingo from '../bingo';
import CreateBingo from '../createBingo';
import Head from 'next/head';
import Link from 'next/link';

// apiのベースurl
// const BASE_URL = "https://script.google.com/macros/s/AKfycbyJN6CWNVMbqN4lQm4b_I9r9Itdug4nVv9-gHMlGkf-t8iF31MwxwewqzFBZjTQ3vJ4/exec";
const BASE_URL = "http://localhost:8080/api/goals";

// apiから受け取るデータを変換する型
type GoalRow = { bingoId: string; goal: string };

// ページ読み込み時に起動する
export const getServerSideProps: GetServerSideProps<{goals: string[]}> 
= async ({ params }) => {
    // 動的ルーティングのパラメータを取得
    // URL が /33bingos/123 のとき → bingoId = "123"
  const bingoId = params!.bingoId as string;

    // apiを使用して{bingoId}の目標をデータベースから取得
  const res = await fetch(`${BASE_URL}?bingoId=${bingoId}`);

//   apiから問題なくデータを取得できたか確認
  if (!res.ok) {
    // 404にしたいなら
    return { notFound: true };
  }

//   apiから受け取ったjsonを変換
  const rows = (await res.json()) as GoalRow[];
  // goal だけの配列にして渡す
  const goals = rows.map(r => r.goal);

  return { props: { goals} };
};

// メインのページ
const Home = (
    { goals}: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
    // サーバーレンダリングが終わるのを待つ
    const router = useRouter();
    if (!router.isReady) return <p>Loading...</p>;

  return (
    <div>
      {/* <HamburgerMenu /> */}
      <Head>
        <title>目標ビンゴ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Bingo goals={goals}/>{/* ビンゴ */}
      <CreateBingo />{/* ビンゴの作成 */}
    </div>
  );
};

export default Home;