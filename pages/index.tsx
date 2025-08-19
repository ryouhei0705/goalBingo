import React from 'react';
import Bingo from './bingo';
import AmazonAffiliate from './amazonAffiliate';
import Head from 'next/head';
import Link from 'next/link';
import CreateBingo from './createBingo';

// メインのページ
const Home = () => {
  return (
    <div>
      {/* <HamburgerMenu /> */}
      <Head>
        <title>目標ビンゴ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <CreateBingo />{/* ビンゴの作成 */}
      {/* <AmazonAffiliate /> */}{/* アマゾンアフィリエイト */}
    </div>
  );
};

export default Home;
