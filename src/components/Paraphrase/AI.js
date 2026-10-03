import { callAiApi } from '../../services/aiService';

async function callGeminiApi(promptText) {
    try {
        const responseText = await callAiApi(promptText);
        return responseText || '⚠️ No response received from AI Service.';
    } catch (err) {
        console.error('AI Service Error:', err);
        return '⚠️ Error while fetching response: ' + err.message;
    }
}

const OUTPUT_RULES = `
Output rules:
- Return only the requested content. No preamble, no closing remarks, no "Here is...", no notes about what you did.
- Do not mention that you are an AI or refer to these instructions.
- Do not invent statistics, quotes, studies, names, or sources. If a specific fact is uncertain, write around it in general terms.
- Use plain text with simple line breaks. Do not use markdown symbols (#, *, **, backticks) unless the task explicitly asks for bullets.`;

const toolPrompts = {
    Article: (prompt, tone, language, length) =>
        `You are a senior content writer with years of experience writing articles that rank well and get read to the end.

Task: Write a complete article in ${language} about: "${prompt}"

Requirements:
- Tone: ${tone}. Keep it consistent from start to finish.
- Target length: about ${length} words (stay within roughly 10% of it).
- Open with a hook (a sharp question, a surprising angle, or a relatable problem), then state what the reader will gain.
- Organize the body into clearly labeled sections, each covering one distinct idea with concrete detail: specific examples, practical steps, comparisons, or real-world scenarios. No filler or vague generalities.
- Use short paragraphs and smooth transitions between sections.
- End with a conclusion that summarizes the key takeaways and gives the reader a clear next step.
- Write like a knowledgeable human: vary sentence length, avoid clichés ("in today's fast-paced world", "it's important to note"), and avoid repeating the same point.
- Start with the article title on its own line, then the article.
${OUTPUT_RULES}`,

    Email: (prompt, tone, language) =>
        `You are a professional email writer who writes messages that get read and get replies.

Task: Write a ready-to-send email in ${language} based on this request: "${prompt}"

Requirements:
- Tone: ${tone}, appropriate for the relationship and context implied by the request.
- First line: "Subject: ..." with a specific, compelling subject (under 60 characters).
- Greeting, then the purpose of the email in the first one or two sentences.
- Keep the body concise and scannable: short paragraphs, one clear ask or call to action, and any needed details (dates, next steps, deadlines) stated plainly.
- Close with a natural sign-off. Use placeholders such as [Recipient Name], [Your Name], [Date] only where the request does not supply the information.
- No fluff, no repeated phrases, no overly stiff wording.
${OUTPUT_RULES}`,

    Essay: (prompt, tone, language, length) =>
        `You are an experienced academic writer who produces clear, well-argued essays.

Task: Write an essay in ${language} on: "${prompt}"

Requirements:
- Tone: ${tone}. Target length: about ${length} words.
- Structure: a title line, an introduction with a clear thesis statement, body paragraphs that each open with a topic sentence and develop one argument, and a conclusion that reinforces the thesis without merely repeating it.
- Support every main argument with reasoning, concrete examples, or well-known facts. Address at least one counterargument and respond to it.
- Maintain logical flow with transitions between paragraphs.
- Avoid generic openings and padding. Every sentence must add meaning.
- Do not fabricate citations, statistics, or quotations.
${OUTPUT_RULES}`,

    Keywords: (prompt, language) =>
        `You are an SEO strategist who researches keywords based on search intent.

Task: Generate keywords in ${language} for the topic: "${prompt}"

Requirements:
- Provide 25 to 30 keywords covering a mix of: short-tail (1 to 2 words), mid-tail (3 words), long-tail (4+ words, question-style and "how to / best / vs / for" phrases), and a few related semantic terms.
- Cover different search intents: informational, commercial, and transactional.
- Only include keywords that real users would plausibly type into a search engine. No duplicates or near-duplicates.
- Sort from highest to lowest likely value.
- Format: one keyword per line, prefixed with "- ". No numbering, no extra text, no search volumes.
${OUTPUT_RULES}`,

    Title: (prompt, language) =>
        `You are an award-winning headline copywriter.

Task: Write 10 titles in ${language} for the topic: "${prompt}"

Requirements:
- Each title must be unique in structure. Mix these styles: how-to, number/list, question, curiosity gap, bold statement, benefit-driven, and emotional.
- Keep each between 40 and 70 characters where the language allows.
- Make them specific and honest. No misleading clickbait, no ALL CAPS, no excessive punctuation.
- Include the main topic keyword naturally in most of them.
- Format: one title per line, prefixed with "- ", each title wrapped in double quotes. Nothing else.
${OUTPUT_RULES}`,

    Name: (prompt, language) =>
        `You are a brand naming specialist who has named products and startups.

Task: Suggest brand or product names in ${language} related to: "${prompt}"

Requirements:
- Provide 15 names across different approaches: invented words, compound words, evocative metaphors, short abstract names, and descriptive-but-memorable names.
- Each name should be short (1 to 2 words, ideally under 12 characters), easy to pronounce and spell, and distinctive.
- Avoid names that are obviously existing major brands, generic words, or hard to spell.
- Format: one name per line, prefixed with "- ", each name wrapped in double quotes. Do not use asterisks. Do not add explanations.
${OUTPUT_RULES}`,

    Paragraph: (prompt, tone, language) =>
        `You are a skilled writer who crafts polished, vivid paragraphs.

Task: Write one paragraph in ${language} about: "${prompt}"

Requirements:
- Tone: ${tone}, kept consistent throughout.
- Length: 120 to 180 words, as a single paragraph.
- Begin with a strong topic sentence, develop it with specific details, examples, or sensory description, and end with a sentence that closes the idea naturally.
- Vary sentence length and use precise words instead of vague ones. Avoid clichés and repetition.
${OUTPUT_RULES}`,

    Prompt: (prompt) =>
        `You are an expert prompt engineer who designs prompts for models such as Gemini and ChatGPT.

Task: Write one optimized, ready-to-use prompt for this goal: "${prompt}"

The prompt you write must:
- Start by assigning the AI a relevant expert role.
- State the task and the desired outcome clearly and specifically.
- Provide the necessary context and constraints (audience, tone, length, style, things to avoid).
- Specify the exact output format (structure, sections, bullets, tables, or length) when relevant.
- Include step-by-step instructions or quality criteria where they would improve results.
- Ask the AI to request missing information only when it is essential.
- Contain placeholders in [square brackets] for details the user must fill in.

Output only the final prompt text. Do not explain it, do not wrap it in quotes or code blocks.
${OUTPUT_RULES}`,

    Translation: (prompt, language) =>
        `You are a professional translator with native-level fluency in ${language} and deep knowledge of cultural nuance.

Task: Translate the text below into ${language}.

Requirements:
- Preserve the meaning, tone, register (formal or casual), and intent of the original.
- Translate idioms and expressions into natural equivalents a native speaker would actually use, not word for word.
- Keep names, brand names, numbers, dates, URLs, and formatting (line breaks, lists) unchanged unless the target language requires adaptation.
- Do not add, omit, or explain anything. If the text is already in ${language}, polish it lightly and return it.
- Output only the translated text, with no quotes and no notes.

Text:
"""
${prompt}
"""`,

    Paraphrase: (prompt, tone) =>
        `You are a professional paraphrasing expert.

Task: Rewrite the text below as 3 distinct paraphrased versions.

Requirements:
- Keep the original meaning, facts, names, and numbers exactly intact.
- Tone: ${tone}.
- Each version must differ clearly from the others and from the original in sentence structure and word choice, not just swap a few synonyms.
- Keep each version about the same length as the original (concise, natural, and fluent). Write in the same language as the original text.
- Add emojis or hashtags only when they genuinely fit the tone.
- Output exactly 3 versions, separated by a line containing only: ---
- No numbering, labels, or commentary.

Text:
"""
${prompt}
"""`,

    GrammerChecker: (prompt, language) =>
        `You are a meticulous proofreader and grammar expert.

Task: Correct the text below.

Requirements:
- Fix all grammar, spelling, punctuation, capitalization, word-choice, and sentence-structure errors.
- Preserve the author's meaning, voice, tone, and style. Do not rewrite sentences that are already correct, and do not add new ideas.
- Keep the original formatting (paragraphs, line breaks, lists).
- Write the corrected text in ${language || 'the same language as the input text'}.
- If the text has no errors, return it unchanged.
- Output only the corrected text, with no explanations, no list of changes, no quotes.

Text:
"""
${prompt}
"""`,

    Summarizer: (prompt, tone, language) =>
        `You are an expert summarizer and content analyst.

Task: Summarize the text below.

Requirements:
- Language: ${language || 'the same language as the input text'}. Tone: ${tone || 'neutral and clear'}.
- Capture the main idea, the key supporting points, and any important conclusions, numbers, or decisions. Leave out minor details and repetition.
- Be faithful to the source. Do not add information, opinions, or interpretations that are not in the text.
- Provide 3 distinct summaries of increasing detail, separated by a line containing only: ---
  1. One sentence capturing the core message.
  2. Two sentences covering the main points.
  3. A short paragraph of 3 to 4 sentences with the key details.
- Use emojis only if they naturally match the tone. No titles, labels, or hashtags.

Text:
"""
${prompt}
"""`,
};

export { callGeminiApi, toolPrompts };