"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 200;
const MIN_TERM_LENGTH_WHILE_TYPING = 2;

type SearchBoxProps = {
  initialQuery: string;
  path: string;
  placeholder: string;
  label: string;
  keepParams?: Record<string, string>;
};

export function SearchBox({
  initialQuery,
  path,
  placeholder,
  label,
  keepParams = {},
}: SearchBoxProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [lastSentTerm, setLastSentTerm] = useState(initialQuery);
  const [seenQuery, setSeenQuery] = useState(initialQuery);

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  // A URL we did not send (back button, the Søk tab) replaces the text. Answers to our own searches never do, even late ones.
  if (seenQuery !== initialQuery) {
    setSeenQuery(initialQuery);
    if (initialQuery !== lastSentTerm) {
      setValue(initialQuery);
      setLastSentTerm(initialQuery);
    }
  }

  function search(term: string) {
    const trimmed = term.trim();
    setLastSentTerm(trimmed);
    startTransition(() => {
      const params = new URLSearchParams(keepParams);
      if (trimmed) params.set("q", trimmed);
      const query = params.toString();
      router.replace(query ? `${path}?${query}` : path);
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
    <form action={path} onSubmit={handleSubmit} className="flex gap-2">
      {Object.entries(keepParams).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Input
        name="q"
        type="search"
        value={value}
        onChange={handleChange}
        onCompositionEnd={(event) => scheduleSearch(event.currentTarget.value)}
        placeholder={placeholder}
        aria-label={label}
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
