"use client";

import Link from "next/link";
import { useState } from "react";
import { FiLogIn } from "react-icons/fi";
import { getSupabase } from "../../../lib/supabase";
import { Button } from "../../ui/Button";
import { Field, inputClass } from "../../ui/ViewPrimitives";
import { AuthShell } from "./AuthShell";

export const LoginView = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <AuthShell title="Connexion" subtitle="Acces cuverie, lots, transferts et tracabilite.">
      <form
        className="grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const supabase = getSupabase();
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          setMessage(error ? error.message : "Connexion reussie.");
        }}
      >
        <Field label="Email">
          <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </Field>
        <Field label="Mot de passe">
          <input className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </Field>
        {message && <p className="text-sm text-[var(--mid)]">{message}</p>}
        <Button icon={<FiLogIn size={16} />} type="submit">
          Se connecter
        </Button>
        <div className="flex justify-between text-xs text-[var(--mid)]">
          <Link href="/register">Creer un compte</Link>
          <Link href="/reset">Mot de passe oublie</Link>
        </div>
      </form>
    </AuthShell>
  );
};
