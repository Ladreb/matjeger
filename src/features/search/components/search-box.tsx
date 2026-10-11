"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 200;
const MIN_TERM_LENGTH_WHILE_TYPING = 2;

export function SearchBox({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isFocused, setIsFocused] = useState(false);
  const [seenQuery, setSeenQuery] = useState(initialQuery);

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  // The URL changed from outside (back button, the Søk tab). Not while typing, or a late answer would overwrite the user's text.
  if (seenQuery !== initialQuery) {
    setSeenQuery(initialQuery);
    if (!isFocused) setValue(initialQuery);
  }

  function search(term: string) {
    const trimmed = term.trim();
    startTransition(() => {
      router.replace(
        trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search",
      );
    });
  }

  function scheduleSearch(next: string) {
    clearTimeout(debounceTimer.current);

    const length = next.trim().length;
    if (length === 0 || length >= MIN_TERM_LENGTH_WHILE_TYPING) {
      debounceTimer.current = setTimeout(() => search(next), DEBOUNCE_MS);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setValue(next);
    if (!(event.nativeEvent as InputEvent).isComposing) scheduleSearch(next);
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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        onChange={handleChange}
        onCompositionEnd={(event) => scheduleSearch(event.currentTarget.value)}
        placeholder="Søk etter navn eller merke"
        aria-label="Søk etter produkter"
        autoComplete="off"
      />
      <Button
        type="submit"
        className={cn(
          "transition-opacity",
          isPending && "opacity-60 delay-300",
        )}
      >
        Søk
      </Button>
    </form>
  );
}
