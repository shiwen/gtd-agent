'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskModal } from '@/components/task/TaskModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Task } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { projects, tasks, loadProjects, loadTasks, getTasksByProject, updateTask, deleteTask } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const projectId = params.id as string;
  const project = projects.find(p => p.id === projectId);
  const projectTasks = project ? getTasksByProject(projectId) : [];

  useEffect(() => {
    loadProjects();
    loadTasks();
  }, [loadProjects, loadTasks]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (task: Task) => {
    // Ensure task is assigned to this project
    const updatedTask = {
      ...task,
      projectId: projectId,
    };
    await updateTask(updatedTask);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      await deleteTask(taskId);
      setIsModalOpen(false);
      setSelectedTask(undefined);
    }
  };

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <div className="text-center py-12">
          <p className="text-lg mb-2">项目不存在</p>
          <Button onClick={() => router.push('/projects')} variant="outline">
            返回项目列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/projects')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {projectTasks.length} 个任务
          </p>
        </div>

        {projectTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">此项目暂无任务</p>
            <p className="text-sm">点击 + 按钮添加任务到此项目</p>
          </div>
        ) : (
          <div>
            {projectTasks.map((task) => (
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

        <div className="fixed bottom-20 right-4">
          <Button
            size="icon"
            className="rounded-full shadow-lg"
            onClick={() => {
              setSelectedTask(undefined);
              setIsModalOpen(true);
            }}
          >
            <span className="text-2xl">+</span>
          </Button>
        </div>
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

