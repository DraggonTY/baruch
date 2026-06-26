import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <p className="text-xs tracking-[0.2em] text-foreground/50 uppercase">{SITE.name}</p>
        <p className="text-sm text-foreground/40">
          &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
