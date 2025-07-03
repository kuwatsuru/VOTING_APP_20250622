"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePollStore } from "@/lib/pollStore";
import { useUserStore } from "@/lib/userStore";
import {
  Calendar,
  Users,
  ArrowRight,
  Trash2,
  Search,
  User,
  Shield,
} from "lucide-react";

interface PollListProps {
  onSelectPoll: (pollId: string) => void;
}

export function PollList({ onSelectPoll }: PollListProps) {
  const { getTeamPolls, deletePoll } = usePollStore();
  const { username, hasUserVoted } = useUserStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "my" | "voted">("all");

  // チーム内の投票のみを取得
  const teamPolls = useMemo(() => {
    return username ? getTeamPolls(username) : [];
  }, [username, getTeamPolls]);

  // フィルタリングされた投票一覧
  const filteredPolls = useMemo(() => {
    let filtered = teamPolls;

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(
        (poll) =>
          poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          poll.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ビューモードフィルター
    if (username) {
      switch (viewMode) {
        case "my":
          filtered = filtered.filter((poll) => poll.createdBy === username);
          break;
        case "voted":
          filtered = filtered.filter((poll) => hasUserVoted(poll.id));
          break;
      }
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [teamPolls, searchTerm, viewMode, username, hasUserVoted]);

  const handleDeletePoll = (pollId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("この投票を削除しますか？この操作は取り消せません。")) {
      deletePoll(pollId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalVotes = (poll: { votes: Record<string, number> }) => {
    return Object.values(poll.votes).reduce(
      (sum: number, votes: number) => sum + votes,
      0
    );
  };

  const getWinningOption = (poll: { votes: Record<string, number> }) => {
    const maxVotes = Math.max(...(Object.values(poll.votes) as number[]));
    if (maxVotes === 0) return null;
    return Object.entries(poll.votes).find(
      ([, votes]) => votes === maxVotes
    )?.[0];
  };

  if (!username) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            チーム名を入力して投票を表示してください
          </p>
        </CardContent>
      </Card>
    );
  }

  if (teamPolls.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-500" />
            <h3 className="text-lg font-semibold">チーム: {username}</h3>
          </div>
          <p className="text-muted-foreground">
            このチームにはまだ投票が作成されていません
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            最初の投票を作成してみましょう！
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">チーム投票一覧</h2>
        </div>
        <p className="text-blue-600 font-medium">チーム: {username}</p>
        <p className="text-muted-foreground">
          全{filteredPolls.length}件の投票（チーム内{teamPolls.length}件中）
        </p>
      </div>

      {/* フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 検索 */}
            <div>
              <Label htmlFor="search">検索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="タイトル、説明で検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* ビューモード */}
            <div>
              <Label>表示</Label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("all")}
                >
                  すべて
                </Button>
                <Button
                  variant={viewMode === "my" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("my")}
                >
                  作成した
                </Button>
                <Button
                  variant={viewMode === "voted" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("voted")}
                >
                  投票した
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 投票一覧 */}
      <div className="space-y-4">
        {filteredPolls.map((poll) => {
          const totalVotes = getTotalVotes(poll);
          const winningOption = getWinningOption(poll);
          const hasVoted = hasUserVoted(poll.id);

          return (
            <Card
              key={poll.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectPoll(poll.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {poll.title}
                      {hasVoted && (
                        <Badge variant="secondary" className="text-xs">
                          投票済み
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        作成者: {poll.createdBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(poll.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={poll.isActive ? "default" : "secondary"}>
                      {poll.isActive ? "アクティブ" : "終了"}
                    </Badge>
                    {poll.createdBy === username && (
                      <Button
                        onClick={(e) => handleDeletePoll(poll.id, e)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {poll.description && (
                  <p className="text-muted-foreground">{poll.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {totalVotes}票
                    </div>
                    {winningOption && (
                      <div className="text-green-600 font-medium">
                        最多票: {winningOption}
                      </div>
                    )}
                    <div className="text-muted-foreground">
                      {poll.options.length}個の選択肢
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    詳細を見る
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPolls.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              条件に一致する投票が見つかりません
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
