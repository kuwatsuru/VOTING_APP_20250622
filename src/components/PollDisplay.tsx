"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { usePollStore } from "@/lib/pollStore";
import { useUserStore } from "@/lib/userStore";
import {
  Vote,
  User,
  Calendar,
  CheckCircle,
  Shield,
  AlertTriangle,
} from "lucide-react";

interface PollDisplayProps {
  pollId: string;
}

export function PollDisplay({ pollId }: PollDisplayProps) {
  const { getPoll, vote } = usePollStore();
  const { username, hasUserVoted, addUserVote } = useUserStore();

  const poll = getPoll(pollId);

  if (!poll) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-8">
        <p className="text-red-500">投票が見つかりません</p>
      </div>
    );
  }

  if (username && poll.teamName !== username) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-red-500">
            <AlertTriangle className="h-8 w-8" />
            <h3 className="text-lg font-semibold">アクセス拒否</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            この投票は別のチームのものです
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">チーム: {poll.teamName}</p>
            <p className="text-sm text-gray-600">あなたのチーム: {username}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalVotes = Object.values(poll.votes).reduce(
    (sum: number, votes: number) => sum + votes,
    0
  );
  const maxVotes = Math.max(...(Object.values(poll.votes) as number[]));
  const hasVoted = username ? hasUserVoted(pollId) : false;

  const handleVote = (option: string) => {
    if (!username) {
      alert("投票するには、まずチーム名を入力してください");
      return;
    }

    if (hasVoted) {
      alert("この投票には既に投票済みです");
      return;
    }

    vote(pollId, option);
    addUserVote(pollId);
    alert("投票が完了しました！");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            チーム: {poll.teamName}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            作成者: {poll.createdBy}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(poll.createdAt)}
          </div>
        </div>

        {poll.description && (
          <p className="text-muted-foreground">{poll.description}</p>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            総投票数: {totalVotes}票
          </p>
          {hasVoted && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              投票済み
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {poll.options.map((option) => {
          const votes = poll.votes[option] || 0;
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
          const isWinning = votes === maxVotes && maxVotes > 0;

          return (
            <div
              key={option}
              className={`p-4 border rounded-lg transition-all ${"border-border hover:border-primary/50"} ${
                isWinning ? "ring-2 ring-green-500 bg-green-50" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option}</span>
                  {isWinning && <Badge variant="secondary">最多票</Badge>}
                </div>
                <div className="text-right">
                  <div className="font-bold">{votes}票</div>
                  <div className="text-sm text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              <Progress value={percentage} className="h-2" />

              {poll.isActive && !hasVoted && username && (
                <Button
                  onClick={() => handleVote(option)}
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

        {!username && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ 投票するには、まずチーム名を入力してください
            </p>
          </div>
        )}

        {hasVoted && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />✓ この投票に投票済みです
            </p>
          </div>
        )}

        {!poll.isActive && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">
              📋 この投票は終了しています
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
