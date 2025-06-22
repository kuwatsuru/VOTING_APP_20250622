import { create } from 'zustand';
import { supabase } from './supabase';
import { Poll } from './types';

interface SupabaseVotingStore {
  polls: Poll[];
  currentPoll: Poll | null;
  loading: boolean;
  error: string | null;
  
  // 投票の取得
  fetchPolls: () => Promise<void>;
  fetchPollById: (id: string) => Promise<Poll | null>;
  
  // 投票の作成
  createPoll: (title: string, description: string, options: string[]) => Promise<void>;
  
  // 投票の実行
  vote: (pollId: string, optionId: string) => Promise<void>;
  
  // 投票の削除
  deletePoll: (pollId: string) => Promise<void>;
  
  // 結果表示の制御
  showPollResults: (pollId: string) => Promise<void>;
  
  // リアルタイム購読
  subscribeToPolls: () => void;
  unsubscribeFromPolls: () => void;
}

// ユニークな投票者IDを生成（実際のアプリでは認証システムを使用）
const generateVoterId = () => {
  if (typeof window !== 'undefined') {
    let voterId = localStorage.getItem('voter-id');
    if (!voterId) {
      voterId = `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('voter-id', voterId);
    }
    return voterId;
  }
  return `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useSupabaseVotingStore = create<SupabaseVotingStore>((set, get) => ({
  polls: [],
  currentPoll: null,
  loading: false,
  error: null,

  fetchPolls: async () => {
    set({ loading: true, error: null });
    try {
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      const pollsWithOptions = await Promise.all(
        pollsData.map(async (poll) => {
          const { data: optionsData, error: optionsError } = await supabase
            .from('options')
            .select('*')
            .eq('poll_id', poll.id);

          if (optionsError) throw optionsError;

          return {
            id: poll.id,
            title: poll.title,
            description: poll.description,
            createdAt: poll.created_at,
            isActive: poll.is_active,
            showResults: poll.show_results,
            options: optionsData.map(opt => ({
              id: opt.id,
              text: opt.text,
              votes: opt.votes,
            })),
          };
        })
      );

      set({ polls: pollsWithOptions, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  fetchPollById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', id)
        .single();

      if (pollError) throw pollError;

      const { data: optionsData, error: optionsError } = await supabase
        .from('options')
        .select('*')
        .eq('poll_id', id);

      if (optionsError) throw optionsError;

      const poll: Poll = {
        id: pollData.id,
        title: pollData.title,
        description: pollData.description,
        createdAt: pollData.created_at,
        isActive: pollData.is_active,
        showResults: pollData.show_results,
        options: optionsData.map(opt => ({
          id: opt.id,
          text: opt.text,
          votes: opt.votes,
        })),
      };

      set({ currentPoll: poll, loading: false });
      return poll;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      return null;
    }
  },

  createPoll: async (title: string, description: string, options: string[]) => {
    set({ loading: true, error: null });
    try {
      const pollId = `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 投票を作成
      const { error: pollError } = await supabase
        .from('polls')
        .insert({
          id: pollId,
          title,
          description,
          is_active: true,
          show_results: false,
        });

      if (pollError) throw pollError;

      // 選択肢を作成
      const optionsToInsert = options.map((text, index) => ({
        id: `option_${pollId}_${index}`,
        poll_id: pollId,
        text,
        votes: 0,
      }));

      const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;

      // 投票一覧を再取得
      await get().fetchPolls();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  vote: async (pollId: string, optionId: string) => {
    set({ loading: true, error: null });
    try {
      const voterId = generateVoterId();

      // 既に投票済みかチェック
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('*')
        .eq('poll_id', pollId)
        .eq('voter_id', voterId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingVote) {
        throw new Error('既に投票済みです');
      }

      // 投票を記録
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          poll_id: pollId,
          option_id: optionId,
          voter_id: voterId,
        });

      if (voteError) throw voteError;

      // 現在の投票数を取得して+1
      const { data: currentOption, error: getError } = await supabase
        .from('options')
        .select('votes')
        .eq('id', optionId)
        .single();

      if (getError) throw getError;

      // 投票数を更新
      const { error: updateError } = await supabase
        .from('options')
        .update({ votes: (currentOption.votes || 0) + 1 })
        .eq('id', optionId);

      if (updateError) throw updateError;

      // 投票結果を表示
      const { error: showResultsError } = await supabase
        .from('polls')
        .update({ show_results: true })
        .eq('id', pollId);

      if (showResultsError) throw showResultsError;

      // 投票一覧を再取得
      await get().fetchPolls();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  deletePoll: async (pollId: string) => {
    set({ loading: true, error: null });
    try {
      // 関連する投票を削除
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .eq('poll_id', pollId);

      if (votesError) throw votesError;

      // 選択肢を削除
      const { error: optionsError } = await supabase
        .from('options')
        .delete()
        .eq('poll_id', pollId);

      if (optionsError) throw optionsError;

      // 投票を削除
      const { error: pollError } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (pollError) throw pollError;

      // 投票一覧を再取得
      await get().fetchPolls();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  showPollResults: async (pollId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('polls')
        .update({ show_results: true })
        .eq('id', pollId);

      if (error) throw error;

      // 投票一覧を再取得
      await get().fetchPolls();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  subscribeToPolls: () => {
    const subscription = supabase
      .channel('polls_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls' }, () => {
        get().fetchPolls();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'options' }, () => {
        get().fetchPolls();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        get().fetchPolls();
      })
      .subscribe();

    return subscription;
  },

  unsubscribeFromPolls: () => {
    supabase.removeAllChannels();
  },
})); 