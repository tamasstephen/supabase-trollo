import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { Subscription } from "@supabase/supabase-js";

export const NavBar = () => {
  const {
    setToSignedIn,
    setToSignedOut,
    supabaseClient: supabase,
    isSignedIn,
  } = useAuthContext();
  const [dbSubscription, setDbSubscription] = useState<Subscription | null>();
  const navigate = useNavigate();

  const logout = () => {
    supabase?.auth.signOut();
    setToSignedOut();
  };

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setToSignedIn();
        } else {
          setToSignedOut();
        }
        navigate("/");
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setToSignedIn();
        } else {
          setToSignedOut();
        }
        navigate("/");
        setDbSubscription(subscription);
      });
    }

    return () => dbSubscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, navigate, setToSignedIn, setToSignedOut]);

  return (
    <div>
      <div>
        <div>Navbar</div>
        {isSignedIn && <button onClick={logout}>logout</button>}
      </div>
      <Outlet />
    </div>
  );
};
