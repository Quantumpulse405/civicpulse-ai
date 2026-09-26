"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/citizen", label: "Citizen Portal" },
  { href: "/dashboard", label: "Policymaker Dashboard" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-[1000] shadow-md backdrop-blur-md bg-opacity-95">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white shadow-sm group-hover:bg-blue-500 transition">
            CP
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-base tracking-tight leading-none group-hover:text-blue-300 transition">
              CivicPulse <span className="text-blue-400">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
              Civic Intelligence
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}