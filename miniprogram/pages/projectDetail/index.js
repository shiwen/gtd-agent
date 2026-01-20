const api = require('../../services/api');

Page({
  data: {
    id: '',
    name: '',
    tasks: [],
    filtered: [],
    search: '',
    editorOpen: false,
    selected: null
  },

  onLoad(query) {
    this.setData({ id: query.id || '', name: query.name || '' });
  },

  onShow() {
    if (this.data.id) this.refresh();
  },

  async refresh() {
    try {
      const res = await api.call('tasks', { action: 'list', projectId: this.data.id, limit: 100 });
      const tasks = res?.tasks || [];
      this.setData({ tasks }, () => this.applyFilter());
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  applyFilter() {
    const q = (this.data.search || '').trim().toLowerCase();
    const filtered = q
      ? this.data.tasks.filter(t =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
        )
      : this.data.tasks;
    this.setData({ filtered });
  },

  onSearch(e) {
    this.setData({ search: e.detail.value }, () => this.applyFilter());
  },

  onAddTask() {
    this.setData({ selected: null, editorOpen: true });
  },

  onTapTask(e) {
    this.setData({ selected: e.detail.task, editorOpen: true });
  },

  onCloseEditor() {
    this.setData({ editorOpen: false, selected: null });
  },

  async onSaveTask(e) {
    try {
      await api.call('tasks', { action: 'upsert', task: e.detail.task });
      this.setData({ editorOpen: false, selected: null });
      await this.refresh();
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  async confirmDelete() {
    return await new Promise(resolve => {
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这个任务吗？',
        success: res => resolve(res.confirm)
      });
    });
  },

  async onDeleteTask(e) {
    if (!(await this.confirmDelete())) return;
    await this.doDelete(e.detail.id);
  },

  async onDeleteFromEditor(e) {
    if (!(await this.confirmDelete())) return;
    await this.doDelete(e.detail.id);
  },

  async doDelete(id) {
    try {
      await api.call('tasks', { action: 'delete', id });
      this.setData({ editorOpen: false, selected: null });
      await this.refresh();
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  }
});

