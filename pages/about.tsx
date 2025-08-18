import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/about.module.scss'

const About = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>エンジョイスプラ</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <div className={styles.column}>
                <div className={styles.subtitle}>
                    このサイトについて
                </div>
                <div className={styles.text}>
                    エンジョイスプラでは、スプラトゥーンをより楽しむためのツールを公開しています。
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
                            ・スプラビンゴ
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
                {/* <Image 
                    src="/images/icon_ryouhei0705.jpg"
                    width={60}
                    height={60}
                    alt="Profile picture">
                </Image> */}
            </div>

            <div className={styles.column}>
                <div className={styles.subtitle}>
                    ツイッターアカウント
                </div>
                <div className={styles.word}>
                    <a href="https://twitter.com/ryouhei_0705">@りょうへい0705</a>
                </div>
            </div>

            <div className={styles.column}>
                <div className={styles.subtitle}>
                    アマゾンリンクについて
                </div>
                <div className={styles.text}>
                    エンジョイスプラの管理者であるryouhei0705は、Amazonのアソシエイトとして適格販売により収入を得ています。
                </div>
            </div>
       
        </div>
    );
};

export default About;
