import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Bingo from '@/pages/bingo';
import styles from '@/styles/bingo.module.scss';
import { a } from 'vitest/dist/chunks/suite.d.BJWk38HB';

// sleep ヘルパー関数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Bingoコンポーネント', () => {
  type Goal = { id: string; goal: string; isAchieved: boolean };

  const mockGoals: Goal[] = [
    { id: 'id1', goal: '目標1', isAchieved: false },
    { id: 'id2', goal: '目標2', isAchieved: false },
    { id: 'id3', goal: '目標3', isAchieved: false },
    { id: 'id4', goal: '目標4', isAchieved: false },
    { id: 'id5', goal: '目標5', isAchieved: false },
    { id: 'id6', goal: '目標6', isAchieved: false },
    { id: 'id7', goal: '目標7', isAchieved: false },
    { id: 'id8', goal: '目標8', isAchieved: false },
  ];
  const mockBingoId = 'test-bingo-id';

  beforeEach(() => {
    // テストの前に初期化
  });

  it('コンポーネントがレンダリングされる', () => {
    render(<Bingo goals={mockGoals} bingoId={mockBingoId} />);
    expect(screen.getByText('目標を立てる')).toBeInTheDocument();
  });

  it('3x3のビンゴボードが作成される', () => {
    render(<Bingo goals={mockGoals} bingoId={mockBingoId} />);
    // 9つのセルが存在することを確認
    const cells = screen.getAllByText(/目標[1-8]|目標を立てる/);
    expect(cells.length).toBe(9);
  });

  it('中央のセルは「目標を立てる」である', () => {
    const { container } = render(<Bingo goals={mockGoals} bingoId={mockBingoId} />);
    const cells = container.querySelectorAll(`.${styles.cell}`);

    // 中央のセルのテキストを確認
    expect(cells[4]).toHaveTextContent('目標を立てる');
  });

  it('最初は中央のセルのみマークされている', () => {
    const { container } = render(<Bingo goals={mockGoals} />);
    const cells = container.querySelectorAll(`.${styles.cell}`);

    // 中央のセルがマークされていることを確認
    expect(cells[4]).toHaveClass(styles.cellMarked);

    // その他のセルはマークされていない
    cells.forEach((cell, index) => {
      if (index !== 4) {
        expect(cell).toHaveClass(styles.cellNoMarked);
      }
    });
  });

  it('セルをクリックするとマーク状態がトグルされる', async () => {
    const { container } = render(<Bingo goals={mockGoals} bingoId={mockBingoId} />);
    const cells = container.querySelectorAll(`.${styles.cell}`);
    
    // 最初のセルがマークされていないことを確認
    expect(cells[0]).toHaveClass(styles.cellNoMarked);

    // 最初のセルをクリック
    fireEvent.click(cells[0]);
    await sleep(1000); 
    
    // クラスが変更されることを確認
    expect(cells[0]).toHaveClass(styles.cellMarked);
    
    // もう一度クリックするとマークが解除される
    fireEvent.click(cells[0]);
    await sleep(1000); 
    expect(cells[0]).toHaveClass(styles.cellNoMarked);
  });

  it('複数のセルが独立してマーク可能である', async () => {
    const { container } = render(<Bingo goals={mockGoals} bingoId={mockBingoId} />);
    const cells = container.querySelectorAll(`.${styles.cell}`);
    
    // 各セルがマークされていないことを確認
    expect(cells[0]).toHaveClass(styles.cellNoMarked);
    expect(cells[2]).toHaveClass(styles.cellNoMarked);
    expect(cells[6]).toHaveClass(styles.cellNoMarked);

    // 複数のセルをクリック
    fireEvent.click(cells[0]);
    await sleep(1000); 
    fireEvent.click(cells[2]);
    await sleep(1000); 
    fireEvent.click(cells[6]);
    await sleep(1000); 
    
    // 各セルがマークされていることを確認
    expect(cells[0]).toHaveClass(styles.cellMarked);
    expect(cells[2]).toHaveClass(styles.cellMarked);
    expect(cells[6]).toHaveClass(styles.cellMarked);
  });

  it('目標が正しく割り当てられる', () => {
    const { container } = render(<Bingo goals={mockGoals} bingoId={mockBingoId} />);
    const cells = container.querySelectorAll(`.${styles.cell}`);
    
    // 中央のセルのテキストを確認
    expect(cells[4]).toHaveTextContent('目標を立てる');

    // その他のセルのテキストを確認
    cells.forEach((cell, index) => {
      if (index !== 4) {
        expect(cell).toHaveTextContent(mockGoals[index < 4 ? index : index - 1].goal);
      }
    });
  });
});
