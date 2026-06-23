import Link from "next/link";
import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="divider-dashed border-t bg-[#0B2419] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#FFC94A]">
              <Trophy className="h-4 w-4 text-[#0B2419]" />
            </div>
            <div>
              <p className="font-display uppercase tracking-wide text-[#F0EBE3]">
                Tech Turf Championship
              </p>
              <p className="font-mono text-[10px] text-[#A8B5A8]">built_by_devs · for_devs</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm text-[#A8B5A8]">
            <Link href="/teams" className="transition-colors hover:text-[#FFC94A]">
              Squads
            </Link>
            <Link href="/announcements" className="transition-colors hover:text-[#FFC94A]">
              News
            </Link>
            <Link href="/register" className="transition-colors hover:text-[#FFC94A]">
              Register
            </Link>
          </div>
        </div>
        <p className="mt-8 border-t border-dashed border-[rgba(255,201,74,0.15)] pt-6 text-center font-mono text-[10px] text-[#6B7A6E]">
          © {new Date().getFullYear()} Tech Turf Championship · Kickoff 12 SEP 2026
        </p>
      </div>
    </footer>
  );
}
