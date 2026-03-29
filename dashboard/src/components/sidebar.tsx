"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Patients", href: "/", icon: "patients" },
  { label: "Alerts", href: "/alerts", icon: "alerts" },
  { label: "Daily Summary", href: "/daily-summary", icon: "summary" },
  { label: "Settings", href: "#", icon: "settings" },
];

function NavIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? "#FAF7F4" : "#E8DDD4";
  switch (type) {
    case "patients":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="1" width="7" height="7" rx="2" stroke={color} strokeWidth="1.5" />
          <rect x="10" y="1" width="7" height="7" rx="2" stroke={color} strokeWidth="1.5" />
          <rect x="1" y="10" width="7" height="7" rx="2" stroke={color} strokeWidth="1.5" />
          <rect x="10" y="10" width="7" height="7" rx="2" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case "alerts":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2L16 15H2L9 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M9 7V10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="9" cy="12.5" r="0.75" fill={color} />
        </svg>
      );
    case "summary":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="14" height="14" rx="3" stroke={color} strokeWidth="1.5" />
          <path d="M5 7H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5 10H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5 13H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "settings":
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="3" stroke={color} strokeWidth="1.5" />
          <path d="M9 1V3M9 15V17M1 9H3M15 9H17M3.3 3.3L4.7 4.7M13.3 13.3L14.7 14.7M14.7 3.3L13.3 4.7M4.7 13.3L3.3 14.7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[200px] flex-shrink-0 flex-col bg-sidebar px-5 py-8">
      <div className="mb-12">
        <h1 className="font-display text-xl text-sidebar-text">ReEntry</h1>
        <p className="text-xs tracking-widest text-text-muted uppercase">
          Clinic Dashboard
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname.startsWith("/patients")
              : pathname.startsWith(item.href) && item.href !== "#";

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-active text-white font-medium"
                  : "text-sidebar-text hover:bg-sidebar-active/20"
              }`}
            >
              <NavIcon type={item.icon} active={isActive} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-4">
        <p className="text-sm text-sidebar-text">Dr. Sarah Kim</p>
        <p className="text-xs text-text-muted">Bloom OB/GYN</p>
      </div>
    </aside>
  );
}
