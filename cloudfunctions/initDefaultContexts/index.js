const { db, getOpenid } = require('../_shared/cloud');
const { COLLECTIONS } = require('../_shared/constants');
const { assert } = require('../_shared/validate');

const DEFAULT_CONTEXTS = [
  { id: 'ctx-home', name: '@家', icon: 'home' },
  { id: 'ctx-office', name: '@办公室', icon: 'briefcase' },
  { id: 'ctx-computer', name: '@电脑', icon: 'laptop' },
  { id: 'ctx-phone', name: '@电话', icon: 'phone' },
  { id: 'ctx-errands', name: '@外出', icon: 'map-pin' },
  { id: 'ctx-waiting', name: '@等待', icon: 'clock' }
];

exports.main = async () => {
  const openid = getOpenid();
  assert(openid, 'Missing OPENID');

  const col = db.collection(COLLECTIONS.contexts || 'contexts');
  const existing = await col.where({ ownerOpenid: openid }).limit(1).get();
  if (existing.data && existing.data.length > 0) {
    return { ok: true, seeded: false };
  }

  const batch = DEFAULT_CONTEXTS.map(c => ({ ...c, ownerOpenid: openid }));
  for (const doc of batch) {
    // id field is app-level, not _id, so duplicates are ok per-user (enforced by ownerOpenid)
    await col.add({ data: doc });
  }

  return { ok: true, seeded: true, count: batch.length };
};

