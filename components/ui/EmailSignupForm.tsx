"use client";

import { FormEvent, useState } from "react";
import { CTAButton } from "@/components/ui/CTAButton";
import { JOIN } from "@/lib/constants";
import { isValidEmail } from "@/lib/waitlist";

type FormState = "idle" | "loading" | "success" | "error";

type EmailSignupFormProps = {
  theme?: "light" | "dark";
};

export function EmailSignupForm({ theme = "light" }: EmailSignupFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isDark = theme === "dark";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setState("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setState("success");
      setEmail("");
    } catch (error) {
      setState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    }
  }

  if (state === "success") {
    return (
      <div className="text-center" role="status" aria-live="polite">
        <p className={`font-display text-2xl ${isDark ? "text-[#f0ebe3]" : "text-foreground"}`}>
          {JOIN.success}
        </p>
        <p className={`mt-2 text-sm ${isDark ? "text-[#f0ebe3]/55" : "text-foreground/50"}`}>
          {JOIN.privacy}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md" noValidate>
      <div className="flex flex-col gap-4 sm:flex-row">
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder="your@email.com"
          required
          autoComplete="email"
          className={`flex-1 border px-4 py-3.5 text-sm focus:outline-none ${
            isDark
              ? "border-[#f0ebe3]/30 bg-[#f0ebe3]/10 text-[#f0ebe3] placeholder:text-[#f0ebe3]/35 focus:border-[#f0ebe3]/55"
              : "border-border bg-background text-foreground placeholder:text-foreground/30 focus:border-foreground/30"
          }`}
        />
        <CTAButton type="submit" disabled={state === "loading"} variant={isDark ? "inverted" : "primary"}>
          {state === "loading" ? "..." : JOIN.button}
        </CTAButton>
      </div>

      {state === "error" && errorMessage && (
        <p
          className={`mt-3 text-center text-sm ${isDark ? "text-red-300" : "text-red-700"}`}
          role="alert"
          aria-live="assertive"
        >
          {errorMessage}
        </p>
      )}

      <p className={`mt-4 text-center text-xs ${isDark ? "text-[#f0ebe3]/45" : "text-foreground/40"}`}>
        {JOIN.privacy}
      </p>
    </form>
  );
}
