import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Mail, MessagesSquare, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AiNotice } from "@/components/AppShell";
import { getActivity, type Activity } from "@/lib/activity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — AI Workplace Productivity Assistant" },
      { name: "description", content: "Draft emails, research topics and chat with a workplace assistant." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Draft emails, research topics and chat with a workplace assistant." },
    ],
  }),
  component: Overview,
});

const actions = [
  { to: "/email", title: "Write an email", desc: "Polished drafts in your chosen tone.", icon: Mail },
  { to: "/research", title: "Research a topic", desc: "Summary, insights and next steps.", icon: Search },
  { to: "/chat", title: "Ask the assistant", desc: "Quick help with everyday work.", icon: MessagesSquare },
] as const;

const icons = { email: Mail, research: Search, chat: MessagesSquare };

function Overview() {
  const [activity, setActivity] = useState<Activity[]>([]);
  useEffect(() => setActivity(getActivity()), []);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <section className="bg-brand rounded-3xl p-8 text-primary-foreground shadow-lift">
        <p className="text-sm opacity-80">{greet} 👋</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">What would you like to get done today?</h1>
        <p className="mt-2 max-w-xl opacity-85">
          Your assistant for faster emails, clearer research and quick answers.
        </p>
      </section>

      <section aria-label="Quick actions" className="grid gap-4 sm:grid-cols-3">
        {actions.map(({ to, title, desc, icon: Icon }) => (
          <Link key={to} to={to} className="card group transition hover:-translate-y-0.5 hover:shadow-lift">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 font-semibold">
          <Clock className="size-4 text-muted-foreground" /> Recent activity
        </h2>
        {activity.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nothing yet. Your generated emails, research and chats will appear here.
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {activity.map((a, i) => {
              const Icon = icons[a.kind];
              return (
                <li key={i} className="flex items-center gap-3 py-3 text-sm">
                  <Icon className="size-4 text-primary" />
                  <span className="flex-1 truncate">{a.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AiNotice />
    </div>
  );
}
