export type Activity = { kind: "email" | "research" | "chat"; title: string; at: number };
const KEY = "wpa-activity";

export function logActivity(a: Omit<Activity, "at">) {
  if (typeof window === "undefined") return;
  const list = getActivity();
  list.unshift({ ...a, at: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 8)));
}

export function getActivity(): Activity[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
