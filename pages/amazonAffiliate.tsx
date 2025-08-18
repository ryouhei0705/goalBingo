import React from 'react';
import styles from '@/styles/amazonAffiliate.module.scss'
import Head from 'next/head';

// アマゾンアフィリエイトようのページ
const AmazonAffiliate = () => {
    return (
        <div className={styles.container}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            
            <div className={styles.parent}>
                
                <div className={styles.child}>
                    <iframe className={styles.ado} sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=ryouhei0705-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B0BG7YRKF1&linkId=83a3fd4aaac6f87753847abb3f585ba0"></iframe>
                </div>
                <div className={styles.child}>
                    <iframe className={styles.ado} sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=ryouhei0705-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B0B55V65CR&linkId=ffa7dbe521fa90cd2d686686e0420252"></iframe>
                </div>
                <div className={styles.child}>
                    <iframe className={styles.ado} sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=ryouhei0705-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B072FH4TPK&linkId=008ce869153716132263d7640dde4773"></iframe>
                </div>
                <div className={styles.child}>
                    <iframe className={styles.ado} sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=ryouhei0705-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B0BZGZ8WMH&linkId=163059abedde871c7df9c9cec126b0a2"></iframe>
                </div>
                <div className={styles.child}>
                    <iframe className={styles.ado} sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=ryouhei0705-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B0B64Q42YP&linkId=cc5dd696735ff716b11a56ccbfcd5fd7"></iframe>
                </div>
                <div className={styles.child}>
                    <iframe className={styles.ado} sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=ryouhei0705-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=4047336556&linkId=ef8d1a8f9a8cfc9542196f0480de637b"></iframe>
                </div>
            </div>
        </div>
    )
};

export default AmazonAffiliate;