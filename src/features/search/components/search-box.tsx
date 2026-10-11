"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 200;
const MIN_TERM_LENGTH_WHILE_TYPING = 2;

export function SearchBox({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  function search(term: string) {
    const trimmed = term.trim();
    startTransition(() => {
      router.replace(
        trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search",
      );
    });
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setValue(next);
    clearTimeout(debounceTimer.current);

    const length = next.trim().length;
    if (length === 0 || length >= MIN_TERM_LENGTH_WHILE_TYPING) {
      debounceTimer.current = setTimeout(() => search(next), DEBOUNCE_MS);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    clearTimeout(debounceTimer.current);
    search(value);
  }

  return (
    <form action="/search" onSubmit={handleSubmit} className="flex gap-2">
      <Input
        name="q"
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Søk etter navn eller merke"
        aria-label="Søk etter produkter"
        autoComplete="off"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Søker…" : "Søk"}
      </Button>
    </form>
  );
}
