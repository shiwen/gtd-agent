App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('wx.cloud is not available. Please enable 云开发 in WeChat DevTools.');
      return;
    }

    const { envId } = require('./env');

    wx.cloud.init({
      env: envId,
      traceUser: true
    });

    // Seed default contexts on first use (safe to call repeatedly).
    wx.cloud.callFunction({ name: 'initDefaultContexts', data: {} }).catch((e) => {
      console.warn('initDefaultContexts failed:', e);
    });
  }
});

