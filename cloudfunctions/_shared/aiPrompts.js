function formatTasksForAI(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return '暂无任务';
  return tasks.slice(0, 30).map((task, index) => {
    const parts = [];
    parts.push(`${index + 1}. ${task.title || ''}`.trim());
    if (task.description) parts.push(`   描述: ${task.description}`);
    if (task.priority) parts.push(`   优先级: ${task.priority}`);
    if (task.dueDate) parts.push(`   截止日期: ${String(task.dueDate).slice(0, 10)}`);
    if (task.scheduledDate) parts.push(`   安排日期: ${String(task.scheduledDate).slice(0, 10)}`);
    if (task.estimatedTime) parts.push(`   预计时间: ${task.estimatedTime}分钟`);
    return parts.join('\n');
  }).join('\n\n');
}

module.exports = { formatTasksForAI };

