"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Info, X } from "lucide-react";

interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  title?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  title = "エラーが発生しました",
}: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <p className="text-red-600 font-medium">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-red-600 hover:text-red-700"
          >
            {showDetails ? (
              <X className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
          </Button>
        </div>

        {showDetails && (
          <div className="bg-white p-3 rounded border border-red-200">
            <h4 className="font-medium text-sm mb-2">
              トラブルシューティング:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• インターネット接続を確認してください</li>
              <li>• ブラウザを更新してください</li>
              <li>• 開発者ツール（F12）のConsoleタブでエラー詳細を確認</li>
              <li>• しばらく時間をおいてから再試行してください</li>
            </ul>
          </div>
        )}

        {onRetry && (
          <div className="flex gap-2">
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              ページを更新
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
