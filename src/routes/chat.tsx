import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, SendHorizontal, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AiNotice, PageHeader } from "@/components/AppShell";
import { logActivity } from "@/lib/activity";
import { chatReply, randomSeed } from "@/lib/generators";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — AI Workplace Assistant" },
      { name: "description", content: "Chat with a workplace assistant about meetings, focus, feedback and more." },
      { property: "og:title", content: "AI Chat" },
      { property: "og:description", content: "Chat with a workplace productivity assistant." },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; text: string };
const suggestions = [
  "Help me plan a 30-minute meeting agenda",
  "How do I prioritise a busy week?",
  "Tips to stay focused while working from home",
  "How should I give constructive feedback?",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, thinking]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || thinking) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setThinking(true);
    if (messages.length === 0) logActivity({ kind: "chat", title: `Chat: ${t}` });
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: chatReply(t, randomSeed()) }]);
      setThinking(false);
    }, 800);
  };

  return (
    <div>
      <PageHeader title="AI Chat" subtitle="Ask anything about getting work done." />
      <div className="card flex h-[60vh] min-h-96 flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-6" aria-live="polite">
          {messages.length === 0 && (
            <div className="grid h-full place-items-center text-center">
              <div>
                <span className="bg-brand mx-auto grid size-12 place-items-center rounded-2xl text-primary-foreground">
                  <BrainCircuit className="size-6" />
                </span>
                <p className="mt-3 font-semibold">How can I help today?</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {suggestions.map((s) => (
                    <button key={s} className="btn-ghost justify-start text-left" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <span className={`grid size-8 shrink-0 place-items-center rounded-full ${m.role === "user" ? "bg-muted text-foreground" : "bg-brand text-primary-foreground"}`}>
                {m.role === "user" ? <User className="size-4" /> : <BrainCircuit className="size-4" />}
              </span>
              <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="bg-brand grid size-8 place-items-center rounded-full text-primary-foreground">
                <BrainCircuit className="size-4" />
              </span>
              <span className="flex gap-1">
                <span className="size-2 animate-bounce rounded-full bg-primary" />
                <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form className="flex gap-2 border-t p-4" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <label htmlFor="prompt" className="sr-only">Message</label>
          <input id="prompt" className="field flex-1" placeholder="Type your message…" value={input}
            onChange={(e) => setInput(e.target.value)} />
          <button className="btn-primary" aria-label="Send" disabled={!input.trim() || thinking}>
            <SendHorizontal className="size-4" />
          </button>
        </form>
      </div>
      <div className="mt-6"><AiNotice /></div>
    </div>
  );
}
