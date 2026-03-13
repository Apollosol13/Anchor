import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function explainVerse(verse: string, reference: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a knowledgeable and encouraging Bible scholar. Explain scripture in an accessible way with:
1. Historical context
2. Theological significance
3. Practical application for modern life
Keep responses concise (3-4 paragraphs) and encouraging.`,
      },
      {
        role: 'user',
        content: `Please explain this Bible verse: "${verse}" (${reference})`,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return completion.choices[0].message.content || 'Unable to generate explanation at this time.';
}

export async function getRelatedVerses(verse: string): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'You are a Bible scholar. Suggest 5 related verses that share similar themes or provide complementary insight. Return ONLY the references in format "Book Chapter:Verse", one per line, no additional text.',
      },
      {
        role: 'user',
        content: `Find related verses for: "${verse}"`,
      },
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  const response = completion.choices[0].message.content || '';
  return response
    .split('\n')
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
    .slice(0, 5);
}

export async function generateStudyQuestions(
  verse: string,
  reference: string
): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'You are a Bible study leader. Create 3-5 thoughtful discussion questions that help people reflect deeply on scripture. Questions should encourage personal application and deeper understanding.',
      },
      {
        role: 'user',
        content: `Create study questions for: "${verse}" (${reference})`,
      },
    ],
    max_tokens: 300,
    temperature: 0.8,
  });

  const response = completion.choices[0].message.content || '';
  return response
    .split('\n')
    .map((q) => q.trim())
    .filter((q) => q.length > 0 && q.includes('?'))
    .map((q) => q.replace(/^\d+\.\s*/, ''));
}
