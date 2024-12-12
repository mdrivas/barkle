import { render, screen } from '@testing-library/react';
import DailyGame from '~/app/daily/page';
import { describe, it, expect, vi } from 'vitest';
import { TestWrapper } from '../utils/TestWrapper';

// Mock the tRPC hooks
vi.mock('~/trpc/react', () => ({
  api: {
    game: {
      getDailyBreeds: {
        useQuery: () => ({
          data: {
            breeds: JSON.stringify([
              { breed: 'labrador', imageUrl: '/test.jpg', type: 'api' }
            ])
          },
          isLoading: false
        })
      }
    },
    score: {
      canPlayToday: {
        useQuery: () => ({
          data: { canPlay: true },
          isLoading: false
        })
      },
      getCurrentStreak: {
        useQuery: () => ({
          data: 0,
          isLoading: false
        })
      },
      saveScore: {
        useMutation: () => ({
          mutateAsync: vi.fn(),
          isLoading: false
        })
      },
      getTodayScore: {
        useQuery: () => ({
          data: null,
          isLoading: false
        })
      }
    }
  }
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' })
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: () => null })
}));

describe('DailyGame', () => {
  it('renders initial game state', () => {
    render(
      <TestWrapper>
        <DailyGame />
      </TestWrapper>
    );
    expect(screen.getByText('Barkle')).toBeInTheDocument();
  });

  it('shows initial score of 0/5', () => {
    render(
      <TestWrapper>
        <DailyGame />
      </TestWrapper>
    );
    expect(screen.getByText('0/5')).toBeInTheDocument();
  });
});