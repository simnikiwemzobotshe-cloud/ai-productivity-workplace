// Local, browser-side prototype generators. No network calls are made.

export type Tone = "Formal" | "Friendly" | "Persuasive";

const pick = <T,>(arr: T[], seed: number) => arr[Math.abs(seed) % arr.length];
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const clean = (s: string) => s.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "");

function splitDetails(details: string): string[] {
  return details
    .split(/\n|;|•|(?<=\.)\s+/)
    .map((d) => clean(d.replace(/^[-*\d.)\s]+/, "")))
    .filter(Boolean);
}

function firstName(recipient: string) {
  const r = recipient.trim();
  if (!r) return "there";
  if (r.includes("@")) return cap(r.split("@")[0].split(/[._-]/)[0]);
  return r.split(/\s+/)[0];
}

export function generateEmail(
  input: { recipient: string; purpose: string; details: string; tone: Tone },
  seed: number,
): string {
  const name = firstName(input.recipient);
  const purpose = clean(input.purpose) || "a quick follow-up";
  const points = splitDetails(input.details);
  const subjectPrefix = {
    Formal: ["Regarding", "Re:", "Request:"],
    Friendly: ["Quick note on", "About", "Catching up on"],
    Persuasive: ["Opportunity:", "Proposal:", "Why now:"],
  }[input.tone];

  const greeting = {
    Formal: [`Dear ${name},`, `Good day ${name},`],
    Friendly: [`Hi ${name},`, `Hey ${name},`, `Hello ${name}!`],
    Persuasive: [`Hi ${name},`, `Dear ${name},`],
  }[input.tone];

  const opener = {
    Formal: [
      `I am writing to you regarding ${purpose.toLowerCase()}.`,
      `I would like to reach out concerning ${purpose.toLowerCase()}.`,
    ],
    Friendly: [
      `Hope your week is going well! I wanted to touch base about ${purpose.toLowerCase()}.`,
      `Just a quick note about ${purpose.toLowerCase()} — thought it was worth sharing.`,
    ],
    Persuasive: [
      `I'd like to share a proposal on ${purpose.toLowerCase()} that I believe could make a real difference.`,
      `There's a timely opportunity around ${purpose.toLowerCase()} I don't want us to miss.`,
    ],
  }[input.tone];

  const bridge = {
    Formal: "Please find the key points below:",
    Friendly: "Here's what's on my mind:",
    Persuasive: "Here's why this matters:",
  }[input.tone];

  const closing = {
    Formal: [
      "I would appreciate your feedback at your earliest convenience.",
      "Please let me know if you require any further information.",
    ],
    Friendly: [
      "Let me know what you think — happy to chat whenever suits you.",
      "Shout if you have any questions!",
    ],
    Persuasive: [
      "Could we set up 20 minutes this week to agree next steps?",
      "If this resonates, I'd love your go-ahead so we can move quickly.",
    ],
  }[input.tone];

  const signoff = { Formal: "Kind regards,", Friendly: "Cheers,", Persuasive: "Best regards," }[
    input.tone
  ];

  const body = points.length
    ? `${bridge}\n\n${points.map((p) => `• ${cap(p)}`).join("\n")}`
    : input.tone === "Persuasive"
      ? "Acting on this now positions us ahead of the curve and saves effort down the line."
      : "I'm happy to provide more context if helpful.";

  return [
    `Subject: ${pick(subjectPrefix, seed)} ${cap(purpose)}`,
    "",
    pick(greeting, seed + 1),
    "",
    pick(opener, seed + 2),
    "",
    body,
    "",
    pick(closing, seed + 3),
    "",
    signoff,
    "[Your name]",
  ].join("\n");
}

export type ResearchResult = { summary: string; insights: string; recommendations: string };

function topicFrom(input: string): { topic: string; isUrl: boolean } {
  const t = input.trim();
  try {
    if (/^https?:\/\//i.test(t) || /^[\w-]+\.[a-z]{2,}(\/|$)/i.test(t)) {
      const u = new URL(/^https?:/i.test(t) ? t : `https://${t}`);
      const path = u.pathname.split("/").filter(Boolean).pop()?.replace(/[-_]/g, " ") ?? "";
      const host = u.hostname.replace(/^www\./, "");
      return { topic: path ? `${path} (${host})` : host, isUrl: true };
    }
  } catch {
    /* treat as topic */
  }
  return { topic: t, isUrl: false };
}

