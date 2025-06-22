'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVotingStore } from '@/lib/store';
import { Calendar, Users, ArrowRight } from 'lucide-react';

interface PollListProps {
  onSelectPoll: (pollId: string) => void;
}

export function PollList({ onSelectPoll }: PollListProps) {
  const polls = useVotingStore((state) => state.polls);
  const getUserVote = useVotingStore((state) => state.getUserVote);

  if (polls.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">まだ投票が作成されていません</p>
          <p className="text-sm text-muted-foreground mt-2">
            最初の投票を作成してみましょう！
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('ja-JP');
    }
    return date.toLocaleDateString('ja-JP');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">投票一覧</h2>
      {polls.map((poll) => {
        const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
        const maxVotes = Math.max(...poll.options.map(option => option.votes));
        const winningOption = poll.options.find(option => option.votes === maxVotes && maxVotes > 0);
        const userVote = getUserVote(poll.id);
        const showResults = poll.showResults || !!userVote;

        return (
          <Card key={poll.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{poll.title}</CardTitle>
                <Badge variant={poll.isActive ? "default" : "secondary"}>
                  {poll.isActive ? "アクティブ" : "終了"}
                </Badge>
              </div>
              {poll.description && (
                <p className="text-muted-foreground">{poll.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(poll.createdAt)}
                  </div>
                  {showResults ? (
                    <>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {totalVotes}票
                      </div>
                      {winningOption && (
                        <div className="text-green-600 font-medium">
                          最多票: {winningOption.text}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-muted-foreground">
                      投票待ち
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => onSelectPoll(poll.id)}
                  variant="outline"
                  size="sm"
                >
                  詳細を見る
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 