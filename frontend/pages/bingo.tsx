import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/bingo.module.scss'
import Head from 'next/head';

type GoalItem = { id: string; goal: string; isAchieved: boolean };
type CellData = { goalId?: string; goal: string; marked: boolean };

const Bingo = ({ goals, bingoId }: { goals: GoalItem[]; bingoId: string }) => {
    const [board, setBoard] = useState<CellData[][]>([]);
    const [loading, setLoading] = useState(false);

    const initializeBoard = useCallback(() => {
        const newBoard: CellData[][] = [];
        for (let row = 0; row < 3; row++) {
            const newRow: CellData[] = [];
            for (let col = 0; col < 3; col++) {
                const idx = row * 3 + col;
                if (idx === 4) {
                    newRow.push({ goal: '目標を立てる', marked: true });
                } else {
                    const sourceIdx = idx < 4 ? idx : idx - 1; // 真ん中を抜いた並び
                    const g = goals[sourceIdx];
                    newRow.push({ goalId: g.id, goal: g.goal, marked: g.isAchieved });
                }
            }
            newBoard.push(newRow);
        }
        setBoard(newBoard);
    }, [goals]);

    useEffect(() => { initializeBoard(); }, [initializeBoard]);

    // ビンゴの各セルをクリックした時の処理
    const handleClick = async (row: number, col: number) => {
        // 真ん中は固定
        if (row === 1 && col === 1) return;

        const updated = board.map(r => r.map(c => ({ ...c })));
        updated[row][col].marked = !updated[row][col].marked;
        setBoard(updated);

        // 8件分の payload を組み立て
        const payloadGoals = updated
            .flat()
            .filter(c => c.goalId)
            .map(c => ({ goalId: c.goalId!, isAchieved: c.marked }));

        // サーバー期待のキーに合わせて送信
        const goalIds = payloadGoals.map(p => p.goalId);
        const isAchieveds = payloadGoals.map(p => p.isAchieved);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/goals/${bingoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goalIds, isAchieveds }),
            });
            if (!res.ok) throw new Error(`Update failed: ${res.status}`);
        } catch (e) {
            console.error(e);
            // ロールバック
            updated[row][col].marked = !updated[row][col].marked;
            setBoard(updated);
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <h1 className={styles.title}>目標ビンゴ</h1>
            <div className={styles.bingoTable}>
                {board.map((row, rowIndex) => (
                    <div className={styles.bingoRow} key={rowIndex}>
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                onClick={() => handleClick(rowIndex, colIndex)}
                                className={`${styles.cell} ${cell.marked ? styles.cellMarked : styles.cellNoMarked}`}
                            >
                                <p>{cell.goal}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Bingo;
