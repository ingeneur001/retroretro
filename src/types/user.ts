// src/types/user.ts  
export interface User {
  id: string;
  username: string;
  email: string;
  // Bestehende Properties aus UserAuth.tsx
  totalScore: number;
  gamesPlayed: number;
  favoriteGame: string;
  // Fehlende Properties für UserManager.tsx
  createdAt: Date;
  stats: {
    totalScore: number;
    gamesPlayed: number;
    favoriteGame: string;
  };
}

// Falls du die alte Definition behalten willst, erstelle einen Alias
export type AuthUser = User;