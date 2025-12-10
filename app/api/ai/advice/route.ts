import { NextRequest, NextResponse } from 'next/server';
import {
  getTaskOrganizationAdvice,
  getSchedulingAdvice,
  getWhatToDoNowAdvice,
  getImplementationGuidance,
} from '@/lib/services/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      task,
      tasks = [],
      projects = [],
      contexts = [],
      context,
    } = body;

    switch (type) {
      case 'organization': {
        if (!task) {
          return NextResponse.json({ error: 'Task is required' }, { status: 400 });
        }
        const advice = await getTaskOrganizationAdvice(
          task,
          tasks,
          projects,
          contexts,
        );
        return NextResponse.json({ advice });
      }

      case 'scheduling': {
        if (!Array.isArray(tasks)) {
          return NextResponse.json({ error: 'Tasks array is required' }, { status: 400 });
        }
        const advice = await getSchedulingAdvice(tasks);
        return NextResponse.json({ advice });
      }

      case 'what-to-do-now': {
        const advice = await getWhatToDoNowAdvice(
          Array.isArray(tasks) ? tasks : [],
          Array.isArray(contexts) ? contexts : [],
          context?.currentContext,
        );
        return NextResponse.json({ advice });
      }

      case 'implementation': {
        if (!task) {
          return NextResponse.json({ error: 'Task is required' }, { status: 400 });
        }
        const advice = await getImplementationGuidance(task);
        return NextResponse.json({ advice });
      }

      default:
        return NextResponse.json({ error: 'Invalid advice type' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI advice error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get AI advice' },
      { status: 500 }
    );
  }
}

