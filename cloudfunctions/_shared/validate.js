function assert(cond, message) {
  if (!cond) {
    const err = new Error(message || 'Invalid request');
    err.code = 'BAD_REQUEST';
    throw err;
  }
}

function asInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeString(s, maxLen) {
  if (typeof s !== 'string') return '';
  const t = s.trim();
  return maxLen ? t.slice(0, maxLen) : t;
}

module.exports = { assert, asInt, sanitizeString };

