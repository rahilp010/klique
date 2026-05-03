const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

async function callGeminiApi(promptText) {
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: promptText }] }],
                }),
            }
        );

        const data = await res.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            '⚠️ No response received from Gemini API.';

        return text;
    } catch (err) {
        console.error('Gemini API Error:', err);
        return '⚠️ Error while fetching response: ' + err.message;
    }
}

const toolPrompts = {
    Article: (prompt, tone, language, length) =>
        `You are an expert content writer. Write a detailed, well-structured article in ${language} about "${prompt}".
The article should reflect a ${tone} tone, include a strong introduction, organized sections, and a conclusion.
Ensure factual accuracy, clarity, and engagement. Target length: around ${length} words.`,

    Email: (prompt, tone, language) =>
        `You are a professional email copywriter. Compose a clear, concise, and well-formatted email in ${language} about "${prompt}".
Use a ${tone} tone appropriate for the context. Include a subject line and maintain natural, polite phrasing.`,

    Essay: (prompt, tone, language, length) =>
        `You are an academic writer. Write an essay in ${language} about "${prompt}".
Maintain a ${tone} tone with logical flow, introduction, body paragraphs, and a conclusion.
Support arguments with relevant reasoning or examples. Length: around ${length} words.`,

    Keywords: (prompt, language) =>
        `You are an SEO expert. Generate a list of highly relevant, high-impact SEO keywords for "${prompt}" in ${language}.
Include both short-tail and long-tail keywords. Present them as a bulleted list, one per line, without numbering.`,

    Title: (prompt, language) =>
        `You are a creative copywriter. Generate 10 catchy, attention-grabbing titles in ${language} for the topic "${prompt}".
Each title should be unique, engaging, and relevant to the theme.
Show the titles as bullet points, each surrounded by double quotes.`,

    Name: (prompt, language) =>
        `You are a branding specialist. Suggest a list of unique, memorable, and creative brand or product names related to "${prompt}" in ${language}.
Make sure each name is short, easy to pronounce, and conveys the right emotional or conceptual meaning.
Present each name as a bullet point, each surrounded by double quotes and remove * from the list.`,

    Paragraph: (prompt, tone, language) =>
        `You are a skilled writer. Write a descriptive and coherent paragraph in ${language} about "${prompt}".
Maintain a ${tone} tone throughout. The paragraph should be rich in detail, natural in flow, and contextually accurate.`,

    Prompt: (prompt) =>
        `You are an expert in AI prompt engineering. Create an optimized, detailed prompt for the topic "${prompt}".
The prompt should be structured to produce high-quality, context-aware results in models like Gemini or ChatGPT.
Include instructions for tone, length, and context if relevant. Output only the final optimized prompt.`,

    Translation: (prompt, language) =>
        `You are a professional translator with expertise in preserving tone, context, and cultural nuances.
Translate the following text accurately into ${language}.
- Maintain the same style, tone, and intent as the original.
- Adapt idioms or expressions naturally for native speakers.
- Do not include explanations, quotes, or formatting — output only the translated text.
Text: "${prompt}"`,

    Paraphrase: (prompt, tone) =>
        `You are a professional paraphraser. Rephrase the following text into 3 distinct paraphrased versions, keeping the original meaning intact:
"${prompt}"

Each version should:
- Be written in a **${tone}** tone.
- Be concise (1 sentence each).
- Avoid repetition or hashtags unless they naturally fit the tone.
- Use emojis where appropriate.
Return only the 5 paraphrased versions, clearly separated by:
---`,

    GrammerChecker: (prompt) =>
        `You are a professional proofreader and grammar expert.
Review the following text and correct all grammar, spelling, punctuation, and sentence structure errors.

Maintain the original tone, style, and meaning.
Return the corrected version of the text in given language.
Do not explain or comment on the corrections — output only the improved text.

Text to check:
"${prompt}"`,


    Summarizer: (prompt) =>
        `You are an expert summarizer and content analyst.
Summarize the following text into high-quality summaries while preserving the key ideas, tone, and intent of the original content.

Text:
"${prompt}"

Guidelines:
- Write all summaries in given language & tone.
- Each summary should be concise (1–2 sentences max).
- Focus on clarity and readability — avoid redundancy or filler words.
- Use emojis only when they naturally enhance expression and match the tone.
- Do not include explanations, titles, or hashtags.
`};



export { callGeminiApi, toolPrompts };
