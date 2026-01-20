const { generateId } = require('../../utils/id');

const STATUS_OPTIONS = [
  { value: 'active', label: '进行中' },
  { value: 'on-hold', label: '暂停' },
  { value: 'completed', label: '已完成' }
];

Component({
  properties: {
    open: { type: Boolean, value: false },
    project: { type: Object, value: null }
  },
  data: {
    statusOptions: STATUS_OPTIONS,
    statusIndex: 0,
    titleText: '新建项目',
    showDelete: false,
    form: {
      id: '',
      name: '',
      description: '',
      status: 'active'
    }
  },
  observers: {
    open(isOpen) {
      if (isOpen) this._hydrate();
    },
    project() {
      if (this.data.open) this._hydrate();
    }
  },
  methods: {
    noop() {},
    _hydrate() {
      const p = this.data.project;
      const statusValue = p?.status || 'active';
      const statusIndex = Math.max(0, STATUS_OPTIONS.findIndex(s => s.value === statusValue));
      this.setData({
        statusIndex,
        titleText: p ? '编辑项目' : '新建项目',
        showDelete: !!p?.id,
        form: {
          id: p?.id || '',
          name: p?.name || '',
          description: p?.description || '',
          status: statusValue
        }
      });
    },
    onClose() {
      this.triggerEvent('close');
    },
    onInputName(e) {
      this.setData({ 'form.name': e.detail.value });
    },
    onInputDesc(e) {
      this.setData({ 'form.description': e.detail.value });
    },
    onPickStatus(e) {
      const idx = Number(e.detail.value);
      const v = STATUS_OPTIONS[idx]?.value || 'active';
      this.setData({ statusIndex: idx, 'form.status': v });
    },
    onSave() {
      const f = this.data.form;
      if (!f.name || !f.name.trim()) return;
      const now = new Date().toISOString();
      const project = {
        id: f.id || generateId('prj'),
        name: f.name.trim(),
        description: f.description ? f.description.trim() : undefined,
        status: f.status,
        tasks: this.data.project?.tasks || [],
        createdAt: this.data.project?.createdAt || now,
        updatedAt: now
      };
      this.triggerEvent('save', { project });
    },
    onDelete() {
      const id = this.data.project?.id;
      if (!id) return;
      this.triggerEvent('delete', { id });
    }
  }
});

