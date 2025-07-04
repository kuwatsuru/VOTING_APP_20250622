import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  username: string | null; // チーム名
  memberName: string | null; // 個人名
  setUsername: (username: string) => void;
  setMemberName: (memberName: string) => void;
  clearUsername: () => void;
  clearMemberName: () => void;
  userVotes: Record<string, string[]>; // 個人名 -> 投票したポールIDの配列
  addUserVote: (pollId: string) => void;
  hasUserVoted: (pollId: string) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      username: null,
      memberName: null,
      setUsername: (username: string) => set({ username }),
      setMemberName: (memberName: string) => set({ memberName }),
      clearUsername: () => set({ username: null }),
      clearMemberName: () => set({ memberName: null }),
      userVotes: {},
      addUserVote: (pollId: string) => {
        const { memberName, userVotes } = get();
        if (!memberName) return;

        const currentVotes = userVotes[memberName] || [];
        if (!currentVotes.includes(pollId)) {
          set({
            userVotes: {
              ...userVotes,
              [memberName]: [...currentVotes, pollId],
            },
          });
        }
      },
      hasUserVoted: (pollId: string) => {
        const { memberName, userVotes } = get();
        if (!memberName) return false;
        return (userVotes[memberName] || []).includes(pollId);
      },
    }),
    {
      name: "user-store",
    }
  )
);
