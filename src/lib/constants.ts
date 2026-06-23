import type { StackCategory, TeamGroup } from "@/lib/types";

export const TOTAL_CAPACITY = 82;
export const GROUP_CAPACITY = 9;
export const RESERVE_CAPACITY = 10;
export const STACK_CAPACITY = 18;

export const STACK_LABELS: Record<StackCategory, string> = {
  BACKEND: "Backend Developers",
  FRONTEND: "Frontend Developers",
  MOBILE: "Mobile Developers",
  UI_UX: "UI/UX Designers",
  RESERVE: "Reserve Bench",
};

export const STACK_SHORT: Record<StackCategory, string> = {
  BACKEND: "Backend",
  FRONTEND: "Frontend",
  MOBILE: "Mobile",
  UI_UX: "UI/UX",
  RESERVE: "Reserve",
};

export const GROUP_LABELS: Record<TeamGroup, string> = {
  A: "Group A",
  B: "Group B",
};

export { STACK_CATEGORIES, TEAM_GROUPS } from "@/lib/types";

/** Team identity colors — dusty blue, teal, violet, terracotta */
export const STACK_COLORS: Record<
  StackCategory,
  { primary: string; muted: string; branch: string }
> = {
  BACKEND: { primary: "#6B8CAE", muted: "rgba(107, 140, 174, 0.15)", branch: "backend" },
  FRONTEND: { primary: "#4A9B94", muted: "rgba(74, 155, 148, 0.15)", branch: "frontend" },
  MOBILE: { primary: "#8B7BC7", muted: "rgba(139, 123, 199, 0.15)", branch: "mobile" },
  UI_UX: { primary: "#C17B5C", muted: "rgba(193, 123, 92, 0.15)", branch: "ui-ux" },
  RESERVE: { primary: "#9A9488", muted: "rgba(154, 148, 136, 0.15)", branch: "reserve" },
};

export const FLOODLIGHT = "#FFC94A";
export const PITCH_DEEP = "#0B2419";
export const PITCH_MID = "#0F2E20";

export function getTeamKey(category: StackCategory, group: TeamGroup | null): string {
  if (category === "RESERVE") return "RESERVE";
  return `${category}_${group}`;
}

export function formatCurrency(amountInKobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

export function generateRegistrationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `TTC-${year}-${random}`;
}
