import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const client = new GoogleGenerativeAI({ apiKey });
const modelName = 'gemini-1.5-flash';

async function generateFromPrompt(prompt) {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const model = client.getGenerativeModel({ model: modelName });
  const response = await model.generateContent(prompt);
  const output = response.response && typeof response.response.text === 'function'
    ? await response.response.text()
    : '';
  return output || '';
}

export async function optimizeText(req, res) {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const prompt = `Improve this resume description for ATS optimization, grammar, strong action words, and clarity:\n\n${text}`;
    const output = await generateFromPrompt(prompt);
    res.json({ optimizedText: output });
  } catch (error) {
    res.status(500).json({ error: 'Gemini optimization failed', details: error.message });
  }
}

export async function generatePortfolioText(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const aiPrompt = `Create a professional portfolio bio and project summary based on the following details:\n\n${prompt}`;
    const output = await generateFromPrompt(aiPrompt);
    res.json({ portfolioText: output });
  } catch (error) {
    res.status(500).json({ error: 'Gemini portfolio generation failed', details: error.message });
  }
}
