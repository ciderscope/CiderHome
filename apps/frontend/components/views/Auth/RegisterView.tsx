"use client";

import Link from "next/link";
import { useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import { getSupabase } from "../../../lib/supabase";
import { Button } from "../../ui/Button";
import { Field, inputClass } from "../../ui/ViewPrimitives";
import { AuthShell } from "./AuthShell";

export const RegisterView = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <AuthShell title="Creation de compte" subtitle="Les roles et sites sont ajustes ensuite par un administrateur.">
      <form
        className="grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const supabase = getSupabase();
          const { error } = await supabase.auth.signUp({ email, password });
          setMessage(error ? error.message : "Compte cree. Verifiez votre email si la confirmation est activee.");
        }}
      >
        <Field label="Email">
          <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </Field>
        <Field label="Mot de passe">
          <input className={inputClass} type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </Field>
        {message && <p className="text-sm text-[var(--mid)]">{message}</p>}
        <Button icon={<FiUserPlus size={16} />} type="submit">
          Creer le compte
        </Button>
        <Link className="text-xs text-[var(--mid)]" href="/login">
          J ai deja un compte
        </Link>
      </form>
    </AuthShell>
  );
};
