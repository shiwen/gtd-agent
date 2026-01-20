const { generateId } = require('../../utils/id');
const api = require('../../services/api');

const STATUS_OPTIONS = [
  { value: 'inbox', label: '收件箱' },
  { value: 'next-action', label: '下一步行动' },
  { value: 'scheduled', label: '已安排' },
  { value: 'someday', label: '将来/也许' },
  { value: 'reference', label: '参考资料' }
];

function toDateStr(val) {
  if (!val) return '';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

Component({
  properties: {
    open: { type: Boolean, value: false },
    task: { type: Object, value: null },
    defaultStatus: { type: String, value: 'inbox' },
    defaultProjectId: { type: String, value: '' }
  },
  data: {
    statusOptions: STATUS_OPTIONS,
    statusIndex: 0,
    titleText: '新建任务',
    showDelete: false,
    contexts: [],
    projectOptions: [{ value: '', label: '无项目' }],
    projectIndex: 0,
    aiLoading: false,
    aiError: '',
    aiText: '',
    form: {
      id: '',
      title: '',
      description: '',
      status: 'inbox',
      projectId: '',
      contextIds: [],
      priority: 'medium',
      dueDate: '',
      scheduledDate: '',
      estimatedTime: ''
    }
  },
  observers: {
    open(isOpen) {
      if (isOpen) this._hydrateFromProps();
    },
    task() {
      if (this.data.open) this._hydrateFromProps();
    }
  },
  methods: {
    noop() {},
    async _hydrateFromProps() {
      await this._loadMeta();

      const task = this.data.task;
      const statusValue = task?.status || this.data.defaultStatus || 'inbox';
      const statusIndex = Math.max(0, STATUS_OPTIONS.findIndex(s => s.value === statusValue));
      const projectId = task?.projectId || this.data.defaultProjectId || '';
      const projectIndex = Math.max(0, (this.data.projectOptions || []).findIndex(p => p.value === projectId));

      this.setData({
        statusIndex,
        projectIndex,
        titleText: task ? '编辑任务' : '新建任务',
        showDelete: !!task?.id,
        form: {
          id: task?.id || '',
          title: task?.title || '',
          description: task?.description || '',
          status: statusValue,
          priority: task?.priority || 'medium',
          projectId,
          contextIds: Array.isArray(task?.contextIds) ? task.contextIds : [],
          dueDate: toDateStr(task?.dueDate),
          scheduledDate: toDateStr(task?.scheduledDate),
          estimatedTime: task?.estimatedTime ? String(task.estimatedTime) : ''
        }
      });

      // reset AI panel
      this.setData({ aiLoading: false, aiError: '', aiText: '' });
    },
    async _loadMeta() {
      try {
        const [contextsRes, projectsRes] = await Promise.all([
          api.call('contexts', { action: 'list' }),
          api.call('projects', { action: 'list' })
        ]);

        const contexts = contextsRes?.contexts || [];
        const projects = projectsRes?.projects || [];
        const projectOptions = [{ value: '', label: '无项目' }].concat(
          projects.map(p => ({ value: p.id, label: p.name }))
        );

        this.setData({ contexts, projectOptions });
      } catch (e) {
        // Non-blocking; user can still save task without these fields.
        console.warn('load meta failed', e);
      }
    },
    onClose() {
      this.triggerEvent('close');
    },
    onInputTitle(e) {
      this.setData({ 'form.title': e.detail.value });
    },
    onInputDesc(e) {
      this.setData({ 'form.description': e.detail.value });
    },
    onPickStatus(e) {
      const idx = Number(e.detail.value);
      const v = STATUS_OPTIONS[idx]?.value || 'inbox';
      this.setData({ statusIndex: idx, 'form.status': v });
    },
    onPickProject(e) {
      const idx = Number(e.detail.value);
      const opt = (this.data.projectOptions || [])[idx] || { value: '' };
      this.setData({ projectIndex: idx, 'form.projectId': opt.value || '' });
    },
    onPickPriority(e) {
      this.setData({ 'form.priority': e.currentTarget.dataset.v });
    },
    onToggleContext(e) {
      const id = e.currentTarget.dataset.id;
      const prev = this.data.form.contextIds || [];
      const next = prev.includes(id) ? prev.filter(x => x !== id) : prev.concat([id]);
      this.setData({ 'form.contextIds': next });
    },
    onPickDue(e) {
      this.setData({ 'form.dueDate': e.detail.value });
    },
    onPickScheduled(e) {
      this.setData({ 'form.scheduledDate': e.detail.value });
    },
    onInputEstimate(e) {
      this.setData({ 'form.estimatedTime': e.detail.value });
    },
    onSave() {
      const f = this.data.form;
      if (!f.title || !f.title.trim()) return;

      const nowIso = new Date().toISOString();
      const task = {
        id: f.id || generateId('tsk'),
        title: f.title.trim(),
        description: f.description ? f.description.trim() : undefined,
        status: f.status,
        priority: f.priority,
        contextIds: Array.isArray(f.contextIds) ? f.contextIds : [],
        projectId: f.projectId || undefined,
        dueDate: f.dueDate ? new Date(f.dueDate).toISOString() : undefined,
        scheduledDate: f.scheduledDate ? new Date(f.scheduledDate).toISOString() : undefined,
        estimatedTime: f.estimatedTime ? Number(f.estimatedTime) : undefined,
        createdAt: this.data.task?.createdAt || nowIso,
        updatedAt: nowIso
      };

      this.triggerEvent('save', { task });
    },
    async _callAI(type) {
      if (this.data.aiLoading) return;
      const task = this.data.task;
      if (!task || !task.id) return;

      this.setData({ aiLoading: true, aiError: '', aiText: '' });
      try {
        const res = await api.call('aiAdvice', {
          type,
          task,
          projects: (this.data.projectOptions || [])
            .filter(p => p.value)
            .map(p => ({ id: p.value, name: p.label })),
          contexts: this.data.contexts || []
        });
        this.setData({ aiText: res?.advice || '暂无建议' });
      } catch (e) {
        console.error(e);
        this.setData({ aiError: 'AI 调用失败，请稍后重试' });
      } finally {
        this.setData({ aiLoading: false });
      }
    },
    onAIOrganization() {
      return this._callAI('organization');
    },
    onAIImplementation() {
      return this._callAI('implementation');
    },
    onDelete() {
      const id = this.data.task?.id;
      if (!id) return;
      this.triggerEvent('delete', { id });
    }
  }
});

