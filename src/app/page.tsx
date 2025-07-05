"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatePollForm } from "@/components/CreatePollForm";
import { PollList } from "@/components/PollList";
import { PollDisplay } from "@/components/PollDisplay";
import { UsernameInput } from "@/components/UsernameInput";
import { useUserStore } from "@/lib/userStore";
import { Users, Vote, Plus, List } from "lucide-react";

export default function Home() {
  const { username, memberName, clearUsername } = useUserStore();
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  const handleSelectPoll = (pollId: string) => {
    setSelectedPollId(pollId);
    setActiveTab("view");
  };

  const handleBackToList = () => {
    setSelectedPollId(null);
    setActiveTab("list");
  };

  const handleLogout = () => {
    clearUsername();
    setSelectedPollId(null);
    setActiveTab("list");
  };

  if (!username || !memberName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold">MAJORITY（チーム投票アプリ）</h1>
            <p className="text-muted-foreground">
              I don't wanna be the
              minority!
            </p>
          </div>
          <UsernameInput />
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2"> 機能</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 同じチーム名を入力したメンバー同士で投票を共有</li>
              <li>• 各メンバーが1票ずつ投票可能</li>
              <li>• 投票の作成、参加、結果確認が可能</li>
              <li>• リアルタイムで投票結果を同期</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Vote className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  チーム投票アプリ
                </h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <Users className="h-4 w-4" />
                チーム: {username}
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Users className="h-4 w-4" />
                メンバー: {memberName}
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              チームを変更
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedPollId ? (
          // 投票詳細表示
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleBackToList}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                一覧に戻る
              </Button>
              <h2 className="text-lg font-semibold">投票詳細</h2>
            </div>
            <PollDisplay pollId={selectedPollId} />
          </div>
        ) : (
          // メインタブ
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  投票一覧
                </TabsTrigger>
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  投票作成
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="space-y-6">
              <PollList onSelectPoll={handleSelectPoll} />
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <CreatePollForm />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>チーム投票アプリ - リアルタイム投票システム</p>
            <p className="mt-1">
              Supabaseを使用した安全で高速な投票プラットフォーム
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
