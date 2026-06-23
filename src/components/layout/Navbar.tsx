import Link from "next/link";
import { Trophy } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/teams", label: "Squads" },
  { href: "/announcements", label: "News" },
  { href: "/register", label: "Register" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-dashed border-[rgba(255,201,74,0.2)] bg-[#0B2419]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#FFC94A]">
            <Trophy className="h-4 w-4 text-[#0B2419]" />
          </div>
          <div>
            <span className="font-display text-base uppercase tracking-wide text-[#F0EBE3]">TTC</span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[#A8B5A8]">
              Turf Championship
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#A8B5A8] transition-colors hover:text-[#FFC94A]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/register" className="btn-primary px-4 py-2 text-sm">
          Join Tournament
        </Link>
      </div>
    </header>
  );
}
