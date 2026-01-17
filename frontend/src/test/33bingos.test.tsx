import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen} from '@testing-library/react';
import Home, { getServerSideProps } from '@/pages/33bingos/[bingoId]';

// Next.jsのrouterをモック
vi.mock('next/router', () => ({
  useRouter: () => ({
    isReady: true,
    query: { bingoId: 'test-bingo-id' },
  }),
}));

// fetch のグローバルモック
global.fetch = vi.fn();

describe('[bingoId] ページ', () => {
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
    vi.clearAllMocks();
  });

  describe('Homeコンポーネント', () => {
    it('ページがレンダリングされる', () => {
      render(<Home goals={mockGoals} bingoId={mockBingoId} />);
      expect(screen.getByText('目標ビンゴ')).toBeInTheDocument();
    });

    it('Bingoコンポーネントが表示される', () => {
      render(<Home goals={mockGoals} bingoId={mockBingoId} />);
      expect(screen.getByText('目標を立てる')).toBeInTheDocument();
    });

    it('目標がすべて表示される', () => {
      render(<Home goals={mockGoals} bingoId={mockBingoId} />);
      
      mockGoals.forEach((goal) => {
        expect(screen.getByText(goal.goal)).toBeInTheDocument();
      });
    });

    it('CreateBingoコンポーネントが表示される', () => {
      render(<Home goals={mockGoals} bingoId={mockBingoId} />);
      expect(screen.getByText('目標ビンゴを作成しよう!!')).toBeInTheDocument();
    });
  });

  describe('getServerSideProps', () => {
    it('無効なUUIDフォーマットで404を返す', async () => {
      const result = await getServerSideProps({
        params: { bingoId: 'invalid-id' },
      } as any);

      expect(result).toEqual({ notFound: true });
    });
  });
});
