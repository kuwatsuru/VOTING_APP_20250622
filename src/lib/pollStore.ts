import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Poll {
  id: string;
  title: string;
  description: string;
  teamName: string;
  options: string[];
  votes: Record<string, number>; // オプション -> 投票数
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

interface PollState {
  polls: Poll[];
  createPoll: (poll: Omit<Poll, "id" | "createdAt" | "votes">) => void;
  vote: (pollId: string, option: string) => void;
  getPoll: (pollId: string) => Poll | undefined;
  getPollsByTeam: (teamName: string) => Poll[];
  getUserPolls: (username: string) => Poll[];
  getTeamPolls: (teamName: string) => Poll[];
  deletePoll: (pollId: string) => void;
}

export const usePollStore = create<PollState>()(
  persist(
    (set, get) => ({
      polls: [],
      createPoll: (pollData) => {
        const newPoll: Poll = {
          ...pollData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          votes: {},
        };
        set((state) => ({
          polls: [...state.polls, newPoll],
        }));
      },
      vote: (pollId: string, option: string) => {
        set((state) => ({
          polls: state.polls.map((poll) => {
            if (poll.id === pollId) {
              const currentVotes = poll.votes[option] || 0;
              return {
                ...poll,
                votes: {
                  ...poll.votes,
                  [option]: currentVotes + 1,
                },
              };
            }
            return poll;
          }),
        }));
      },
      getPoll: (pollId: string) => {
        return get().polls.find((poll) => poll.id === pollId);
      },
      getPollsByTeam: (teamName: string) => {
        return get().polls.filter((poll) => poll.teamName === teamName);
      },
      getUserPolls: (username: string) => {
        return get().polls.filter((poll) => poll.createdBy === username);
      },
      getTeamPolls: (teamName: string) => {
        return get().polls.filter((poll) => poll.teamName === teamName);
      },
      deletePoll: (pollId: string) => {
        set((state) => ({
          polls: state.polls.filter((poll) => poll.id !== pollId),
        }));
      },
    }),
    {
      name: "poll-store",
    }
  )
);
