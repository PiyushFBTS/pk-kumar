"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const APPLY_TYPES = [
  { value: "JOB", label: "Job" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "ARTICLESHIP", label: "Articleship" },
];

export function CareersForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [hasExperience, setHasExperience] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("hasExperience", hasExperience ? "true" : "false");
      const res = await fetch("/api/careers", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not submit. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded border border-green-300 bg-green-50 p-4 text-sm text-green-800">
        Thank you — your application has been received. We&apos;ll be in touch if there&apos;s a
        fit.
      </p>
    );
  }

  const inputClass =
    "mt-1 w-full rounded border border-border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent";

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5" noValidate>
      {error ? (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div>
        <label htmlFor="applyType" className="block text-sm font-medium text-brand">
          Applying for
        </label>
        <select id="applyType" name="applyType" className={inputClass} defaultValue="JOB">
          {APPLY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-brand">
            Full name
          </label>
          <input id="name" name="name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-brand">
            Phone
          </label>
          <input id="phone" name="phone" required className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand">
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>

      {/* Conditional experience block */}
      <div className="rounded-lg border border-border p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-brand">
          <input
            type="checkbox"
            checked={hasExperience}
            onChange={(e) => setHasExperience(e.target.checked)}
          />
          I have prior work experience
        </label>

        {hasExperience ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="expCompany" className="block text-xs font-medium text-muted">
                Company
              </label>
              <input id="expCompany" name="expCompany" className={inputClass} />
            </div>
            <div>
              <label htmlFor="expYears" className="block text-xs font-medium text-muted">
                Years
              </label>
              <input id="expYears" name="expYears" placeholder="e.g. 3" className={inputClass} />
            </div>
            <div>
              <label htmlFor="expRole" className="block text-xs font-medium text-muted">
                Role
              </label>
              <input id="expRole" name="expRole" className={inputClass} />
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <label htmlFor="resume" className="block text-sm font-medium text-brand">
          Resume (PDF, DOC or DOCX)
        </label>
        <input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="mt-1 block w-full text-sm text-muted"
        />
      </div>

      <div>
        <label htmlFor="coverNote" className="block text-sm font-medium text-brand">
          Cover note (optional)
        </label>
        <textarea id="coverNote" name="coverNote" rows={4} className={inputClass} />
      </div>

      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
