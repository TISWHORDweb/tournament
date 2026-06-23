import { StackCategory, TeamGroup } from "@/lib/types";
import { STACK_CATEGORIES, GROUP_CAPACITY, RESERVE_CAPACITY, TOTAL_CAPACITY } from "./constants";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function buildOccupancyKey(category: StackCategory, group: TeamGroup | null): string {
  if (category === "RESERVE") return "RESERVE";
  return `${category}_${group}`;
}

export type OccupancyMap = Record<string, number>;

export function calculateStats(occupancy: OccupancyMap) {
  const totalRegistered = Object.values(occupancy).reduce((sum, n) => sum + n, 0);
  const remainingSlots = TOTAL_CAPACITY - totalRegistered;
  const reserveRemaining = RESERVE_CAPACITY - (occupancy["RESERVE"] ?? 0);

  const availableTeams = STACK_CATEGORIES.filter((cat) => {
    if (cat === "RESERVE") return (occupancy["RESERVE"] ?? 0) < RESERVE_CAPACITY;
    const groupA = occupancy[`${cat}_A`] ?? 0;
    const groupB = occupancy[`${cat}_B`] ?? 0;
    return groupA < GROUP_CAPACITY || groupB < GROUP_CAPACITY;
  }).length;

  return {
    totalRegistered,
    remainingSlots,
    availableTeams,
    reserveRemaining,
    progressPercent: Math.round((totalRegistered / TOTAL_CAPACITY) * 100),
  };
}
