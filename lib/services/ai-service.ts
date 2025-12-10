import type { Task, Project, Context, AIAdvice } from '@/types';

export type AIProvider = 'qwen' | 'zhipu' | 'openai';

interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Default config - can be overridden via environment variables
const getAIConfig = (): AIConfig => {
  // Server-side env
  if (typeof window === 'undefined') {
    return {
      provider: (process.env.NEXT_PUBLIC_AI_PROVIDER as AIProvider) || 'qwen',
      apiKey: process.env.AI_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY,
      baseUrl: process.env.AI_BASE_URL || process.env.NEXT_PUBLIC_AI_BASE_URL,
      model: process.env.AI_MODEL || process.env.NEXT_PUBLIC_AI_MODEL,
    };
  }

  // Client-side fallback (shouldn't be used directly)
  return {
    provider: 'qwen',
    apiKey: undefined,
    baseUrl: undefined,
    model: undefined,
  };
};

// Format tasks for AI context
function formatTasksForAI(tasks: Task[]): string {
  if (tasks.length === 0) return '暂无任务';
  
  return tasks.map((task, index) => {
    const parts = [
      `${index + 1}. ${task.title}`,
      task.description && `   描述: ${task.description}`,
      task.priority && `   优先级: ${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}`,
      task.dueDate && `   截止日期: ${new Date(task.dueDate).toLocaleDateString('zh-CN')}`,
      task.scheduledDate && `   安排日期: ${new Date(task.scheduledDate).toLocaleDateString('zh-CN')}`,
      task.estimatedTime && `   预计时间: ${task.estimatedTime}分钟`,
    ].filter(Boolean).join('\n');
    
    return parts;
  }).join('\n\n');
}

// Call AI API
async function callAIAPI(messages: AIMessage[], config: AIConfig): Promise<string> {
  const { provider, apiKey, baseUrl, model } = config;

  if (!apiKey) {
    throw new Error('AI API key not configured. Please set NEXT_PUBLIC_AI_API_KEY environment variable.');
  }

  try {
    let response: Response;

    switch (provider) {
      case 'qwen':
        // Alibaba Qwen API
        response = await fetch(baseUrl || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'qwen-turbo',
            input: {
              messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
              })),
            },
            parameters: {
              temperature: 0.7,
              max_tokens: 2000,
            },
          }),
        });
        break;

      case 'zhipu': {
        // Zhipu AI API
        const zhipuModel = model || 'glm-4';
        response = await fetch(baseUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: zhipuModel,
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });
        break;
      }

      case 'openai':
        // OpenAI API
        response = await fetch(baseUrl || 'https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model || 'gpt-3.5-turbo',
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });
        break;

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    // Extract response based on provider
    if (provider === 'qwen') {
      return data.output?.text || data.output?.choices?.[0]?.message?.content || '无法获取AI回复';
    } else if (provider === 'zhipu') {
      return data.choices?.[0]?.message?.content || '无法获取AI回复';
    } else {
      return data.choices?.[0]?.message?.content || '无法获取AI回复';
    }
  } catch (error) {
    console.error('AI API call failed:', error);
    throw error;
  }
}

// Get task organization advice
export async function getTaskOrganizationAdvice(
  task: Task,
  allTasks: Task[],
  projects: Project[],
  contexts: Context[]
): Promise<string> {
  const config = getAIConfig();
  
  const systemPrompt = `你是一个GTD（Getting Things Done）任务管理专家。你的职责是帮助用户更好地组织和管理任务。

当前任务信息：
- 标题: ${task.title}
${task.description ? `- 描述: ${task.description}` : ''}
- 当前状态: ${task.status}
- 优先级: ${task.priority}

用户的项目列表：
${projects.length > 0 ? projects.map(p => `- ${p.name}`).join('\n') : '暂无项目'}

用户的上下文标签：
${contexts.map(c => `- ${c.name}`).join('\n')}

请提供以下建议：
1. 这个任务应该属于哪个项目？（如果有合适的项目）
2. 应该使用哪些上下文标签？
3. 优先级是否合适？
4. 是否需要分解为多个子任务？

请用中文回答，简洁明了。`;

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: '请为这个任务提供组织建议。' },
  ];

  return await callAIAPI(messages, config);
}

