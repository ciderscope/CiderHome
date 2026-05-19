"use client";

import Link from "next/link";
import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { getSupabase } from "../../../lib/supabase";
import { Button } from "../../ui/Button";
import { Field, inputClass } from "../../ui/ViewPrimitives";
import { AuthShell } from "./AuthShell";

export const ResetView = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <AuthShell title="Reinitialisation" subtitle="Un lien de changement de mot de passe sera envoye.">
      <form
        className="grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const supabase = getSupabase();
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          setMessage(error ? error.message : "Email de reinitialisation envoye.");
        }}
      >
        <Field label="Email">
          <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </Field>
        {message && <p className="text-sm text-[var(--mid)]">{message}</p>}
        <Button icon={<FiSend size={16} />} type="submit">
          Envoyer
        </Button>
        <Link className="text-xs text-[var(--mid)]" href="/login">
          Retour connexion
        </Link>
      </form>
    </AuthShell>
  );
};
