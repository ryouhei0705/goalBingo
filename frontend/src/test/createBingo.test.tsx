import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateBingo from '@/pages/createBingo';
import styles from '@/styles/createBingo.module.scss';

// Next.jsのrouterをモック
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('CreateBingoコンポーネント', () => {
  beforeEach(() => {
    // テストの前に初期化
    vi.clearAllMocks();
  });

  it('コンポーネントがレンダリングされる', () => {
    render(<CreateBingo />);
    expect(screen.getByText('目標ビンゴを作成しよう!!')).toBeInTheDocument();
  });

  it('8つの入力フィールドが表示される', () => {
    render(<CreateBingo />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(8);
  });

  it('作成ボタンが表示される', () => {
    render(<CreateBingo />);
    const submitButton = screen.getByRole('button', { name: /作成/ });
    expect(submitButton).toBeInTheDocument();
  });

  it('ルール説明が表示される', () => {
    render(<CreateBingo />);
    expect(screen.getByText(/目標を8個入力してください/)).toBeInTheDocument();
    expect(screen.getByText(/日本語または英数字/)).toBeInTheDocument();
    expect(screen.getByText(/個人情報等/)).toBeInTheDocument();
  });

  it('入力フィールドに値を入力できる', async () => {
    const user = userEvent.setup();
    const { container } = render(<CreateBingo />);
    
    const inputs = container.getElementsByClassName(`${styles.goalForm}`);
    await user.type(inputs[0], '目標1');
    
    expect(inputs[0]).toHaveValue('目標1');
  });

  it('空の目標でバリデーションエラーが表示される', async () => {
    const user = userEvent.setup();
    const { container } = render(<CreateBingo />);
    
    const submitButton = screen.getByRole('button', { name: /作成/ });
    await user.click(submitButton);
    
    // 最初のgoalForm要素の下のエラーメッセージを確認
    const firstGoalForm = container.getElementsByClassName(styles.goalForm)[0];
    await waitFor(() => {
        expect(
        within(firstGoalForm.parentElement!).getByText(/入力してください/)
        ).toBeInTheDocument();
    });
  });

  it('8個未満の目標ではバリデーションエラーが表示される', async () => {
    const user = userEvent.setup();
    const { container } = render(<CreateBingo />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // 4つだけ入力
    for (let i = 0; i < 4; i++) {
      await user.type(inputs[i], `目標${i + 1}`);
    }
    
    const submitButton = screen.getByRole('button', { name: /作成/ });
    await user.click(submitButton);
    
    // 5個目のgoalForm要素の下のエラーメッセージを確認
    const fifthGoalForm = container.getElementsByClassName(styles.goalForm)[4];
    await waitFor(() => {
        expect(
        within(fifthGoalForm.parentElement!).getByText(/入力してください/)
        ).toBeInTheDocument();
    });
  });

  it('30文字を超える目標でバリデーションエラーが表示される', async () => {
    const user = userEvent.setup();
    const { container } = render(<CreateBingo />);
    
    const inputs = screen.getAllByRole('textbox');
    const longGoal = 'a'.repeat(31); // 31文字
    
    await user.type(inputs[0], longGoal);
    
    const submitButton = screen.getByRole('button', { name: /作成/ });
    await user.click(submitButton);
    
    // 最初のgoalForm要素の下のエラーメッセージを確認
    const firstGoalForm = container.getElementsByClassName(styles.goalForm)[0];
    await waitFor(() => {
        expect(
        within(firstGoalForm.parentElement!).getByText(/30文字以内で入力してください/)
        ).toBeInTheDocument();
    });
  });

  it('正しい値で8つすべて入力されるとバリデーションが通る', async () => {
    const user = userEvent.setup();
    render(<CreateBingo />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // 8個すべてに有効な値を入力
    for (let i = 0; i < 8; i++) {
      await user.type(inputs[i], `目標${i + 1}`);
    }
    
    const submitButton = screen.getByRole('button', { name: /作成/ });
    // ボタンがdisabledでないことを確認
    expect(submitButton).not.toBeDisabled();
  });

  it('ローディング中はボタンがdisabledになる', async () => {
    const user = userEvent.setup();
    render(<CreateBingo />);
    
    const inputs = screen.getAllByRole('textbox');
    
    // 8個の有効な値を入力
    for (let i = 0; i < 8; i++) {
      await user.type(inputs[i], `目標${i + 1}`);
    }
    
    // APIを遅延させるためにfetchをモック
    global.fetch = vi.fn(() =>
      new Promise(resolve =>
        setTimeout(() =>
          resolve({
            ok: true,
            json: () => Promise.resolve({ bingoId: 'test-id' }),
          } as Response),
          100
        )
      )
    );
    
    const submitButton = screen.getByRole('button', { name: /作成/ });
    await user.click(submitButton);
    
    // ローディング中はボタンがdisabled
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('複数の目標を同時に入力できる', async () => {
    const user = userEvent.setup();
    render(<CreateBingo />);
    
    const inputs = screen.getAllByRole('textbox');
    const testGoals = ['学習', '運動', 'プロジェクト', 'リーディング', '旅行', 'スキル習得', 'ネットワーキング', '読書'];
    
    for (let i = 0; i < 8; i++) {
      await user.type(inputs[i], testGoals[i]);
    }
    
    await waitFor(() => {
      for (let i = 0; i < 8; i++) {
        expect(inputs[i]).toHaveValue(testGoals[i]);
      }
    });
  });
});