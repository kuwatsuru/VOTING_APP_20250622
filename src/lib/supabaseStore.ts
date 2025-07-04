import { create } from "zustand";
import { supabase } from "./supabase";

// 投票の型定義
export interface Poll {
  id: string;
  title: string;
  description: string | null;
  teamName: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  showResults: boolean;
  options: PollOption[];
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface SupabaseVotingStore {
  polls: Poll[];
  currentPoll: Poll | null;
  loading: boolean;
  error: string | null;

  // 投票の取得
  fetchPolls: (teamName: string) => Promise<void>;
  fetchPollById: (id: string, teamName: string) => Promise<Poll | null>;

  // 投票の作成
  createPoll: (
    title: string,
    description: string,
    options: string[],
    teamName: string,
    createdBy: string
  ) => Promise<void>;

  // 投票の実行
  vote: (
    pollId: string,
    optionId: string,
    teamName: string,
    voterId: string
  ) => Promise<void>;

  // 投票の削除
  deletePoll: (pollId: string, teamName: string) => Promise<void>;

  // 結果表示の制御
  showPollResults: (pollId: string, teamName: string) => Promise<void>;

  // リアルタイム購読
  subscribeToPolls: (teamName: string) => void;
  unsubscribeFromPolls: () => void;
}

// エラーメッセージを詳細に表示する関数
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  if (error && typeof error === "object" && "error_description" in error) {
    return String(error.error_description);
  }
  if (error && typeof error === "object" && "details" in error) {
    return String(error.details);
  }
  return "Unknown error occurred";
};