// Get scheduling advice
export async function getSchedulingAdvice(
  tasks: Task[],
  currentDate: Date = new Date()
): Promise<string> {
  const config = getAIConfig();
  
  const systemPrompt = `你是一个GTD时间管理专家。分析用户的任务列表，提供日程安排建议。

当前日期: ${currentDate.toLocaleDateString('zh-CN')}

用户的任务列表：
${formatTasksForAI(tasks)}

请分析并建议：
1. 哪些任务应该优先处理？
2. 建议的任务安排顺序
3. 哪些任务可以安排在特定日期？
4. 时间管理建议

请用中文回答，简洁实用。`;

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: '请为我的任务提供日程安排建议。' },
  ];

  return await callAIAPI(messages, config);
}

// Get "What should I do now?" advice
export async function getWhatToDoNowAdvice(
  tasks: Task[],
  contexts: Context[],
  currentContext?: string
): Promise<string> {
  const config = getAIConfig();
  
  const availableTasks = tasks.filter(t => 
    t.status === 'next-action' || t.status === 'scheduled'
  );

  const systemPrompt = `你是一个GTD生产力助手。帮助用户选择当前最应该做的任务。

当前上下文: ${currentContext || '未指定'}

可用的上下文标签：
${contexts.map(c => `- ${c.name}`).join('\n')}

可执行的任务：
${formatTasksForAI(availableTasks)}

请根据以下因素推荐1-3个任务：
1. 优先级
2. 截止日期
3. 当前上下文
4. 任务所需时间
5. 任务之间的依赖关系

请用中文回答，推荐具体的任务并说明理由。`;

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: '我现在应该做什么？' },
  ];

  return await callAIAPI(messages, config);
}

// Get implementation guidance
export async function getImplementationGuidance(
  task: Task
): Promise<string> {
  const config = getAIConfig();
  
  const systemPrompt = `你是一个任务执行指导专家。帮助用户将任务分解为可执行的步骤。

任务信息：
- 标题: ${task.title}
${task.description ? `- 描述: ${task.description}` : ''}
${task.estimatedTime ? `- 预计时间: ${task.estimatedTime}分钟` : ''}

请提供：
1. 任务执行的具体步骤（按顺序）
2. 每个步骤的简要说明
3. 可能需要的资源或工具
4. 注意事项

请用中文回答，步骤清晰明确。`;

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: '请为这个任务提供执行指导。' },
  ];

  return await callAIAPI(messages, config);
}

// General AI chat
export async function chatWithAI(
  userMessage: string,
  context?: {
    tasks?: Task[];
    projects?: Project[];
    currentTask?: Task;
  }
): Promise<string> {
  const config = getAIConfig();
  
  let systemPrompt = `你是一个GTD（Getting Things Done）任务管理AI助手。帮助用户管理任务、提高生产力。

GTD原则：
- 收集：将所有任务放入收件箱
- 处理：决定每个任务的下一个行动
- 组织：将任务分类到项目、上下文等
- 回顾：定期检查任务和项目
- 执行：根据上下文和优先级选择任务`;

  if (context) {
    if (context.tasks && context.tasks.length > 0) {
      systemPrompt += `\n\n用户当前的任务：\n${formatTasksForAI(context.tasks.slice(0, 10))}`;
    }
    if (context.projects && context.projects.length > 0) {
      systemPrompt += `\n\n用户的项目：\n${context.projects.map(p => `- ${p.name}`).join('\n')}`;
    }
    if (context.currentTask) {
      systemPrompt += `\n\n当前查看的任务：${context.currentTask.title}`;
    }
  }

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  return await callAIAPI(messages, config);
}

