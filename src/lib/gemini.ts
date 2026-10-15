const KEY = "gemini_api_key";
const MODEL = "gemini-2.5-flash";

export const getApiKey = () =>
  typeof window === "undefined" ? "" : localStorage.getItem(KEY) ?? "";
export const setApiKey = (k: string) => localStorage.setItem(KEY, k.trim());
export const clearApiKey = () => localStorage.removeItem(KEY);

export type ChatTurn = { role: "user" | "model"; text: string };

export class AIError extends Error {}

export async function callGemini(opts: {
  system: string;
  contents: ChatTurn[];
  json?: boolean;
}): Promise<string> {
  const key = getApiKey();
  if (!key) throw new AIError("No API key found. Add your Gemini API key on the Settings page.");
  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: opts.system }] },
          contents: opts.contents.map((c) => ({ role: c.role, parts: [{ text: c.text }] })),
          generationConfig: opts.json ? { responseMimeType: "application/json" } : undefined,
        }),
      },
    );
  } catch {
    throw new AIError("Network error. Check your internet connection and try again.");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg: string = data?.error?.message ?? "";
    if (res.status === 400 && /api key/i.test(msg))
      throw new AIError("Your API key is invalid. Update it on the Settings page.");
    if (res.status === 403) throw new AIError("API key rejected (permission denied). Check the key on Settings.");
    if (res.status === 429) throw new AIError("Rate limit reached. Wait a moment and try again.");
    throw new AIError(msg || `Gemini request failed (${res.status}).`);
  }
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (!text) throw new AIError("The AI returned an empty response. Try regenerating.");
  return text;
}

export function parseJSON<T>(text: string): T {
  const cleaned = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AIError("Couldn't read the AI response. Please regenerate.");
  }
}
