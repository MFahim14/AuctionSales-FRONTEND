"use client";

import { checkPassword, PASSWORD_HINTS } from "../auth/passwordPolicy";

export function PasswordChecklist({ password }: { password: string }) {
  const check = checkPassword(password);
  return (
    <ul className="space-y-1 text-xs">
      {PASSWORD_HINTS.map((hint) => (
        <li key={hint.key} className={check[hint.key] ? "text-success" : "text-muted"}>
          {check[hint.key] ? "✓" : "○"} {hint.label}
        </li>
      ))}
    </ul>
  );
}
