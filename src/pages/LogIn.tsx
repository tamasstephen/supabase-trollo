import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useAuthContext } from "@/hooks";
import styles from "@/styles/Login.module.scss";
import { Navigate } from "react-router-dom";

const updatedTheme = {
  theme: ThemeSupa,
  variables: {
    default: {
      colors: {
        brand: "#0079bf",
        brandAccent: "#1138cc",
      },
    },
  },
};

export const Login = () => {
  const { supabaseClient: supabase, isSignedIn } = useAuthContext();

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (supabase) {
    return (
      <div className={styles.wrapper}>
        <h1>Sign in to Trollo</h1>
        <Auth
          supabaseClient={supabase}
          appearance={updatedTheme}
          providers={[]}
        />
      </div>
    );
  }
  return <p>An error has occured</p>;
};
