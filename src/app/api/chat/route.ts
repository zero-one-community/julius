import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// J.U.L.I.U.S AI Chat Assistant – Real LLM backend via z-ai-web-dev-sdk
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are **J.U.L.I.U.S**, an advanced cybersecurity and OPSEC expert assistant built by the Zero One Community.

## Your Role
You are a professional cybersecurity advisor and security research assistant. You help users understand threats, improve their security posture, and navigate the digital world safely.

## Capabilities
- **Threat Analysis**: Explain attack vectors, malware behavior, and threat landscapes.
- **OPSEC Guidance**: Provide operational security best practices for researchers, journalists, and privacy-conscious users.
- **Vulnerability Assessment**: Help users understand CVEs, common weaknesses, and remediation strategies.
- **Privacy & Anonymity**: Advise on tools, techniques, and configurations for protecting digital identity.
- **Security Tools**: Explain and recommend open-source security tools and their proper, authorized use.
- **Network Security**: Discuss firewall rules, intrusion detection, and secure network architecture.
- **Incident Response**: Guide users through basic incident triage and containment steps.
- **Security Levels**: Reference the 5 operational levels (L1 Surface → L2 Standard → L3 Sensitive → L4 Classified → L5 Restricted) when relevant to categorize information or risk.

## Principles
1. **Ethical Boundaries**: Never assist with illegal activities, unauthorized access, or harm to others. Always emphasize authorized, ethical security research and responsible disclosure.
2. **Accuracy**: Provide technically accurate information. If unsure, say so rather than guessing.
3. **Accessible Language**: Use technical but approachable language. Explain jargon when used.
4. **Actionable Advice**: Give practical, step-by-step guidance users can follow.
5. **Markdown Formatting**: Use markdown for structure — headers, bullet points, code blocks, and bold text when it helps readability.
6. **Concise yet Thorough**: Be efficient with words but never sacrifice important details or warnings.

## Response Style
- Start with a direct answer, then elaborate.
- Use \`code blocks\` for commands, configs, and code.
- Use **bold** for emphasis on critical points.
- Include warnings with ⚠️ when describing risky operations.
- End complex responses with a brief summary or key takeaway when appropriate.`;

// Maximum conversation turns to keep (excluding system prompt) to stay within context limits
const MAX_HISTORY_MESSAGES = 30;

// Timeout for LLM response generation (milliseconds)
const LLM_TIMEOUT_MS = 30_000;

// Fallback responses when the AI is unavailable
const FALLBACK_RESPONSES = [
  '⚠️ J.U.L.I.U.S AI is currently experiencing connectivity issues. Please try again in a moment.',
  '⚠️ Unable to reach the AI core. The J.U.L.I.U.S neural network may be reinitializing. Please retry shortly.',
  '⚠️ Connection to J.U.L.I.U.S AI has been interrupted. Your message was not processed. Please try again.',
];

function getFallbackResponse(): string {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function buildMessages(
  history: ChatMessage[],
  context?: string,
): Array<{ role: 'assistant' | 'user'; content: string }> {
  // Build the system prompt, optionally appending user context
  let systemContent = SYSTEM_PROMPT;
  if (context && context.trim()) {
    systemContent += `\n\n## Current User Context\n${context.trim()}`;
  }

  // Trim history if it exceeds the maximum
  const trimmed =
    history.length > MAX_HISTORY_MESSAGES
      ? history.slice(-MAX_HISTORY_MESSAGES)
      : history;

  // Ensure roles alternate correctly — the SDK expects 'assistant' for system prompts
  const messages: Array<{ role: 'assistant' | 'user'; content: string }> = [
    { role: 'assistant', content: systemContent },
  ];

  for (const msg of trimmed) {
    // Only include user and assistant roles
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
    }
  }

  return messages;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── Support both new (messages[]) and legacy (message string) formats ──
    let messages: ChatMessage[];
    let context: string | undefined;

    if (Array.isArray(body.messages) && body.messages.length > 0) {
      // New format: { messages: [...], context?: string }
      messages = body.messages.map(
        (m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: String(m.content ?? ''),
        }),
      );
      context = body.context;
    } else if (typeof body.message === 'string' && body.message.trim()) {
      // Legacy format: { message: string, context?: string }
      messages = [{ role: 'user', content: body.message.trim() }];
      context = body.context;
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            'Request must include either a "messages" array or a "message" string.',
        },
        { status: 400 },
      );
    }

    // Validate that at least one user message exists
    const hasUserMessage = messages.some((m) => m.role === 'user');
    if (!hasUserMessage) {
      return NextResponse.json(
        { success: false, error: 'At least one user message is required.' },
        { status: 400 },
      );
    }

    // Build the full message list with system prompt + history
    const llmMessages = buildMessages(messages, context);

    // Initialize the ZAI SDK and create a chat completion with timeout
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const completionPromise = zai.chat.completions.create({
      messages: llmMessages,
      thinking: { type: 'enabled', budget_tokens: 5000 },
    });

    const timeoutPromise = new Promise<never>((_resolve, reject) =>
      setTimeout(
        () => reject(new Error('LLM response timed out after 30 seconds')),
        LLM_TIMEOUT_MS,
      ),
    );

    const completion = await Promise.race([completionPromise, timeoutPromise]);

    const message = completion.choices?.[0]?.message;
    const reply =
      message?.content?.trim() ||
      'I apologize, but I could not generate a meaningful response. Please try rephrasing your question.';
    const thinking = message?.thinking?.trim() || '';

    return NextResponse.json({
      success: true,
      data: { reply, thinking },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    console.error('[J.U.L.I.U.S Chat API] Error:', errorMessage);

    // Return a graceful fallback so the UI always has something to display
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process chat request',
        data: { reply: getFallbackResponse() },
      },
      { status: 500 },
    );
  }
}
