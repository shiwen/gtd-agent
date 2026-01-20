const api = require('../../services/api');

Page({
  data: {
    projects: [],
    editorOpen: false,
    selected: null
  },

  onShow() {
    this.refresh();
  },

  async refresh() {
    try {
      const res = await api.call('projects', { action: 'list' });
      this.setData({ projects: res?.projects || [] });
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onAdd() {
    this.setData({ selected: null, editorOpen: true });
  },

  onTapProject(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    wx.navigateTo({ url: `/pages/projectDetail/index?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}` });
  },

  onEditProject(e) {
    // prevent bubbling to card tap
    const id = e.currentTarget.dataset.id;
    const project = (this.data.projects || []).find(p => p.id === id) || null;
    this.setData({ selected: project, editorOpen: true });
  },

  onCloseEditor() {
    this.setData({ editorOpen: false, selected: null });
  },

  async onSaveProject(e) {
    try {
      await api.call('projects', { action: 'upsert', project: e.detail.project });
      this.setData({ editorOpen: false, selected: null });
      await this.refresh();
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  async onDeleteProject(e) {
    const id = e.detail.id;
    const ok = await new Promise(resolve => {
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这个项目吗？项目中的任务不会被删除。',
        success: res => resolve(res.confirm)
      });
    });
    if (!ok) return;
    try {
      await api.call('projects', { action: 'delete', id });
      this.setData({ editorOpen: false, selected: null });
      await this.refresh();
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  }
});

