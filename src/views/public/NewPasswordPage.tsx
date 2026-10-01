"use client";

import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "@/compat/router";
import { useAuth } from "../../auth/AuthProvider";
import { passwordMeetsPolicy } from "../../auth/passwordPolicy";
import { completeNewPassword, hasPendingNewPassword } from "../../auth/session";
import { Button } from "../../components/Button";
import { Field } from "../../components/Field";
import { Input } from "../../components/Input";
import { PasswordChecklist } from "../../components/PasswordChecklist";
import { paths } from "../../routes/paths";

export function NewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  if (!hasPendingNewPassword()) {
    return <Navigate to={paths.signIn} replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordMeetsPolicy(password)) {
      setError("Password does not meet the policy.");
      return;
    }
    setPending(true);
    try {
      await completeNewPassword(password);
      await auth.refresh();
      navigate(paths.home, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set password.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
      <h1 className="font-serif text-[32px] leading-10 tracking-[-0.02em]">Choose a password</h1>
      <Field label="New password" htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </Field>
      <PasswordChecklist password={password} />
      <Field label="Confirm password" htmlFor="confirm">
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
        />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        Continue
      </Button>
    </form>
  );
}
