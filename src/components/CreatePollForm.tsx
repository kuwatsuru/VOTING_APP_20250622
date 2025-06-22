'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVotingStore } from '@/lib/store';
import { Plus, X } from 'lucide-react';

export function CreatePollForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const createPoll = useVotingStore((state) => state.createPoll);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && options.every(opt => opt.trim())) {
      createPoll(title.trim(), description.trim(), options.map(opt => opt.trim()));
      setTitle('');
      setDescription('');
      setOptions(['', '']);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">新しい投票を作成</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">投票タイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="投票のタイトルを入力してください"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明（任意）</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="投票の説明を入力してください"
            />
          </div>

          <div className="space-y-4">
            <Label>投票オプション</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`オプション ${index + 1}`}
                  required
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              オプションを追加
            </Button>
          </div>

          <Button type="submit" className="w-full">
            投票を作成
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 