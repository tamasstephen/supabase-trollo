import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useAuthContext } from "../hooks";
import styles from "../styles/Login.module.scss";

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
  const { supabaseClient: supabase } = useAuthContext();
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
  return <></>;
};
