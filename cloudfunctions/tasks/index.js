const { db, getOpenid } = require('../_shared/cloud');
const { COLLECTIONS } = require('../_shared/constants');
const { assert, asInt, sanitizeString } = require('../_shared/validate');

function pickTask(input) {
  // Keep schema close to `types/index.ts` but ensure server-owned fields are enforced.
  const now = new Date().toISOString();
  const t = input || {};

  const out = {
    id: sanitizeString(t.id, 80),
    title: sanitizeString(t.title, 200),
    description: t.description ? sanitizeString(t.description, 2000) : undefined,
    status: sanitizeString(t.status, 32),
    projectId: t.projectId ? sanitizeString(t.projectId, 80) : undefined,
    contextIds: Array.isArray(t.contextIds) ? t.contextIds.map(x => sanitizeString(x, 80)).filter(Boolean) : [],
    dueDate: t.dueDate || undefined,
    scheduledDate: t.scheduledDate || undefined,
    priority: sanitizeString(t.priority, 16) || 'medium',
    energyLevel: t.energyLevel ? sanitizeString(t.energyLevel, 16) : undefined,
    estimatedTime: typeof t.estimatedTime === 'number' ? t.estimatedTime : undefined,
    notes: t.notes ? sanitizeString(t.notes, 4000) : undefined,
    createdAt: t.createdAt || now,
    updatedAt: now,
    completedAt: t.completedAt || undefined
  };

  return out;
}

exports.main = async (event) => {
  const action = event?.action;
  const openid = getOpenid();
  assert(openid, 'Missing OPENID');

  const col = db.collection(COLLECTIONS.tasks || 'tasks');

  if (action === 'list') {
    const status = event?.status ? sanitizeString(event.status, 32) : undefined;
    const projectId = event?.projectId ? sanitizeString(event.projectId, 80) : undefined;
    const offset = Math.max(0, asInt(event?.offset, 0));
    const limit = Math.min(100, Math.max(1, asInt(event?.limit, 100)));

    const where = { ownerOpenid: openid };
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;

    const { data } = await col.where(where).orderBy('updatedAt', 'desc').skip(offset).limit(limit).get();
    return { tasks: data };
  }

  if (action === 'upsert') {
    const task = pickTask(event?.task);
    assert(task.id, 'Task id is required');
    assert(task.title, 'Task title is required');
    assert(task.status, 'Task status is required');

    // If doc exists and belongs to user, update; else create.
    const existing = await col.where({ ownerOpenid: openid, id: task.id }).limit(1).get();
    if (existing.data && existing.data.length > 0) {
      const old = existing.data[0] || {};
      const doc = {
        ...task,
        createdAt: old.createdAt || task.createdAt,
        ownerOpenid: openid
      };
      await col.where({ ownerOpenid: openid, id: task.id }).update({ data: doc });
      return { ok: true, updated: true };
    }

    // Never trust client for ownership
    const doc = {
      ...task,
      ownerOpenid: openid
    };
    await col.add({ data: doc });
    return { ok: true, created: true };
  }

  if (action === 'delete') {
    const id = sanitizeString(event?.id, 80);
    assert(id, 'Task id is required');
    await col.where({ ownerOpenid: openid, id }).remove();
    return { ok: true };
  }

  throw new Error('Unsupported action');
};

