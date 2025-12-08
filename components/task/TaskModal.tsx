'use client';

import { useState, useEffect } from 'react';
import { Task, Project, Context } from '@/types';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { generateId } from '@/lib/utils/id';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Calendar, Flag, FolderKanban, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface TaskModalProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export function TaskModal({ task, isOpen, onClose, onSave }: TaskModalProps) {
  const { projects, contexts, loadProjects, loadContexts } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('inbox');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadProjects();
      loadContexts();
    }
  }, [isOpen, loadProjects, loadContexts]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setProjectId(task.projectId);
      setSelectedContexts(task.contextIds || []);
      setDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '');
      setScheduledDate(task.scheduledDate ? format(new Date(task.scheduledDate), 'yyyy-MM-dd') : '');
      setEstimatedTime(task.estimatedTime?.toString() || '');
    } else {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setStatus('inbox');
      setPriority('medium');
      setProjectId(undefined);
      setSelectedContexts([]);
      setDueDate('');
      setScheduledDate('');
      setEstimatedTime('');
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;

    const taskData: Task = {
      id: task?.id || generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      projectId,
      contextIds: selectedContexts,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(taskData);
    onClose();
  };

  const toggleContext = (contextId: string) => {
    setSelectedContexts(prev =>
      prev.includes(contextId)
        ? prev.filter(id => id !== contextId)
        : [...prev, contextId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{task ? '编辑任务' : '新建任务'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="任务标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="任务描述"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Task['status'])}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="inbox">收件箱</option>
              <option value="next-action">下一步行动</option>
              <option value="scheduled">已安排</option>
              <option value="someday">将来/也许</option>
              <option value="reference">参考资料</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <Flag className="w-4 h-4" />
              优先级
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <Button
                  key={p}
                  variant={priority === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority(p)}
                  className="flex-1"
                >
                  {p === 'low' ? '低' : p === 'medium' ? '中' : '高'}
                </Button>
              ))}
            </div>
          </div>

          {projects.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                项目
              </label>
              <select
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value || undefined)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">无项目</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {contexts.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                上下文
              </label>
              <div className="flex flex-wrap gap-2">
                {contexts.map((ctx) => (
                  <Button
                    key={ctx.id}
                    variant={selectedContexts.includes(ctx.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleContext(ctx.id)}
                  >
                    {ctx.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              截止日期
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">安排日期</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">预计时间（分钟）</label>
            <input
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="例如: 30"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              保存
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              取消
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

