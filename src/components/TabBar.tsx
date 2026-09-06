"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, IndustryIcon, ResultsIcon, UserIcon } from "./icons";

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/user", label: "User", Icon: UserIcon },
  { href: "/results", label: "Results", Icon: ResultsIcon },
  { href: "/industry", label: "Industry", Icon: IndustryIcon },
] as const;

/**
 * The four primary tabs. They sit at the bottom on every breakpoint, as a full-width
 * bar on phones and as a centred floating dock from tablet upwards.
 */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center
                 pb-[env(safe-area-inset-bottom,0px)] sm:pb-5"
    >
      <ul
        className="flex w-full items-stretch justify-around gap-1
                   border-t border-line bg-paper/95 px-2 py-2 backdrop-blur-sm
                   sm:w-auto sm:gap-2 sm:rounded-full sm:border sm:px-3
                   sm:shadow-[0_8px_28px_rgba(42,37,32,0.14)]"
      >
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1 sm:flex-none">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex h-full flex-col items-center justify-center gap-1
                            rounded-2xl px-2 py-1.5 text-[0.7rem] font-medium transition-colors
                            sm:flex-row sm:gap-2 sm:rounded-full sm:px-4 sm:py-2.5 sm:text-sm
                            ${
                              active
                                ? "text-rust sm:bg-rust sm:text-paper"
                                : "text-ink-soft hover:text-rust sm:hover:bg-rust-tint"
                            }`}
              >
                <span
                  className={`flex items-center justify-center rounded-full transition-colors
                              px-3 py-0.5 sm:px-0 sm:py-0
                              ${active ? "bg-rust-tint sm:bg-transparent" : "bg-transparent"}`}
                >
                  <Icon className="h-5 w-5 sm:h-[1.15rem] sm:w-[1.15rem]" />
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
