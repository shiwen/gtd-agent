'use client';

import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { referenceStorage } from '@/lib/services/storage';
import type { Reference } from '@/types';

export default function ReferencePage() {
  const [references, setReferences] = useState<Reference[]>([]);

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    const refs = await referenceStorage.getAll();
    setReferences(refs);
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">参考资料</h1>
        <Button size="icon" className="rounded-full">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {references.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">暂无参考资料</p>
          <p className="text-sm">保存有用的信息和链接</p>
        </div>
      ) : (
        <div>
          {references.map((item) => (
            <Card key={item.id} className="mb-3">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {item.content}
                </p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {item.url}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

