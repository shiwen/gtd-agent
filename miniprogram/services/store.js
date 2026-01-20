// Minimal shared in-memory store to reduce repeat fetches.
// Pages should still refresh onShow for robustness.
const state = {
  contexts: [],
  projects: []
};

function set(partial) {
  Object.assign(state, partial);
}

function get() {
  return state;
}

module.exports = { get, set };

