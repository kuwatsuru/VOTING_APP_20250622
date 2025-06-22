import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Poll } from './types';

interface VotingStore {
  polls: Poll[];
  currentPoll: Poll | null;
  userVotes: Record<string, string>; // pollId -> optionId (Mapの代わりにオブジェクト)
  createPoll: (title: string, description: string, options: string[]) => void;
  vote: (pollId: string, optionId: string) => void;
  setCurrentPoll: (poll: Poll | null) => void;
  getPollById: (id: string) => Poll | undefined;
  getUserVote: (pollId: string) => string | undefined;
  showPollResults: (pollId: string) => void;
}

export const useVotingStore = create<VotingStore>()(
  persist(
    (set, get) => ({
      polls: [],
      currentPoll: null,
      userVotes: {},

      createPoll: (title, description, options) => {
        const newPoll: Poll = {
          id: Date.now().toString(),
          title,
          description,
          options: options.map((text, index) => ({
            id: `${Date.now()}-${index}`,
            text,
            votes: 0,
          })),
          createdAt: new Date(),
          isActive: true,
          showResults: false,
        };

        set((state) => ({
          polls: [...state.polls, newPoll],
          currentPoll: newPoll,
        }));
      },

      vote: (pollId, optionId) => {
        set((state) => {
          const updatedPolls = state.polls.map((poll) => {
            if (poll.id === pollId) {
              const updatedOptions = poll.options.map((option) => {
                if (option.id === optionId) {
                  return { ...option, votes: option.votes + 1 };
                }
                return option;
              });
              return { ...poll, options: updatedOptions, showResults: true };
            }
            return poll;
          });

          const updatedUserVotes = { ...state.userVotes, [pollId]: optionId };

          const updatedCurrentPoll = state.currentPoll?.id === pollId
            ? updatedPolls.find(p => p.id === pollId) || null
            : state.currentPoll;

          return {
            polls: updatedPolls,
            currentPoll: updatedCurrentPoll,
            userVotes: updatedUserVotes,
          };
        });
      },

      setCurrentPoll: (poll) => {
        set({ currentPoll: poll });
      },

      getPollById: (id) => {
        return get().polls.find(poll => poll.id === id);
      },

      getUserVote: (pollId) => {
        return get().userVotes[pollId];
      },

      showPollResults: (pollId) => {
        set((state) => ({
          polls: state.polls.map((poll) => 
            poll.id === pollId ? { ...poll, showResults: true } : poll
          ),
          currentPoll: state.currentPoll?.id === pollId 
            ? { ...state.currentPoll, showResults: true }
            : state.currentPoll,
        }));
      },
    }),
    {
      name: 'voting-storage',
      // シリアライゼーション
      serialize: (state) => JSON.stringify({
        ...state,
        polls: state.polls.map(poll => ({
          ...poll,
          createdAt: poll.createdAt instanceof Date ? poll.createdAt.toISOString() : poll.createdAt,
        })),
        currentPoll: state.currentPoll ? {
          ...state.currentPoll,
          createdAt: state.currentPoll.createdAt instanceof Date ? state.currentPoll.createdAt.toISOString() : state.currentPoll.createdAt,
        } : null,
      }),
      // デシリアライゼーション
      deserialize: (str) => {
        try {
          const data = JSON.parse(str);
          
          return {
            ...data,
            userVotes: data.userVotes || {},
            polls: (data.polls || []).map((poll: { createdAt: string; showResults?: boolean; [key: string]: unknown }) => ({
              ...poll,
              createdAt: poll.createdAt,
              showResults: poll.showResults ?? false,
            })),
            currentPoll: data.currentPoll ? {
              ...data.currentPoll,
              createdAt: data.currentPoll.createdAt,
              showResults: data.currentPoll.showResults ?? false,
            } : null,
          };
        } catch (error) {
          console.error('Failed to deserialize voting store:', error);
          return {
            polls: [],
            currentPoll: null,
            userVotes: {},
          };
        }
      },
    }
  )
); 