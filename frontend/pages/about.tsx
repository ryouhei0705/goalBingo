import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/about.module.scss'

// サイトについてのページ
const About = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>目標ビンゴ</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <div className={styles.column}>
                <div className={styles.subtitle}>
                    このサイトについて
                </div>
                <div className={styles.text}>
                    目標ビンゴでは、目標を持ち，達成することを楽しむためのビンゴ作成ツールを公開しています。
                </div>
            </div>

            <div className={styles.column}>
                <div className={styles.subtitle}>
                    コンテンツ
                </div>
                <ul className={styles.text}>
                    <li>
                        <Link href='/about'>
                            ・このサイトについて
                        </Link>
                    </li>
                    <li>
                        <Link href='/'>
                            ・目標ビンゴを作成する
                        </Link>
                    </li>
                </ul>
            </div>

            <div className={styles.column}>
                <div className={styles.subtitle}>
                    サイト管理者
                </div>
                <div className={styles.word}>
                    りょうへい0705
                </div>
            </div>

            <div className={styles.column}>
                <div className={styles.subtitle}>
                    ツイッターアカウント
                </div>
                <div className={styles.word}>
                    <a href="https://twitter.com/ryouhei_0705">@りょうへい0705</a>
                </div>
            </div>
       
        </div>
    );
};

export default About;
