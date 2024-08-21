import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks";
import { Session, Subscription } from "@supabase/supabase-js";
import styles from "../../styles/Navbar.module.scss";

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

  const handleSessionChange = (session: Session | null) => {
    if (session) {
      setToSignedIn();
    } else {
      setToSignedOut();
      navigate("/");
    }
  };

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        handleSessionChange(session);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        handleSessionChange(session);
        setDbSubscription(subscription);
      });
    }

    return () => dbSubscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, navigate, setToSignedIn, setToSignedOut]);

  return (
    <div>
      <div className={styles.navWrapper} data-testid="navbar">
        <div className={styles.navInnerWrapper}>
          <div
            role="link"
            aria-label="home link"
            className={styles.logo}
            onClick={() => navigate("/")}
          >
            Trollo
          </div>
          {isSignedIn && <button onClick={logout}>logout</button>}
        </div>
      </div>
      <Outlet />
    </div>
  );
};
