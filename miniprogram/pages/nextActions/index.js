const api = require('../../services/api');

Page({
  data: {
    tasks: [],
    filtered: [],
    search: '',
    aiAdvice: '',
    loadingAdvice: false,
    editorOpen: false,
    selected: null
  },

  onShow() {
    this.refresh();
  },

  async refresh() {
    try {
      const res = await api.call('tasks', { action: 'list', status: 'next-action' });
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

  async confirmDelete(id) {
    return await new Promise(resolve => {
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这个任务吗？',
        success: res => resolve(res.confirm)
      });
    });
  },

  async onDeleteTask(e) {
    const id = e.detail.id;
    if (!(await this.confirmDelete(id))) return;
    await this.doDelete(id);
  },

  async onDeleteFromEditor(e) {
    const id = e.detail.id;
    if (!(await this.confirmDelete(id))) return;
    await this.doDelete(id);
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
  },

  async onGetAI() {
    if (this.data.loadingAdvice) return;
    this.setData({ loadingAdvice: true });
    try {
      const [allTasksRes, contextsRes, projectsRes] = await Promise.all([
        api.call('tasks', { action: 'list', limit: 100 }),
        api.call('contexts', { action: 'list' }),
        api.call('projects', { action: 'list' })
      ]);

      const res = await api.call('aiAdvice', {
        type: 'what-to-do-now',
        tasks: allTasksRes?.tasks || [],
        contexts: contextsRes?.contexts || [],
        projects: projectsRes?.projects || []
      });
      this.setData({ aiAdvice: res?.advice || '暂无建议' });
    } catch (e) {
      console.error(e);
      wx.showToast({ title: 'AI调用失败', icon: 'none' });
    } finally {
      this.setData({ loadingAdvice: false });
    }
  }
});

