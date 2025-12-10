'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useTaskStore } from '@/lib/store/useTaskStore';

interface AIAdvicePanelProps {
  task: Task;
  adviceType: 'organization' | 'implementation';
}

export function AIAdvicePanel({ task, adviceType }: AIAdvicePanelProps) {
  const { tasks, projects, contexts } = useTaskStore();
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: adviceType,
          task,
          tasks,
          projects,
          contexts,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI advice');
      }

      const data = await response.json();
      setAdvice(data.advice);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取AI建议失败');
    } finally {
      setLoading(false);
    }
  };

  const title = adviceType === 'organization' ? '组织建议' : '执行指导';

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAdvice}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!advice && !loading && !error && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              点击刷新按钮获取AI建议
            </p>
            <Button size="sm" onClick={fetchAdvice}>
              获取建议
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">AI正在思考...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <Button size="sm" variant="outline" onClick={fetchAdvice}>
              重试
            </Button>
          </div>
        )}

        {advice && !loading && (
          <div className="prose prose-sm max-w-none">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{advice}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

