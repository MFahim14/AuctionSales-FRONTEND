"use client";

import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "@/compat/router";
import { passwordMeetsPolicy } from "../../auth/passwordPolicy";
import { confirmForgotPassword } from "../../auth/session";
import { Button } from "../../components/Button";
import { Field } from "../../components/Field";
import { Input } from "../../components/Input";
import { PasswordChecklist } from "../../components/PasswordChecklist";
import { useToast } from "../../components/Toast";
import { paths } from "../../routes/paths";

export function ForgotConfirmPage() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const { pushToast } = useToast();

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
      await confirmForgotPassword(email, code, password);
      pushToast("Password updated. Sign in.", "success");
      navigate(paths.signIn, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
      <h1 className="font-serif text-[32px] leading-10 tracking-[-0.02em]">Set a new password</h1>
      <Field label="Email" htmlFor="email">
        <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </Field>
      <Field label="Code" htmlFor="code">
        <Input id="code" value={code} onChange={(event) => setCode(event.target.value)} required />
      </Field>
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
        Update password
      </Button>
      <p>
        <Link to={paths.signIn} className="text-sm text-accent">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
