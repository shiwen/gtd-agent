'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AIChat } from './AIChat';
import { Sparkles } from 'lucide-react';

export function AIAssistantButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-24 right-4 rounded-full shadow-lg z-40"
        onClick={() => setIsChatOpen(true)}
      >
        <Sparkles className="w-5 h-5" />
      </Button>
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

