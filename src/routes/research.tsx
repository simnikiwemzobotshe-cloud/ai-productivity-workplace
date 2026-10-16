import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb, ListChecks, Loader2, RefreshCw, Search, FileText } from "lucide-react";
import { useState } from "react";
import { AiNotice, PageHeader } from "@/components/AppShell";
import { CopyButton } from "@/components/CopyButton";
import { logActivity } from "@/lib/activity";
import { generateResearch, randomSeed, type ResearchResult } from "@/lib/generators";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — AI Workplace Assistant" },
      { name: "description", content: "Turn a topic into a summary, key insights and recommendations." },
      { property: "og:title", content: "Research Assistant" },
      { property: "og:description", content: "Turn a topic into a summary, insights and recommendations." },
    ],
  }),
  component: ResearchPage,
});

const sections = [
  { key: "summary", label: "Summary", icon: FileText },
  { key: "insights", label: "Key insights", icon: Lightbulb },
  { key: "recommendations", label: "Recommendations", icon: ListChecks },
] as const;

function ResearchPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult(generateResearch(query, randomSeed()));
      setLoading(false);
      logActivity({ kind: "research", title: `Research: ${query}` });
    }, 900);
  };

  const all = result ? sections.map((s) => `${s.label}\n${result[s.key]}`).join("\n\n") : "";

  return (
    <div>
      <PageHeader title="Research Assistant" subtitle="Enter a topic or a website address to get a structured brief." />
      <form className="card flex flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); run(); }}>
        <label htmlFor="q" className="sr-only">Topic or URL</label>
        <input id="q" className="field flex-1" placeholder="e.g. hybrid work policies, or https://example.com/report"
          value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn-primary" disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          {loading ? "Analysing…" : "Research"}
        </button>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">Prototype: websites are not opened or read — only the text you type is used.</p>

      {result ? (
        <div className="mt-6 space-y-4">
          <div className="flex justify-end gap-2">
            <CopyButton text={all} label="Copy all" />
            <button className="btn-ghost" onClick={run} disabled={loading}>
              <RefreshCw className="size-4" /> Regenerate
            </button>
          </div>
          {sections.map(({ key, label, icon: Icon }) => (
            <section key={key} className="card">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Icon className="size-4 text-primary" /> {label}
                </h2>
                <CopyButton text={result[key]} />
              </div>
              <textarea aria-label={label} rows={key === "summary" ? 4 : 5} className="field leading-relaxed"
                value={result[key]} onChange={(e) => setResult({ ...result, [key]: e.target.value })} />
            </section>
          ))}
        </div>
      ) : (
        <div className="card mt-6 grid place-items-center py-14 text-center text-sm text-muted-foreground">
          <Search className="mb-2 size-8 opacity-40" />
          {loading ? "Building your brief…" : "Your summary, insights and recommendations will appear here."}
        </div>
      )}
      <div className="mt-6"><AiNotice /></div>
    </div>
  );
}
