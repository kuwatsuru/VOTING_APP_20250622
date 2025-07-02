import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  username: string | null;
  setUsername: (username: string) => void;
  clearUsername: () => void;
  userVotes: Record<string, string[]>; // ユーザー名 -> 投票したポールIDの配列
  addUserVote: (pollId: string) => void;
  hasUserVoted: (pollId: string) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      username: null,
      setUsername: (username: string) => set({ username }),
      clearUsername: () => set({ username: null }),
      userVotes: {},
      addUserVote: (pollId: string) => {
        const { username, userVotes } = get();
        if (!username) return;

        const currentVotes = userVotes[username] || [];
        if (!currentVotes.includes(pollId)) {
          set({
            userVotes: {
              ...userVotes,
              [username]: [...currentVotes, pollId],
            },
          });
        }
      },
      hasUserVoted: (pollId: string) => {
        const { username, userVotes } = get();
        if (!username) return false;
        return (userVotes[username] || []).includes(pollId);
      },
    }),
    {
      name: "user-store",
    }
  )
);
