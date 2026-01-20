const { db, getOpenid } = require('../_shared/cloud');
const { COLLECTIONS } = require('../_shared/constants');
const { assert, asInt, sanitizeString } = require('../_shared/validate');

function pickReference(input) {
  const now = new Date().toISOString();
  const r = input || {};
  return {
    id: sanitizeString(r.id, 80),
    title: sanitizeString(r.title, 200),
    content: sanitizeString(r.content, 4000),
    type: sanitizeString(r.type, 16) || 'note',
    url: r.url ? sanitizeString(r.url, 2048) : undefined,
    tags: Array.isArray(r.tags) ? r.tags.map(x => sanitizeString(x, 40)).filter(Boolean) : [],
    createdAt: r.createdAt || now,
    updatedAt: now
  };
}

exports.main = async (event) => {
  const action = event?.action;
  const openid = getOpenid();
  assert(openid, 'Missing OPENID');

  const col = db.collection(COLLECTIONS.references || 'references');

  if (action === 'list') {
    const offset = Math.max(0, asInt(event?.offset, 0));
    const limit = Math.min(100, Math.max(1, asInt(event?.limit, 100)));
    const { data } = await col.where({ ownerOpenid: openid }).orderBy('updatedAt', 'desc').skip(offset).limit(limit).get();
    return { references: data };
  }

  if (action === 'upsert') {
    const reference = pickReference(event?.reference);
    assert(reference.id, 'Reference id is required');
    assert(reference.title, 'Reference title is required');

    const existing = await col.where({ ownerOpenid: openid, id: reference.id }).limit(1).get();
    if (existing.data && existing.data.length > 0) {
      const old = existing.data[0] || {};
      const doc = { ...reference, ownerOpenid: openid, createdAt: old.createdAt || reference.createdAt };
      await col.where({ ownerOpenid: openid, id: reference.id }).update({ data: doc });
      return { ok: true, updated: true };
    }
    const doc = { ...reference, ownerOpenid: openid };
    await col.add({ data: doc });
    return { ok: true, created: true };
  }

  if (action === 'delete') {
    const id = sanitizeString(event?.id, 80);
    assert(id, 'Reference id is required');
    await col.where({ ownerOpenid: openid, id }).remove();
    return { ok: true };
  }

  throw new Error('Unsupported action');
};

