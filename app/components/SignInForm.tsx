"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  signInAction,
  type AuthActionState,
} from "../lib/auth-actions";

const initialState: AuthActionState = {};

type Props = {
  nextPath?: string;
};

export function SignInForm({ nextPath = "/cuenta" }: Props) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form className="fh-auth-form" action={formAction}>
      <input type="hidden" name="next" value={nextPath} />

      <label className="fh-auth-field">
        <span>Correo electrónico</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="tu@correo.com"
        />
      </label>

      <label className="fh-auth-field">
        <span>Contraseña</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          minLength={6}
        />
      </label>

      {state.error ? (
        <p className="fh-auth-message fh-auth-message-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        className="fh-btn fh-btn-primary fh-auth-submit"
        disabled={pending}
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>

      <p className="fh-auth-switch">
        ¿No tienes cuenta? <Link href="/registro">Regístrate</Link>
      </p>
    </form>
  );
}
