const { cloud } = require('./cloud');
const { requestJson } = require('./http');

async function tryCloudBaseBuiltinChat({ messages }) {
  // CloudBase AI Toolkit may expose cloud.extend.AI in cloud functions.
  // If not available in your environment, this will throw and we fall back.
  const ai = cloud.extend && (cloud.extend.AI || cloud.extend.ai);
  if (!ai) throw new Error('CloudBase AI not available in cloud functions (cloud.extend.AI missing).');

  if (typeof ai.createModel !== 'function') {
    throw new Error('CloudBase AI API shape not recognized (createModel missing).');
  }

  const modelName = process.env.CLOUDBASE_AI_MODEL || 'deepseek';
  const model = ai.createModel({ model: modelName });

  // Attempt common call shapes
  if (typeof model.chat === 'function') {
    const res = await model.chat({ messages });
    return res?.choices?.[0]?.message?.content || res?.outputText || res?.text || JSON.stringify(res);
  }
  if (typeof model.generateText === 'function') {
    const res = await model.generateText({ messages });
    return res?.choices?.[0]?.message?.content || res?.outputText || res?.text || JSON.stringify(res);
  }

  throw new Error('CloudBase AI model methods not recognized (chat/generateText missing).');
}

async function openAICompatibleChat({ messages }) {
  const baseUrl = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-3.5-turbo';
  if (!baseUrl || !apiKey) {
    throw new Error('AI_BASE_URL / AI_API_KEY not configured for fallback provider.');
  }

  const url = baseUrl.endsWith('/')
    ? baseUrl + 'v1/chat/completions'
    : baseUrl + '/v1/chat/completions';

  const data = await requestJson(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: { model, messages, temperature: 0.7, max_tokens: 1200 }
  });

  return data?.choices?.[0]?.message?.content || '无法获取AI回复';
}

async function chat({ messages }) {
  const strategy = process.env.AI_STRATEGY || 'cloudbase';
  if (strategy === 'cloudbase') {
    try {
      return await tryCloudBaseBuiltinChat({ messages });
    } catch (e) {
      // fall back if configured
      if (process.env.AI_BASE_URL && process.env.AI_API_KEY) {
        return await openAICompatibleChat({ messages });
      }
      throw e;
    }
  }

  if (strategy === 'openai_compat') {
    return await openAICompatibleChat({ messages });
  }

  throw new Error(`Unsupported AI_STRATEGY: ${strategy}`);
}

module.exports = { chat };

