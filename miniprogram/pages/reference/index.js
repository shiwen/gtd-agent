const api = require('../../services/api');

Page({
  data: {
    items: [],
    editorOpen: false,
    selected: null
  },

  onShow() {
    this.refresh();
  },

  async refresh() {
    try {
      const res = await api.call('references', { action: 'list' });
      this.setData({ items: res?.references || [] });
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onAdd() {
    this.setData({ selected: null, editorOpen: true });
  },

  onTapItem(e) {
    const id = e.currentTarget.dataset.id;
    const item = (this.data.items || []).find(x => x.id === id) || null;
    this.setData({ selected: item, editorOpen: true });
  },

  onCloseEditor() {
    this.setData({ editorOpen: false, selected: null });
  },

  async onSave(e) {
    try {
      await api.call('references', { action: 'upsert', reference: e.detail.reference });
      this.setData({ editorOpen: false, selected: null });
      await this.refresh();
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  async onDelete(e) {
    const id = e.detail.id;
    const ok = await new Promise(resolve => {
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这条参考资料吗？',
        success: res => resolve(res.confirm)
      });
    });
    if (!ok) return;
    try {
      await api.call('references', { action: 'delete', id });
      this.setData({ editorOpen: false, selected: null });
      await this.refresh();
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  }
});

