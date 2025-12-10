'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskModal } from '@/components/task/TaskModal';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from '@/types';
import { Search, Sparkles, Loader2 } from 'lucide-react';

export default function NextActionsPage() {
  const { loadTasks, loadContexts, getNextActions, updateTask, deleteTask, tasks, contexts } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [whatToDoAdvice, setWhatToDoAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    loadTasks();
    loadContexts();
  }, [loadTasks, loadContexts]);

  let nextActions = getNextActions();

  // Apply search filter
  if (searchQuery.trim()) {
    nextActions = nextActions.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (task: Task) => {
    await updateTask(task);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      await deleteTask(taskId);
      setIsModalOpen(false);
      setSelectedTask(undefined);
    }
  };

  const fetchWhatToDoNow = async () => {
    setLoadingAdvice(true);
    try {
      const response = await fetch('/api/ai/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'what-to-do-now',
          tasks,
          contexts,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWhatToDoAdvice(data.advice);
      } else {
        const err = await response.json().catch(() => ({}));
        setWhatToDoAdvice(err?.error || '获取AI建议失败');
      }
    } catch (error) {
      console.error('Failed to get advice:', error);
      setWhatToDoAdvice('获取AI建议失败');
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">下一步行动</h1>

        {/* What to do now card */}
        <Card className="mb-4 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">AI建议：现在应该做什么？</h3>
                </div>
                {whatToDoAdvice ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {whatToDoAdvice}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    点击按钮获取AI建议
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchWhatToDoNow}
                disabled={loadingAdvice}
              >
                {loadingAdvice ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '获取建议'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search bar */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索任务..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {nextActions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">
              {searchQuery ? '没有找到匹配的任务' : '暂无下一步行动'}
            </p>
            <p className="text-sm">
              {searchQuery ? '尝试其他搜索词' : '从收件箱处理任务后，它们会出现在这里'}
            </p>
          </div>
        ) : (
          <div>
            {nextActions.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
                showActions
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
          </div>
        )}

        <BottomNav />
      </div>

      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(undefined);
        }}
        onSave={handleSaveTask}
      />
    </>
  );
}
