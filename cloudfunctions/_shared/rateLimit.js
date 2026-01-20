const { db, getOpenid } = require('./cloud');
const { COLLECTIONS } = require('./constants');

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

async function rateLimit({ scope, limitPerDay }) {
  const openid = getOpenid();
  const day = dayKey();
  const col = db.collection(COLLECTIONS.usage || 'usage');

  const key = `${scope}:${day}`;
  const where = { ownerOpenid: openid, key };

  const existing = await col.where(where).limit(1).get();
  if (!existing.data || existing.data.length === 0) {
    await col.add({ data: { ownerOpenid: openid, key, scope, day, count: 1, updatedAt: Date.now() } });
    return { ok: true, remaining: limitPerDay - 1 };
  }

  const doc = existing.data[0];
  const next = (doc.count || 0) + 1;
  if (next > limitPerDay) {
    const err = new Error(`Rate limit exceeded: ${scope} ${limitPerDay}/day`);
    err.code = 'RATE_LIMIT';
    throw err;
  }

  await col.where(where).update({
    data: {
      count: next,
      updatedAt: Date.now()
    }
  });

  return { ok: true, remaining: limitPerDay - next };
}

module.exports = { rateLimit };

