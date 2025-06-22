'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useVotingStore } from '@/lib/store';
import { CheckCircle, Vote, Eye } from 'lucide-react';

interface PollDisplayProps {
  pollId: string;
}

export function PollDisplay({ pollId }: PollDisplayProps) {
  const poll = useVotingStore((state) => state.getPollById(pollId));
  const vote = useVotingStore((state) => state.vote);
  const getUserVote = useVotingStore((state) => state.getUserVote);
  const showPollResults = useVotingStore((state) => state.showPollResults);
  const userVote = getUserVote(pollId);

  if (!poll) {
    return <div>投票が見つかりません</div>;
  }

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  const maxVotes = Math.max(...poll.options.map(option => option.votes));
  const hasVoted = !!userVote;
  const showResults = poll.showResults || hasVoted;

  const handleVote = (optionId: string) => {
    if (!userVote) {
      vote(pollId, optionId);
    }
  };

  const handleShowResults = () => {
    showPollResults(pollId);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{poll.title}</CardTitle>
          <Badge variant={poll.isActive ? "default" : "secondary"}>
            {poll.isActive ? "アクティブ" : "終了"}
          </Badge>
        </div>
        {poll.description && (
          <p className="text-muted-foreground">{poll.description}</p>
        )}
        {showResults && (
          <p className="text-sm text-muted-foreground">
            総投票数: {totalVotes}票
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isUserVote = userVote === option.id;
          const isWinning = showResults && option.votes === maxVotes && maxVotes > 0;

          return (
            <div
              key={option.id}
              className={`p-4 border rounded-lg transition-all ${
                isUserVote
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              } ${isWinning ? 'ring-2 ring-green-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option.text}</span>
                  {isUserVote && <CheckCircle className="h-4 w-4 text-primary" />}
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
              
              {!userVote && poll.isActive && (
                <Button
                  onClick={() => handleVote(option.id)}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <Vote className="h-4 w-4 mr-2" />
                  投票する
                </Button>
              )}
            </div>
          );
        })}
        
        {userVote && !poll.showResults && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-primary font-medium">
                ✓ 投票済みです
              </p>
              <Button
                onClick={handleShowResults}
                variant="outline"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                結果を見る
              </Button>
            </div>
          </div>
        )}
        
        {userVote && poll.showResults && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary font-medium">
              ✓ 投票済みです
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 