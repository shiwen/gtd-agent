const api = require('../../services/api');
const { generateId } = require('../../utils/id');

Page({
  data: {
    messages: [
      {
        id: 'm0',
        role: 'assistant',
        content: '你好！我是你的GTD AI助手。你可以问我：如何整理任务、下一步行动怎么选、任务怎么拆解等。'
      }
    ],
    input: '',
    loading: false,
    scrollTo: 'm0'
  },

  onInput(e) {
    this.setData({ input: e.detail.value });
  },

  async onSend() {
    const text = (this.data.input || '').trim();
    if (!text || this.data.loading) return;

    const userMsgId = generateId('m');
    const nextMessages = this.data.messages.concat([{ id: userMsgId, role: 'user', content: text }]);
    this.setData({ messages: nextMessages, input: '', loading: true, scrollTo: userMsgId });

    try {
      const res = await api.call('aiChat', { message: text });
      const content = res?.response || '抱歉，我没有生成出有效回复。';
      const aiMsgId = generateId('m');
      this.setData({
        messages: this.data.messages.concat([{ id: aiMsgId, role: 'assistant', content }]),
        scrollTo: aiMsgId
      });
    } catch (e) {
      console.error(e);
      const aiMsgId = generateId('m');
      this.setData({
        messages: this.data.messages.concat([{ id: aiMsgId, role: 'assistant', content: '抱歉，AI 调用失败，请稍后重试。' }]),
        scrollTo: aiMsgId
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});

