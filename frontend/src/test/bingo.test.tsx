import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Bingo from '@/pages/bingo';
import styles from '@/styles/bingo.module.scss'

describe('Bingoコンポーネント', () => {
  const mockGoals = [
    '目標1',
    '目標2',
    '目標3',
    '目標4',
    '目標5',
    '目標6',
    '目標7',
    '目標8',
  ];

  beforeEach(() => {
    // テストの前に初期化
  });

  it('コンポーネントがレンダリングされる', () => {
    render(<Bingo goals={mockGoals} />);
    expect(screen.getByText('目標を立てる')).toBeInTheDocument();
  });

  it('3x3のビンゴボードが作成される', () => {
    render(<Bingo goals={mockGoals} />);
    // 9つのセルが存在することを確認
    const cells = screen.getAllByText(/目標[1-8]|目標を立てる/);
    expect(cells.length).toBe(9);
  });

  it('中央のセルは「目標を立てる」である', () => {
    const { container } = render(<Bingo goals={mockGoals} />);
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
        expect(cell).toHaveClass(styles.cellNoMarke);
      }
    });
  });

  it('セルをクリックするとマーク状態がトグルされる', () => {
    const { container } = render(<Bingo goals={mockGoals} />);
    const cells = container.querySelectorAll(`.${styles.cell}`);
    
    // 最初のセルがマークされていないことを確認
    expect(cells[0]).toHaveClass(styles.cellNoMarke);

    // 最初のセルをクリック
    fireEvent.click(cells[0]);
    
    // クラスが変更されることを確認
    expect(cells[0]).toHaveClass(styles.cellMarked);
    
    // もう一度クリックするとマークが解除される
    fireEvent.click(cells[0]);
    expect(cells[0]).toHaveClass(styles.cellNoMarke);
  });

  it('複数のセルが独立してマーク可能である', () => {
    const { container } = render(<Bingo goals={mockGoals} />);
    const cells = container.querySelectorAll(`.${styles.cell}`);
    
    // 各セルがマークされていないことを確認
    expect(cells[0]).toHaveClass(styles.cellNoMarke);
    expect(cells[2]).toHaveClass(styles.cellNoMarke);
    expect(cells[6]).toHaveClass(styles.cellNoMarke);

    // 複数のセルをクリック
    fireEvent.click(cells[0]);
    fireEvent.click(cells[2]);
    fireEvent.click(cells[6]);
    
    // 各セルがマークされていることを確認
    expect(cells[0]).toHaveClass(styles.cellMarked);
    expect(cells[2]).toHaveClass(styles.cellMarked);
    expect(cells[6]).toHaveClass(styles.cellMarked);
  });

  it('目標が正しく割り当てられる', () => {
    const { container } = render(<Bingo goals={mockGoals} />);
    const cells = container.querySelectorAll(`.${styles.cell}`);
    
    // 中央のセルのテキストを確認
    expect(cells[4]).toHaveTextContent('目標を立てる');

    // その他のセルのテキストを確認
    cells.forEach((cell, index) => {
      if (index !== 4) {
        expect(cell).toHaveTextContent(mockGoals[index < 4 ? index : index - 1]);
      }
    });
  });
});
