'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { generateId } from '@/lib/utils/id';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface ProjectModalProps {
  project?: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
}

export function ProjectModal({ project, isOpen, onClose, onSave }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;

    const projectData: Project = {
      id: project?.id || generateId(),
      name: name.trim(),
      description: description.trim() || undefined,
      tasks: project?.tasks || [],
      createdAt: project?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: project?.status || 'active',
    };

    onSave(projectData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{project ? '编辑项目' : '新建项目'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">项目名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="项目名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="项目描述"
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

