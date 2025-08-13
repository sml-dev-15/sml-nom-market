import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";

export function useSession() {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return session;
}
