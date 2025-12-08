'use client';

import { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { Calendar, Flag, Clock, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showActions?: boolean;
  onDelete?: () => void;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export function TaskCard({ task, onClick, showActions, onDelete }: TaskCardProps) {
  return (
    <Card
      className={cn(
        "mb-3 transition-all hover:shadow-md",
        onClick && "cursor-pointer hover:border-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 truncate">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                </div>
              )}
              {task.estimatedTime && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{task.estimatedTime}min</span>
                </div>
              )}
              <div className={cn(
                "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                priorityColors[task.priority]
              )}>
                <Flag className="w-3 h-3" />
                <span className="capitalize">{task.priority === 'low' ? '低' : task.priority === 'medium' ? '中' : '高'}</span>
              </div>
            </div>
          </div>
          {showActions && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

