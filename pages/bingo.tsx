import React, { useState, useEffect,useCallback,useMemo } from 'react';
import styles from '@/styles/bingo.module.scss'
import { initializeWeapons } from './arrayUtils';
import Image from 'next/image';
import { Rule } from 'postcss';
import Head from 'next/head';

// 各セルのデータのインターフェース
interface CellData {
    value1: string;
    value2: string;
    value1Image: string;
    value2Image: string;
    marked: boolean;
}

interface ValueDate{
    name: string;
    imageUrl: string;
}

// const weapons:ValueDate[] = [
//     { name: 'ボールドマーカー', imageUrl: '/images/borudomaka.png' },
//     { name: 'ボールドマーカーネオ', imageUrl: '/images/borudomakaneo.png' },
//     { name: 'わかばシューター', imageUrl: '/images/wakabasyuta.png' },
//     { name: 'もみじシューター', imageUrl: '/images/momizisyuta.png' },
//     { name: 'シャープマーカー', imageUrl: '/images/syapumaka.png' },
// ];

const rules: ValueDate[] = [
    { name: 'ガチエリア', imageUrl: '/images/gatieria.webp' },
    { name: 'ガチヤグラ', imageUrl: '/images/gatiyagura.webp' },
    { name: 'ガチホコ', imageUrl: '/images/gatihoko.webp' },
    { name: 'ガチアサリ', imageUrl: '/images/gatiasari.webp' },
    { name: 'ナワバリ', imageUrl: '/images/nawabari.webp' },
];

// ビンゴのコンポーネント
const Bingo = () => {
    const [board, setBoard] = useState<CellData[][]>([]);

    const initializeBoard = useCallback(() => {
        const newBoard: CellData[][] = [];

        for (let row = 0; row < 3; row++) {
            const newRow: CellData[] = [];
            for (let col = 0; col < 3; col++) {
                // const weapon:ValueDate = getRandomElement(weapons);
                const rule: ValueDate = getRandomElement(rules);

                const cellData: CellData = {
                    // value1: weapon.name,
                    value1: getRandomElementString(initializeWeapons()),
                    value2: rule.name,
                    // value1Image: weapon.imageUrl,
                    value1Image: 'weaponImageUrl',
                    value2Image: rule.imageUrl,
                    marked: false,                   
                };
                newRow.push(cellData);
            }
            newBoard.push(newRow);
        }

        setBoard(newBoard);
    // },[weapons,rules]);
    },[rules]);

    useEffect(() => {
        initializeBoard();
    }, [initializeBoard]);



    const handleClick = (row: number, col: number) => {
        const updatedBoard = [...board];
        updatedBoard[row][col].marked = true;
        setBoard(updatedBoard);
    };

    const regenerateBoard = () => {
        initializeBoard();
    };

    const getRandomElement = (array: ValueDate[]) => {
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    };

    const getRandomElementString = (array: string[]) => {
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    };

    

    return (
        <div className={styles.container}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <h1 className={styles.title}>目標ビンゴ</h1>
            <table className={styles.bingoTable}>
                <tbody>
                    {board.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, colIndex) => (
                                <td
                                    key={colIndex}
                                    onClick={() => handleClick(rowIndex, colIndex)}
                                    // className={styles.bingoCell }   
                                    className={`${cell.marked ? styles.cellMarked : styles.cellNoMarke}`}
                                    // style={cell.marked ? 'background: green': 'background: white'}   
                                >
                                    <div className={styles.weapon}>
                                        {cell.value1}
                                    </div>
                                    <div className={styles.stage}>
                                        {cell.value2}
                                    </div>
                                    {/* <div className="flex items-center justify-center text-gray-500 font-bold h-12">
                                        {cell.value1}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 h-4">
                                        {cell.value2}
                                    </div> */}
                                    {/* <img src={cell.value1Image} alt="写真" className="w-full h-full" />
                                    <img src={cell.value2Image} alt="写真" className="w-full h-full" /> */}
                                </td>

                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* 再生性ボタン */}
            <button
                className={styles.regenerate}
                onClick={regenerateBoard}
            >
                再生成
            </button>
            
            <div className={styles.ruleTitle}>
                遊び方
            </div>
            <div className={styles.ruleText}>
                ・各マスには、武器とルールがセットになっています。
                <br></br>
                ・マスの武器とルールでゲームに勝利したとき、そのマスを開けてください。
            </div>
        </div>
    );

};

export default Bingo;
