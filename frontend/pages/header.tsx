import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/header.module.scss'

const Header = () => {
    return (
        <header>
            <div className={styles.test}>

            <Link href='/'>
                <Image
                    src="/icon/bingo.svg"
                    width={30}
                    height={30}
                    alt="Bingo icon"
                />
            </Link>

            <Link href='/about'>
                <Image
                    src="/icon/about.svg"
                    width={30}
                    height={30}
                    alt="Question icon"
                />
            </Link>
            </div>
        </header>
    )
}

export default Header;
