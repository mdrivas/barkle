import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock tRPC mutations
vi.mock('~/trpc/react', () => ({
  api: {
    score: {
      attachScoreToUser: {
        useMutation: () => ({
          mutate: vi.fn(),
          isSuccess: false,
        }),
      },
      saveScore: {
        useMutation: () => ({
          mutate: vi.fn(),
          isSuccess: false,
        }),
      },
    },
    createClient: () => ({}),
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
})); 