"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePollStore } from "@/lib/pollStore";
import { useUserStore } from "@/lib/userStore";
import { Plus, X, Users } from "lucide-react";

export function CreatePollForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const { createPoll } = usePollStore();
  const { username } = useUserStore();

  const handleAddOption = () => {
    setOptions([...options, ""]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      alert("チーム名を入力してください");
      return;
    }
    if (title.trim() && options.every((opt) => opt.trim())) {
      createPoll({
        title: title.trim(),
        description: description.trim(),
        teamName: username,
        options: options.map((opt) => opt.trim()),
        createdBy: username,
        isActive: true,
      });
      setTitle("");
      setDescription("");
      setOptions(["", ""]);
      alert("投票が作成されました！");
    }
  };

  if (!username) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            投票を作成するには、まずチーム名を入力してください。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          新しい投票を作成
        </CardTitle>
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">作成者: {username}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            <Users className="h-4 w-4" />
            チーム: {username}
          </div>
        </div>
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
