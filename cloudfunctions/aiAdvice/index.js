const { getOpenid } = require('../_shared/cloud');
const { assert } = require('../_shared/validate');
const { chat } = require('../_shared/aiAdapter');
const { formatTasksForAI } = require('../_shared/aiPrompts');
const { rateLimit } = require('../_shared/rateLimit');

function systemPromptOrganization({ task, projects, contexts }) {
  return `你是一个GTD（Getting Things Done）任务管理专家。你的职责是帮助用户更好地组织和管理任务。

当前任务信息：
- 标题: ${task.title}
${task.description ? `- 描述: ${task.description}` : ''}
- 当前状态: ${task.status}
- 优先级: ${task.priority}

用户的项目列表：
${Array.isArray(projects) && projects.length > 0 ? projects.map(p => `- ${p.name}`).join('\n') : '暂无项目'}

用户的上下文标签：
${Array.isArray(contexts) && contexts.length > 0 ? contexts.map(c => `- ${c.name}`).join('\n') : '暂无上下文'}

请提供以下建议：
1. 这个任务应该属于哪个项目？（如果有合适的项目）
2. 应该使用哪些上下文标签？
3. 优先级是否合适？
4. 是否需要分解为多个子任务？

请用中文回答，简洁明了。`;
}

function systemPromptImplementation({ task }) {
  return `你是一个任务执行指导专家。帮助用户将任务分解为可执行的步骤。

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
}

function systemPromptWhatToDoNow({ tasks, contexts, currentContext }) {
  const availableTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'next-action' || t.status === 'scheduled') : [];
  return `你是一个GTD生产力助手。帮助用户选择当前最应该做的任务。

当前上下文: ${currentContext || '未指定'}

可用的上下文标签：
${Array.isArray(contexts) && contexts.length > 0 ? contexts.map(c => `- ${c.name}`).join('\n') : '暂无上下文'}

可执行的任务：
${formatTasksForAI(availableTasks)}

请根据以下因素推荐1-3个任务：
1. 优先级
2. 截止日期
3. 当前上下文
4. 任务所需时间
5. 任务之间的依赖关系

请用中文回答，推荐具体的任务并说明理由。`;
}

function systemPromptScheduling({ tasks }) {
  const today = new Date().toISOString().slice(0, 10);
  return `你是一个GTD时间管理专家。分析用户的任务列表，提供日程安排建议。

当前日期: ${today}

用户的任务列表：
${formatTasksForAI(tasks)}

请分析并建议：
1. 哪些任务应该优先处理？
2. 建议的任务安排顺序
3. 哪些任务可以安排在特定日期？
4. 时间管理建议

请用中文回答，简洁实用。`;
}

exports.main = async (event) => {
  const openid = getOpenid();
  assert(openid, 'Missing OPENID');

  await rateLimit({ scope: 'aiAdvice', limitPerDay: Number(process.env.AI_ADVICE_DAILY_LIMIT || 30) });

  const type = event?.type;
  assert(type, 'type is required');

  let system;
  let user = '请给出建议。';

  if (type === 'organization') {
    const task = event?.task;
    assert(task && task.title, 'task is required');
    system = systemPromptOrganization({ task, projects: event?.projects || [], contexts: event?.contexts || [] });
    user = '请为这个任务提供组织建议。';
  } else if (type === 'implementation') {
    const task = event?.task;
    assert(task && task.title, 'task is required');
    system = systemPromptImplementation({ task });
    user = '请为这个任务提供执行指导。';
  } else if (type === 'what-to-do-now') {
    system = systemPromptWhatToDoNow({ tasks: event?.tasks || [], contexts: event?.contexts || [], currentContext: event?.context?.currentContext });
    user = '我现在应该做什么？';
  } else if (type === 'scheduling') {
    system = systemPromptScheduling({ tasks: event?.tasks || [] });
    user = '请为我的任务提供日程安排建议。';
  } else {
    throw new Error('Invalid advice type');
  }

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ];

  const advice = await chat({ messages });
  return { advice };
};