export const useSupabaseVotingStore = create<SupabaseVotingStore>(
  (set, get) => ({
    polls: [],
    currentPoll: null,
    loading: false,
    error: null,

    fetchPolls: async (teamName: string) => {
      set({ loading: true, error: null });
      try {
        console.log("Fetching polls for team:", teamName);

        const { data: pollsData, error: pollsError } = await supabase
          .from("polls")
          .select("*")
          .eq("team_name", teamName)
          .order("created_at", { ascending: false });

        if (pollsError) {
          console.error("Error fetching polls:", pollsError);
          throw pollsError;
        }

        console.log("Polls data:", pollsData);

        const pollsWithOptions = await Promise.all(
          pollsData.map(async (poll) => {
            const { data: optionsData, error: optionsError } = await supabase
              .from("options")
              .select("*")
              .eq("poll_id", poll.id);

            if (optionsError) {
              console.error(
                "Error fetching options for poll:",
                poll.id,
                optionsError
              );
              throw optionsError;
            }

            return {
              id: poll.id,
              title: poll.title,
              description: poll.description,
              teamName: poll.team_name,
              createdBy: poll.created_by,
              createdAt: poll.created_at,
              isActive: poll.is_active,
              showResults: poll.show_results,
              options: optionsData.map((opt) => ({
                id: opt.id,
                text: opt.text,
                votes: opt.votes,
              })),
            };
          })
        );

        console.log("Polls with options:", pollsWithOptions);
        set({ polls: pollsWithOptions, loading: false });
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Error in fetchPolls:", error);
        set({ error: errorMessage, loading: false });
      }
    },

    fetchPollById: async (id: string, teamName: string) => {
      set({ loading: true, error: null });
      try {
        console.log("Fetching poll by ID:", id, "for team:", teamName);

        const { data: pollData, error: pollError } = await supabase
          .from("polls")
          .select("*")
          .eq("id", id)
          .eq("team_name", teamName)
          .single();

        if (pollError) {
          console.error("Error fetching poll:", pollError);
          throw pollError;
        }

        const { data: optionsData, error: optionsError } = await supabase
          .from("options")
          .select("*")
          .eq("poll_id", id);

        if (optionsError) {
          console.error("Error fetching options:", optionsError);
          throw optionsError;
        }

        const poll: Poll = {
          id: pollData.id,
          title: pollData.title,
          description: pollData.description,
          teamName: pollData.team_name,
          createdBy: pollData.created_by,
          createdAt: pollData.created_at,
          isActive: pollData.is_active,
          showResults: pollData.show_results,
          options: optionsData.map((opt) => ({
            id: opt.id,
            text: opt.text,
            votes: opt.votes,
          })),
        };

        set({ currentPoll: poll, loading: false });
        return poll;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Error in fetchPollById:", error);
        set({ error: errorMessage, loading: false });
        return null;
      }
    },

    createPoll: async (
      title: string,
      description: string,
      options: string[],
      teamName: string,
      createdBy: string
    ) => {
      set({ loading: true, error: null });
      try {
        console.log("Creating poll:", {
          title,
          description,
          options,
          teamName,
          createdBy,
        });

        const pollId = `poll_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // 投票を作成
        const { error: pollError } = await supabase.from("polls").insert({
          id: pollId,
          title,
          description,
          team_name: teamName,
          created_by: createdBy,
          is_active: true,
          show_results: false,
        });

        if (pollError) {
          console.error("Error creating poll:", pollError);
          throw pollError;
        }

        // 選択肢を作成
        const optionsToInsert = options.map((text, index) => ({
          id: `option_${pollId}_${index}`,
          poll_id: pollId,
          text,
          votes: 0,
        }));

        const { error: optionsError } = await supabase
          .from("options")
          .insert(optionsToInsert);

        if (optionsError) {
          console.error("Error creating options:", optionsError);
          throw optionsError;
        }

        console.log("Poll created successfully");
        // 投票一覧を再取得
        await get().fetchPolls(teamName);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Error in createPoll:", error);
        set({ error: errorMessage, loading: false });
      }
    },

    vote: async (
      pollId: string,
      optionId: string,
      teamName: string,
      voterId: string
    ) => {
      set({ loading: true, error: null });
      try {
        console.log("Voting:", { pollId, optionId, teamName, voterId });

        // 既に投票済みかチェック
        const { data: existingVote, error: checkError } = await supabase
          .from("votes")
          .select("*")
          .eq("poll_id", pollId)
          .eq("voter_id", voterId)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking existing vote:", checkError);
          throw checkError;
        }

        if (existingVote) {
          throw new Error("既に投票済みです");
        }

        // 投票を記録
        const { error: voteError } = await supabase.from("votes").insert({
          poll_id: pollId,
          option_id: optionId,
          voter_id: voterId,
          team_name: teamName,
        });

        if (voteError) {
          console.error("Error recording vote:", voteError);
          throw voteError;
        }

        // 現在の投票数を取得して+1
        const { data: currentOption, error: getError } = await supabase
          .from("options")
          .select("votes")
          .eq("id", optionId)
          .single();

        if (getError) {
          console.error("Error getting current votes:", getError);
          throw getError;
        }

        // 投票数を更新
        const { error: updateError } = await supabase
          .from("options")
          .update({ votes: (currentOption.votes || 0) + 1 })
          .eq("id", optionId);

        if (updateError) {
          console.error("Error updating vote count:", updateError);
          throw updateError;
        }

        // 投票結果を表示
        const { error: showResultsError } = await supabase
          .from("polls")
          .update({ show_results: true })
          .eq("id", pollId);

        if (showResultsError) {
          console.error("Error showing results:", showResultsError);
          throw showResultsError;
        }

        console.log("Vote recorded successfully");

        // 投票一覧と現在の投票を再取得
        await get().fetchPolls(teamName);

        // 現在表示中の投票を更新
        const currentPoll = get().currentPoll;
        if (currentPoll && currentPoll.id === pollId) {
          await get().fetchPollById(pollId, teamName);
        }

        set({ loading: false });
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Error in vote:", error);
        set({ error: errorMessage, loading: false });
      }
    },

    deletePoll: async (pollId: string, teamName: string) => {
      set({ loading: true, error: null });
      try {
        console.log("Deleting poll:", pollId, "for team:", teamName);

        // 関連する投票を削除
        const { error: votesError } = await supabase
          .from("votes")
          .delete()
          .eq("poll_id", pollId);

        if (votesError) {
          console.error("Error deleting votes:", votesError);
          throw votesError;
        }

        // 選択肢を削除
        const { error: optionsError } = await supabase
          .from("options")
          .delete()
          .eq("poll_id", pollId);

        if (optionsError) {
          console.error("Error deleting options:", optionsError);
          throw optionsError;
        }

        // 投票を削除
        const { error: pollError } = await supabase
          .from("polls")
          .delete()
          .eq("id", pollId)
          .eq("team_name", teamName);

        if (pollError) {
          console.error("Error deleting poll:", pollError);
          throw pollError;
        }

        console.log("Poll deleted successfully");
        // 投票一覧を再取得
        await get().fetchPolls(teamName);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Error in deletePoll:", error);
        set({ error: errorMessage, loading: false });
      }
    },

    showPollResults: async (pollId: string, teamName: string) => {
      set({ loading: true, error: null });
      try {
        console.log("Showing results for poll:", pollId);

        const { error } = await supabase
          .from("polls")
          .update({ show_results: true })
          .eq("id", pollId)
          .eq("team_name", teamName);

        if (error) {
          console.error("Error showing poll results:", error);
          throw error;
        }

        console.log("Poll results shown successfully");
        // 投票一覧を再取得
        await get().fetchPolls(teamName);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Error in showPollResults:", error);
        set({ error: errorMessage, loading: false });
      }
    },

    subscribeToPolls: (teamName: string) => {
      console.log("Subscribing to polls for team:", teamName);

      const subscription = supabase
        .channel("polls_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "polls",
            filter: `team_name=eq.${teamName}`,
          },
          () => {
            console.log("Polls changed, refetching...");
            get().fetchPolls(teamName);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "options",
          },
          () => {
            console.log("Options changed, refetching...");
            get().fetchPolls(teamName);

            // 現在表示中の投票も更新
            const currentPoll = get().currentPoll;
            if (currentPoll) {
              get().fetchPollById(currentPoll.id, teamName);
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "votes",
            filter: `team_name=eq.${teamName}`,
          },
          () => {
            console.log("Votes changed, refetching...");
            get().fetchPolls(teamName);

            // 現在表示中の投票も更新
            const currentPoll = get().currentPoll;
            if (currentPoll) {
              get().fetchPollById(currentPoll.id, teamName);
            }
          }
        )
        .subscribe();

      return subscription;
    },

    unsubscribeFromPolls: () => {
      console.log("Unsubscribing from polls");
      supabase.removeAllChannels();
    },
  })
);
