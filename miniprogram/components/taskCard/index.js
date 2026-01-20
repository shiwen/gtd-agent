function fmtDate(val) {
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
    task: { type: Object, value: null },
    showDelete: { type: Boolean, value: false }
  },
  data: {
    dueText: '',
    scheduledText: '',
    priorityLabel: ''
  },
  observers: {
    task(task) {
      const p = task?.priority;
      const priorityLabel = p === 'high' ? '高优先级' : p === 'medium' ? '中优先级' : p === 'low' ? '低优先级' : '';
      this.setData({
        dueText: fmtDate(task?.dueDate),
        scheduledText: fmtDate(task?.scheduledDate),
        priorityLabel
      });
    }
  },
  methods: {
    onTap() {
      this.triggerEvent('tapTask', { task: this.data.task });
    },
    onDelete(e) {
      // prevent triggering onTap
      this.triggerEvent('deleteTask', { id: e.currentTarget.dataset.id });
    }
  }
});

