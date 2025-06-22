'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreatePollForm } from './CreatePollForm';
import { PollList } from './PollList';
import { PollDisplay } from './PollDisplay';
import { useVotingStore } from '@/lib/store';
import { Plus, List, Home } from 'lucide-react';

type View = 'home' | 'create' | 'list' | 'poll';

export function VotingApp() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const currentPoll = useVotingStore((state) => state.currentPoll);

  const handleCreatePoll = () => {
    setCurrentView('create');
  };

  const handleViewPolls = () => {
    setCurrentView('list');
  };

  const handleSelectPoll = (pollId: string) => {
    setSelectedPollId(pollId);
    setCurrentView('poll');
  };

  const handleGoHome = () => {
    setCurrentView('home');
    setSelectedPollId(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'create':
        return <CreatePollForm />;
      case 'list':
        return <PollList onSelectPoll={handleSelectPoll} />;
      case 'poll':
        return selectedPollId ? <PollDisplay pollId={selectedPollId} /> : null;
      default:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">
                多数決アプリ
              </CardTitle>
              <p className="text-center text-muted-foreground">
                簡単に投票を作成して、みんなで決めましょう！
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleCreatePoll}
                className="w-full h-12 text-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                新しい投票を作成
              </Button>
              <Button
                onClick={handleViewPolls}
                variant="outline"
                className="w-full h-12 text-lg"
              >
                <List className="h-5 w-5 mr-2" />
                投票一覧を見る
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* ナビゲーションヘッダー */}
        {currentView !== 'home' && (
          <div className="mb-6">
            <Button
              onClick={handleGoHome}
              variant="ghost"
              className="mb-4"
            >
              <Home className="h-4 w-4 mr-2" />
              ホームに戻る
            </Button>
            
            <div className="flex gap-2">
              <Button
                onClick={handleCreatePoll}
                variant={currentView === 'create' ? 'default' : 'outline'}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                投票作成
              </Button>
              <Button
                onClick={handleViewPolls}
                variant={currentView === 'list' ? 'default' : 'outline'}
                size="sm"
              >
                <List className="h-4 w-4 mr-2" />
                投票一覧
              </Button>
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        {renderContent()}
      </div>
    </div>
  );
} 