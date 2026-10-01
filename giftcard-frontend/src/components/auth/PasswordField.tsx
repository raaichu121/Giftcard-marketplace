"use client";

import React, { useState } from "react";

export default function PasswordField({
  value,
  onChange,
  placeholder = "Password",
  required = true,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="gc-auth-input pr-12"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gc-muted hover:text-gc-purple p-1"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={1.5} d="M3 3l18 18M10.5 10.7a3 3 0 004.6 4.6M6.4 6.4C4.6 7.8 3.3 9.5 2 12c2.5 5 7.5 8 10 8 1.2 0 2.4-.3 3.5-.9M14 14.2c-.8.5-1.7.8-2.7.8-2.2 0-4-1.8-4-4 0-.5.1-1 .3-1.4" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={1.5} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
          </svg>
        )}
      </button>
    </div>
  );
}
