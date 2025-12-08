'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/lib/store/useTaskStore';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ProjectModal } from '@/components/project/ProjectModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Project } from '@/types';
import Link from 'next/link';

export default function ProjectsPage() {
  const { projects, loadProjects, addProject, updateProject, deleteProject, getTasksByProject } = useTaskStore();
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleSaveProject = async (project: Project) => {
    if (project.id && projects.find(p => p.id === project.id)) {
      await updateProject(project);
    } else {
      await addProject(project);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('确定要删除这个项目吗？项目中的任务不会被删除。')) {
      await deleteProject(projectId);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">项目</h1>
          <Button
            size="icon"
            onClick={() => {
              setSelectedProject(undefined);
              setIsModalOpen(true);
            }}
            className="rounded-full"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">暂无项目</p>
            <p className="text-sm">项目是包含多个步骤的目标</p>
          </div>
        ) : (
          <div>
            {projects.map((project) => {
              const projectTasks = getTasksByProject(project.id);
              return (
                <Card
                  key={project.id}
                  className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleProjectClick(project)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex-1">{project.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {projectTasks.length} 个任务
                      </p>
                      {projectTasks.length > 0 && (
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          查看任务
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <BottomNav />
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(undefined);
        }}
        onSave={handleSaveProject}
      />
    </>
  );
}

