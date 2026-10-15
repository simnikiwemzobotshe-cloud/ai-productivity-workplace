import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIError, callGemini, MODEL, parseJSON } from "@/lib/gemini";

const KEY = "test-key-abc";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent";

type Call = { url: string; init: RequestInit };
let calls: Call[] = [];

const response = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

const answer = (parts: unknown[], finishReason = "STOP") =>
  response({ candidates: [{ content: { parts }, finishReason }] });

beforeEach(() => {
  localStorage.setItem("gemini_api_key", KEY);
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return answer([{ text: "OK" }]);
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

const bodyOf = (c: Call) => JSON.parse(c.init.body as string);

describe("Gemini request", () => {
  it("uses the current stable model", () => {
    expect(MODEL).toBe("gemini-3.8-flash");
  });

  it("sends the key in a header, never in the URL", async () => {
    await callGemini({ system: "sys", contents: [{ role: "user", text: "hi" }] });
    const [call] = calls;
    expect(call.url).toBe(ENDPOINT);
    expect(call.url).not.toContain("key=");
    expect((call.init.headers as Record<string, string>)["x-goog-api-key"]).toBe(KEY);
  });

  it("asks for low reasoning effort and JSON output when requested", async () => {
    await callGemini({ system: "sys", contents: [{ role: "user", text: "hi" }] });
    expect(bodyOf(calls[0]).generationConfig).toEqual({ thinkingConfig: { thinkingLevel: "low" } });

    await callGemini({ system: "sys", contents: [{ role: "user", text: "hi" }], json: true });
    expect(bodyOf(calls[1]).generationConfig).toEqual({
      thinkingConfig: { thinkingLevel: "low" },
      responseMimeType: "application/json",
    });
  });

  it("keeps reasoning summaries out of the answer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        answer([
          { text: "I will be brief.", thought: true },
          { text: "The real answer." },
        ]),
      ),
    );
    const text = await callGemini({ system: "sys", contents: [{ role: "user", text: "hi" }] });
    expect(text).toBe("The real answer.");
  });

  it("explains when the model is not available to this key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        response(
          { error: { message: "Model [models/gemini-3.8-flash] is unavailable to new users.", status: "NOT_FOUND" } },
          404,
        ),
      ),
    );
    await expect(
      callGemini({ system: "sys", contents: [{ role: "user", text: "hi" }] }),
    ).rejects.toThrow(/isn't available for your key/);
  });

  it("explains an invalid key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        response({ error: { message: "API key not valid. Please pass a valid API key." } }, 400),
      ),
    );
    await expect(
      callGemini({ system: "sys", contents: [{ role: "user", text: "hi" }] }),
    ).rejects.toThrow(new AIError("Your API key is invalid. Update it on the Settings page."));
  });
});

describe("parseJSON", () => {
  it("reads fenced and wrapped model output", () => {
    expect(parseJSON('```json\n{"subject":"Hi"}\n```')).toEqual({ subject: "Hi" });
    expect(parseJSON('Sure! {"body":"text"} hope that helps')).toEqual({ body: "text" });
  });

  it("fails clearly on unusable output", () => {
    expect(() => parseJSON("not json at all")).toThrow(/Couldn't read the AI response/);
  });
});