const lenses = [
  ["adoption", "cost", "skills", "governance"],
  ["customer value", "operational efficiency", "risk", "measurement"],
  ["market trends", "competition", "team readiness", "tooling"],
];

export function generateResearch(input: string, seed: number): ResearchResult {
  const { topic, isUrl } = topicFrom(input);
  const t = topic || "the topic";
  const lens = pick(lenses, seed);
  const note = isUrl
    ? `Note: this prototype did not open the website. The overview below is a sample framework based only on the URL text ("${t}").\n\n`
    : "";
  const summary =
    note +
    pick(
      [
        `${cap(t)} is an area where organisations balance quick wins against long-term ${lens[0]}. Teams that succeed usually start with a narrow, measurable use case, then expand once ${lens[1]} and ${lens[2]} are understood.`,
        `At a high level, ${t} touches ${lens[0]}, ${lens[1]} and ${lens[3]}. The main question for most workplaces is not whether it matters, but how to approach it in a structured, low-risk way.`,
      ],
      seed,
    );
  const insights = [
    `${cap(lens[0])}: early movers on ${t} tend to gain from learning, not just from the outcome itself.`,
    `${cap(lens[1])}: hidden costs often sit in change management rather than in tools.`,
    `${cap(lens[2])}: clear ownership is a stronger predictor of success than budget.`,
    `${cap(lens[3])}: define what "good" looks like before starting, so progress is visible.`,
  ]
    .map((s) => `• ${s}`)
    .join("\n");
  const recommendations = [
    `Run a 2–4 week pilot on one ${t} use case with a named owner.`,
    `Agree 2–3 success metrics tied to ${lens[1]}.`,
    `Brief stakeholders early and collect feedback weekly.`,
    `Verify facts with primary sources before sharing findings.`,
  ]
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");
  return { summary, insights, recommendations };
}

export function chatReply(message: string, seed: number): string {
  const m = message.toLowerCase();
  if (/meeting|agenda/.test(m))
    return "Here's a lean meeting structure:\n\n1. Goal (2 min) — one sentence on the decision needed\n2. Context (5 min) — only what's needed to decide\n3. Discussion (15 min) — options and trade-offs\n4. Decision & owners (5 min)\n5. Next steps (3 min)\n\nTip: share the agenda 24h ahead and cancel if there's no decision to make.";
  if (/priorit|todo|to-do|task|overwhelm/.test(m))
    return "Try the Eisenhower approach:\n\n• Urgent + important → do today\n• Important, not urgent → schedule a block\n• Urgent, not important → delegate\n• Neither → drop it\n\nWant to list your tasks here? I'll help sort them.";
  if (/email|reply|message/.test(m))
    return "For a strong workplace email: lead with the ask, keep it under 150 words, use bullets for details, and end with a clear next step and deadline. The Email Generator page can draft one for you.";
  if (/focus|distract|procrastin/.test(m))
    return "A few focus techniques:\n\n• 50/10 blocks — 50 minutes deep work, 10 minutes break\n• Turn off notifications for the block\n• Write the single outcome for the block before you start\n• Batch messages at set times (e.g. 11:00 and 16:00)";
  if (/feedback|review|performance/.test(m))
    return "Use SBI for feedback: Situation (when/where), Behaviour (what you observed), Impact (the effect). Keep it specific, timely and private, then ask for their view.";
  if (/present|slides|deck/.test(m))
    return "Presentation outline:\n\n1. The one-line takeaway\n2. Why it matters now\n3. Three supporting points with evidence\n4. Risks and how you'll handle them\n5. The ask\n\nAim for one idea per slide.";
  const words = message.trim().split(/\s+/).slice(0, 6).join(" ");
  return pick(
    [
      `Good question about "${words}". To give a useful answer, could you share the goal, the deadline, and who's involved? Meanwhile, a good first step is to write down the single outcome you want.`,
      `Here's a simple way to approach "${words}":\n\n1. Clarify the desired outcome\n2. List constraints (time, people, budget)\n3. Pick the smallest next action you can do today\n\nTell me more and I'll tailor this.`,
    ],
    seed,
  );
}

export const randomSeed = () => Math.floor(Math.random() * 1000);
