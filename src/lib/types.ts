export type StackCategory = "BACKEND" | "FRONTEND" | "MOBILE" | "UI_UX" | "RESERVE";
export type TeamGroup = "A" | "B";
export type PlayerStatus = "PENDING" | "APPROVED" | "REMOVED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type AnnouncementType = "MATCH" | "FIXTURE" | "TEAM_UPDATE" | "VENUE" | "NEWS";

export const STACK_CATEGORIES: StackCategory[] = [
  "BACKEND",
  "FRONTEND",
  "MOBILE",
  "UI_UX",
  "RESERVE",
];

export const TEAM_GROUPS: TeamGroup[] = ["A", "B"];
