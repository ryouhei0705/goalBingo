import { Html, Head, Main, NextScript } from 'next/document'
import Link from 'next/link'
import Image from 'next/image'

export default function Document() {
  return (
    <Html lang="en">
      <Head />

      <header>
        <div className='headerContainer'>
          <div className='headerIconParent'>
            <div className='headerIconChild'>
              <Link href='/about'>
                <Image
                  src="/icon/about.svg"
                  width={30}
                  height={30}
                  alt="Question icon"
                />
              </Link>
            </div>
            <div className='headerIconChild'>
              <Link href='/'>
                <Image
                  src="/icon/bingo.svg"
                  width={30}
                  height={30}
                  alt="Bingo icon"
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <body>
        <Main />
        <NextScript />
      </body>
      
      <div className='footerCopyright'>
        <p>&copy; copyright GoalBingo 2025</p>
      </div>
    </Html>
  )
}
