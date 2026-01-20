const { db, getOpenid } = require('../_shared/cloud');
const { COLLECTIONS } = require('../_shared/constants');
const { assert, asInt, sanitizeString } = require('../_shared/validate');

function pickContext(input) {
  const c = input || {};
  return {
    id: sanitizeString(c.id, 80),
    name: sanitizeString(c.name, 80),
    icon: c.icon ? sanitizeString(c.icon, 40) : undefined,
    color: c.color ? sanitizeString(c.color, 32) : undefined
  };
}

exports.main = async (event) => {
  const action = event?.action;
  const openid = getOpenid();
  assert(openid, 'Missing OPENID');

  const col = db.collection(COLLECTIONS.contexts || 'contexts');

  if (action === 'list') {
    const offset = Math.max(0, asInt(event?.offset, 0));
    const limit = Math.min(100, Math.max(1, asInt(event?.limit, 100)));
    const { data } = await col.where({ ownerOpenid: openid }).orderBy('name', 'asc').skip(offset).limit(limit).get();
    return { contexts: data };
  }

  if (action === 'upsert') {
    const context = pickContext(event?.context);
    assert(context.id, 'Context id is required');
    assert(context.name, 'Context name is required');

    const doc = { ...context, ownerOpenid: openid };
    const existing = await col.where({ ownerOpenid: openid, id: context.id }).limit(1).get();
    if (existing.data && existing.data.length > 0) {
      await col.where({ ownerOpenid: openid, id: context.id }).update({ data: doc });
      return { ok: true, updated: true };
    }
    await col.add({ data: doc });
    return { ok: true, created: true };
  }

  if (action === 'delete') {
    const id = sanitizeString(event?.id, 80);
    assert(id, 'Context id is required');
    await col.where({ ownerOpenid: openid, id }).remove();
    return { ok: true };
  }

  throw new Error('Unsupported action');
};

