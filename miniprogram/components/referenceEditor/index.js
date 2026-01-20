const { generateId } = require('../../utils/id');

Component({
  properties: {
    open: { type: Boolean, value: false },
    reference: { type: Object, value: null }
  },
  data: {
    titleText: '新建参考资料',
    showDelete: false,
    form: { id: '', title: '', content: '', url: '' }
  },
  observers: {
    open(isOpen) {
      if (isOpen) this._hydrate();
    },
    reference() {
      if (this.data.open) this._hydrate();
    }
  },
  methods: {
    noop() {},
    _hydrate() {
      const r = this.data.reference;
      this.setData({
        titleText: r ? '编辑参考资料' : '新建参考资料',
        showDelete: !!r?.id,
        form: {
          id: r?.id || '',
          title: r?.title || '',
          content: r?.content || '',
          url: r?.url || ''
        }
      });
    },
    onClose() {
      this.triggerEvent('close');
    },
    onInputTitle(e) {
      this.setData({ 'form.title': e.detail.value });
    },
    onInputContent(e) {
      this.setData({ 'form.content': e.detail.value });
    },
    onInputUrl(e) {
      this.setData({ 'form.url': e.detail.value });
    },
    onSave() {
      const f = this.data.form;
      if (!f.title || !f.title.trim()) return;
      const now = new Date().toISOString();
      const reference = {
        id: f.id || generateId('ref'),
        title: f.title.trim(),
        content: (f.content || '').trim(),
        url: f.url ? f.url.trim() : undefined,
        type: f.url ? 'link' : 'note',
        tags: this.data.reference?.tags || [],
        createdAt: this.data.reference?.createdAt || now,
        updatedAt: now
      };
      this.triggerEvent('save', { reference });
    },
    onDelete() {
      const id = this.data.reference?.id;
      if (!id) return;
      this.triggerEvent('delete', { id });
    }
  }
});

