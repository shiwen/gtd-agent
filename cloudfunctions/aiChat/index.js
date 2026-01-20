const { getOpenid } = require('../_shared/cloud');
const { assert, sanitizeString } = require('../_shared/validate');
const { chat } = require('../_shared/aiAdapter');
const { formatTasksForAI } = require('../_shared/aiPrompts');
const { rateLimit } = require('../_shared/rateLimit');

exports.main = async (event) => {
  const openid = getOpenid();
  assert(openid, 'Missing OPENID');

  await rateLimit({ scope: 'aiChat', limitPerDay: Number(process.env.AI_CHAT_DAILY_LIMIT || 50) });

  const message = sanitizeString(event?.message, 2000);
  assert(message, 'message is required');

  const ctx = event?.context || {};
  let system = `你是一个GTD（Getting Things Done）任务管理AI助手。帮助用户管理任务、提高生产力。

GTD原则：
- 收集：将所有任务放入收件箱
- 处理：决定每个任务的下一个行动
- 组织：将任务分类到项目、上下文等
- 回顾：定期检查任务和项目
- 执行：根据上下文和优先级选择任务`;

  if (Array.isArray(ctx.tasks) && ctx.tasks.length > 0) {
    system += `\n\n用户当前的任务：\n${formatTasksForAI(ctx.tasks.slice(0, 10))}`;
  }
  if (Array.isArray(ctx.projects) && ctx.projects.length > 0) {
    system += `\n\n用户的项目：\n${ctx.projects.map(p => `- ${p.name}`).join('\n')}`;
  }
  if (ctx.currentTask && ctx.currentTask.title) {
    system += `\n\n当前查看的任务：${ctx.currentTask.title}`;
  }

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: message }
  ];

  const response = await chat({ messages });
  return { response };
};

