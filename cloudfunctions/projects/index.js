const { db, getOpenid } = require('../_shared/cloud');
const { COLLECTIONS } = require('../_shared/constants');
const { assert, asInt, sanitizeString } = require('../_shared/validate');

function pickProject(input) {
  const now = new Date().toISOString();
  const p = input || {};
  return {
    id: sanitizeString(p.id, 80),
    name: sanitizeString(p.name, 200),
    description: p.description ? sanitizeString(p.description, 2000) : undefined,
    tasks: Array.isArray(p.tasks) ? p.tasks.map(x => sanitizeString(x, 80)).filter(Boolean) : [],
    createdAt: p.createdAt || now,
    updatedAt: now,
    completedAt: p.completedAt || undefined,
    status: sanitizeString(p.status, 32) || 'active'
  };
}

exports.main = async (event) => {
  const action = event?.action;
  const openid = getOpenid();
  assert(openid, 'Missing OPENID');

  const col = db.collection(COLLECTIONS.projects || 'projects');

  if (action === 'list') {
    const offset = Math.max(0, asInt(event?.offset, 0));
    const limit = Math.min(100, Math.max(1, asInt(event?.limit, 100)));
    const { data } = await col.where({ ownerOpenid: openid }).orderBy('updatedAt', 'desc').skip(offset).limit(limit).get();
    return { projects: data };
  }

  if (action === 'upsert') {
    const project = pickProject(event?.project);
    assert(project.id, 'Project id is required');
    assert(project.name, 'Project name is required');

    const existing = await col.where({ ownerOpenid: openid, id: project.id }).limit(1).get();
    if (existing.data && existing.data.length > 0) {
      const old = existing.data[0] || {};
      const doc = { ...project, ownerOpenid: openid, createdAt: old.createdAt || project.createdAt };
      await col.where({ ownerOpenid: openid, id: project.id }).update({ data: doc });
      return { ok: true, updated: true };
    }
    const doc = { ...project, ownerOpenid: openid };
    await col.add({ data: doc });
    return { ok: true, created: true };
  }

  if (action === 'delete') {
    const id = sanitizeString(event?.id, 80);
    assert(id, 'Project id is required');
    await col.where({ ownerOpenid: openid, id }).remove();
    return { ok: true };
  }

  throw new Error('Unsupported action');
};

