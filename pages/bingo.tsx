import React, { useState, useEffect,useCallback,useMemo } from 'react';
import styles from '@/styles/bingo.module.scss'
import Head from 'next/head';
import { Container } from 'postcss';

// 各セルのデータのインターフェース
interface CellData {
    goal: string;
    marked: boolean;
}

// ビンゴのコンポーネント
const Bingo = ({ goals }: { goals: string[] }) => {
    // ビンゴのボードを作成
    const [board, setBoard] = useState<CellData[][]>([]);

    const initializeBoard = useCallback(() => {
        const newBoard: CellData[][] = [];

        for (let row = 0; row < 3; row++) {
            const newRow: CellData[] = [];
            for (let col = 0; col < 3; col++) {
                // 何番目の目標か
                const goal_index: number = row*3 + col;

                // どの目標を割り当てるか
                if(goal_index === 4)
                {
                    // 4番，真ん中は「目標を立てる」固定
                    const cellData: CellData = {
                    goal: "目標を立てる",
                    marked: true,                   
                    };
                    newRow.push(cellData);
                }else if(goal_index < 4){
                    // 真ん中の前なら，goal_indexはそのまま
                    const cellData: CellData = {
                    goal: goals[goal_index],
                    marked: false,                   
                    };
                    newRow.push(cellData);
                }else{
                    // 真ん中の後なら，goal_index - 1
                    const cellData: CellData = {
                    goal: goals[goal_index - 1],
                    marked: false,                   
                    };
                    newRow.push(cellData);
                }
            }
            newBoard.push(newRow);
        }

        setBoard(newBoard);
    },[goals]);

    useEffect(() => {
        initializeBoard();
    }, [initializeBoard]);


    // ビンゴの各セルをクリックした時の処理
    const handleClick = (row: number, col: number) => {
        const updatedBoard = [...board];

        // trueならfalse，falseならtrue
        if(updatedBoard[row][col].marked === true)
        {
            updatedBoard[row][col].marked = false;
        }else
        {
            updatedBoard[row][col].marked = true;
        }
        
        setBoard(updatedBoard);
    };

    return (
        <div className={styles.container}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <h1 className={styles.title}>目標ビンゴ</h1>
            <div className={styles.bingoTable}>
                    {board.map((row, rowIndex) => (
                        <div 
                        className={styles.bingoRow}
                        key={rowIndex}>
                            {row.map((cell, colIndex) => (
                                <div
                                    key={colIndex}
                                    onClick={() => handleClick(rowIndex, colIndex)}
                                    className={`${styles.cell} ${cell.marked ? styles.cellMarked : styles.cellNoMarke}`}
                                >
                                    <p>
                                        {cell.goal}
                                    </p>
                                    
                                </div>

                            ))}
                        </div>
                    ))}
            </div>
        </div>
    );

};

export default Bingo;
