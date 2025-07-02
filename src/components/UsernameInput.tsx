"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/lib/userStore";
import { usePollStore } from "@/lib/pollStore";
import { User, LogOut, History, Shield, Users } from "lucide-react";

export function UsernameInput() {
  const [inputUsername, setInputUsername] = useState("");
  const { username, setUsername, clearUsername, userVotes, hasUserVoted } =
    useUserStore();
  const { getTeamPolls } = usePollStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      setUsername(inputUsername.trim());
      setInputUsername("");
    }
  };

  const handleLogout = () => {
    clearUsername();
  };

  const teamPolls = username ? getTeamPolls(username) : [];
  const votedPolls = username ? userVotes[username] || [] : [];
  const createdPolls = username
    ? teamPolls.filter((poll) => poll.createdBy === username)
    : [];

  if (username) {
    return (
      <Card className="w-full max-w-2xl mx-auto mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            チーム情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                チーム名: {username}
              </p>
              <p className="text-sm text-muted-foreground">
                チーム内投票: {teamPolls.length}件 | 作成した投票:{" "}
                {createdPolls.length}件 | 投票参加: {votedPolls.length}件
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              チームを変更
            </Button>
          </div>

          {(createdPolls.length > 0 || votedPolls.length > 0) && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <History className="h-4 w-4" />
                チーム内での活動履歴
              </h4>
              <div className="space-y-2">
                {createdPolls.length > 0 && (
                  <p className="text-sm">
                    📝 作成した投票:{" "}
                    {createdPolls.map((poll) => poll.title).join(", ")}
                  </p>
                )}
                {votedPolls.length > 0 && (
                  <p className="text-sm">
                    ✅ 参加した投票: {votedPolls.length}件
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>チーム機能:</strong>{" "}
              同じチーム名でログインしたメンバー同士で投票を共有できます。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          チーム名を入力
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="チーム名を入力してください"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              className="text-center"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!inputUsername.trim()}
          >
            チームに参加
          </Button>
          <div className="text-xs text-muted-foreground text-center">
            💡 同じチーム名でログインしたメンバー同士で投票を共有できます
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
