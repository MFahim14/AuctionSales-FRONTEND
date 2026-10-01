"use client";

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@/compat/router";
import { forgotPassword } from "../../auth/session";
import { Button } from "../../components/Button";
import { Field } from "../../components/Field";
import { Input } from "../../components/Input";
import { paths } from "../../routes/paths";

const COPY = "If this email is in the pool, a code was sent.";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    await forgotPassword(email);
    setPending(false);
    setDone(true);
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
      <h1 className="font-serif text-[32px] leading-10 tracking-[-0.02em]">Forgot password</h1>
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </Field>
      {done ? <p className="text-sm text-ink">{COPY}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        Send code
      </Button>
      {done ? (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => navigate(`${paths.forgotConfirm}?email=${encodeURIComponent(email.trim().toLowerCase())}`)}
        >
          Enter code
        </Button>
      ) : null}
      <p>
        <Link to={paths.signIn} className="text-sm text-accent">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
