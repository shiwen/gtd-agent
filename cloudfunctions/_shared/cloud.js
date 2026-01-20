const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function getOpenid() {
  const ctx = cloud.getWXContext();
  return ctx.OPENID;
}

module.exports = { cloud, db, getOpenid };

