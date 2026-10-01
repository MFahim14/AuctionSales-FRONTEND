"use client";

import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "@/compat/router";
import { useAuth } from "../../auth/AuthProvider";
import { mapSignInError, signIn } from "../../auth/session";
import { Button } from "../../components/Button";
import { Field } from "../../components/Field";
import { Input } from "../../components/Input";
import { paths } from "../../routes/paths";

export function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const auth = useAuth();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = await signIn(email, password);
      if (result.kind === "newPasswordRequired") {
        navigate(paths.newPassword);
        return;
      }
      await auth.refresh();
      const next = params.get("next") || paths.home;
      navigate(next.startsWith("/") ? next : paths.home, { replace: true });
    } catch (err) {
      setError(mapSignInError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
      <h1 className="font-serif text-[32px] leading-10 tracking-[-0.02em]">Sign in</h1>
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
      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p>
        <Link to={paths.forgotPassword} className="text-sm text-accent hover:text-accent-hover">
          Forgot password
        </Link>
      </p>
    </form>
  );
}
