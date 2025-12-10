import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/services/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const aiContext = context
      ? {
          tasks: context.tasks,
          projects: context.projects,
          currentTask: context.currentTask,
        }
      : undefined;

    const response = await chatWithAI(message, aiContext);
    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to chat with AI' },
      { status: 500 }
    );
  }
}

