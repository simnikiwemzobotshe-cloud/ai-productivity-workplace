import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Mail, RefreshCw, Wand2 } from "lucide-react";
import { useState } from "react";
import { AiNotice, PageHeader } from "@/components/AppShell";
import { CopyButton } from "@/components/CopyButton";
import { logActivity } from "@/lib/activity";
import { generateEmail, randomSeed, type Tone } from "@/lib/generators";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Generator — AI Workplace Assistant" },
      { name: "description", content: "Draft formal, friendly or persuasive workplace emails in seconds." },
      { property: "og:title", content: "Email Generator" },
      { property: "og:description", content: "Draft formal, friendly or persuasive workplace emails." },
    ],
  }),
  component: EmailPage,
});

const tones: Tone[] = ["Formal", "Friendly", "Persuasive"];

function EmailPage() {
  const [form, setForm] = useState({ recipient: "", purpose: "", details: "", tone: "Formal" as Tone });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = () => {
    setLoading(true);
    setTimeout(() => {
      setOutput(generateEmail(form, randomSeed()));
      setLoading(false);
      logActivity({ kind: "email", title: `Email: ${form.purpose}` });
    }, 700);
  };

  return (
    <div>
      <PageHeader title="Email Generator" subtitle="Describe what you need and get a ready-to-edit draft." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="card space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
        >
          <div>
            <label className="label" htmlFor="recipient">Recipient</label>
            <input id="recipient" className="field" placeholder="e.g. Thandi Nkosi" value={form.recipient}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="purpose">Purpose</label>
            <input id="purpose" required className="field" placeholder="e.g. Q3 budget approval" value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="details">Key details</label>
            <textarea id="details" rows={4} className="field resize-none"
              placeholder={"One point per line\ne.g. Deadline is Friday\nBudget increase of 10%"}
              value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
          </div>
          <fieldset>
            <legend className="label">Tone</legend>
            <div className="grid grid-cols-3 gap-2">
              {tones.map((t) => (
                <label key={t}
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${form.tone === t ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted"}`}>
                  <input type="radio" name="tone" value={t} className="sr-only" checked={form.tone === t}
                    onChange={() => setForm({ ...form, tone: t })} />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
          <button className="btn-primary w-full" disabled={loading || !form.purpose.trim()}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
            {loading ? "Generating…" : "Generate email"}
          </button>
        </form>

        <div className="card flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Your draft</h2>
            <div className="flex gap-2">
              <CopyButton text={output} />
              <button className="btn-ghost" onClick={run} disabled={!output || loading}>
                <RefreshCw className="size-4" /> Regenerate
              </button>
            </div>
          </div>
          {output ? (
            <textarea aria-label="Generated email" className="field min-h-80 flex-1 font-mono text-[13px] leading-relaxed"
              value={output} onChange={(e) => setOutput(e.target.value)} />
          ) : (
            <div className="grid flex-1 place-items-center rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              <div>
                <Mail className="mx-auto mb-2 size-8 opacity-40" />
                {loading ? "Writing your email…" : "Fill in the form to generate a draft."}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6"><AiNotice /></div>
    </div>
  );
}
