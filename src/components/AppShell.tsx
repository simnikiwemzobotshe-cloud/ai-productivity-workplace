import { Link } from "@tanstack/react-router";
import { BrainCircuit, LayoutDashboard, Mail, Menu, MessagesSquare, Search, X } from "lucide-react";
import { useState, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "AI Chat", icon: MessagesSquare },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:flex">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <Brand />
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 hover:bg-sidebar-accent"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-30 bg-sidebar/50 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar p-4 text-sidebar-foreground transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-2 py-3">
          <Brand />
        </div>
        <nav className="mt-6 flex flex-col gap-1" aria-label="Main">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-muted transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeProps={{ className: "!bg-brand !text-primary-foreground shadow-lift" }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent p-3 text-xs text-sidebar-muted">
          <span className="font-semibold text-warning">Prototype</span> — responses are generated
          locally in your browser. No AI service is contacted.
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="bg-brand grid size-9 place-items-center rounded-xl text-primary-foreground">
        <BrainCircuit className="size-5" />
      </span>
      <span className="text-sm font-semibold leading-tight">
        Workplace
        <br />
        <span className="text-sidebar-muted font-normal">AI Assistant</span>
      </span>
    </div>
  );
}

export function AiNotice() {
  return (
    <p
      role="note"
      className="rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-foreground"
    >
      <span className="font-semibold text-warning">Responsible AI:</span> generated content may be
      inaccurate. Review it before using or sharing. This prototype uses local sample logic only.
    </p>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-1 text-muted-foreground">{subtitle}</p>
    </div>
  );
}
