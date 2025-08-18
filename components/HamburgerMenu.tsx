import { useState } from 'react';
import Link from 'next/link';

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <header>
            <div
                className={`hamburger-menu ${isOpen ? 'open' : ''} text-white`}
                onClick={toggleMenu}
            >っっf
                <div className="hamburger-icon"></div>
            </div>
            {isOpen && (
                <nav className="menu">
                    <ul>
                        <li>
                            <Link href="/">indexへ</Link>
                        </li>
                        <li>
                            <Link href="/test">testへ</Link>
                        </li>
                    </ul>
                </nav>
            )}
        </header>
    );
};

export default HamburgerMenu;
