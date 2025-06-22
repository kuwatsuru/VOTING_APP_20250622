'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSupabaseVotingStore } from '@/lib/supabaseStore';
import { CheckCircle, Vote, Eye } from 'lucide-react';

interface PollDisplayProps {
  pollId: string;
}

export function PollDisplay({ pollId }: PollDisplayProps) {
  const { 
    currentPoll, 
    loading, 
    error, 
    fetchPollById, 
    vote, 
    showPollResults 
  } = useSupabaseVotingStore();

  useEffect(() => {
    fetchPollById(pollId);
  }, [pollId, fetchPollById]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-8">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-8">
        <p className="text-red-500">エラー: {error}</p>
        <Button onClick={() => fetchPollById(pollId)} className="mt-4">
          再試行
        </Button>
      </div>
    );
  }

  if (!currentPoll) {
    return <div>投票が見つかりません</div>;
  }

  const totalVotes = currentPoll.options.reduce((sum, option) => sum + option.votes, 0);
  const maxVotes = Math.max(...currentPoll.options.map(option => option.votes));
  const showResults = currentPoll.showResults;

  const handleVote = async (optionId: string) => {
    await vote(pollId, optionId);
  };

  const handleShowResults = async () => {
    await showPollResults(pollId);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{currentPoll.title}</CardTitle>
          <Badge variant={currentPoll.isActive ? "default" : "secondary"}>
            {currentPoll.isActive ? "アクティブ" : "終了"}
          </Badge>
        </div>
        {currentPoll.description && (
          <p className="text-muted-foreground">{currentPoll.description}</p>
        )}
        {showResults && (
          <p className="text-sm text-muted-foreground">
            総投票数: {totalVotes}票
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPoll.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isWinning = showResults && option.votes === maxVotes && maxVotes > 0;

          return (
            <div
              key={option.id}
              className={`p-4 border rounded-lg transition-all ${
                'border-border hover:border-primary/50'
              } ${isWinning ? 'ring-2 ring-green-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option.text}</span>
                  {isWinning && <Badge variant="secondary">最多票</Badge>}
                </div>
                {showResults && (
                  <div className="text-right">
                    <div className="font-bold">{option.votes}票</div>
                    <div className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
              
              {showResults && <Progress value={percentage} className="h-2" />}
              
              {currentPoll.isActive && !showResults && (
                <Button
                  onClick={() => handleVote(option.id)}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={loading}
                >
                  <Vote className="h-4 w-4 mr-2" />
                  投票する
                </Button>
              )}
            </div>
          );
        })}
        
        {!showResults && currentPoll.isActive && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-primary font-medium">
                投票してください
              </p>
              <Button
                onClick={handleShowResults}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <Eye className="h-4 w-4 mr-2" />
                結果を見る
              </Button>
            </div>
          </div>
        )}
        
        {showResults && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary font-medium">
              ✓ 投票結果が表示されています
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 