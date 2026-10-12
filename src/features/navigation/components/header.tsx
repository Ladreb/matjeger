import { ThemeToggle } from "./theme-toggle";
import { TopNav } from "./top-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
        <span className="text-lg font-bold tracking-tight">Matjeger</span>
        <TopNav />
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
