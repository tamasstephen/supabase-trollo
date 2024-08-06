import "./index.css";

import { useAuthContext } from "./hooks/useAuthContext";

function App() {
  const { setToSignedOut, supabaseClient: supabase } = useAuthContext();

  const logout = () => {
    supabase?.auth.signOut();
    setToSignedOut();
  };

  return (
    <div>
      <div>Logged in!</div>
      <button onClick={logout}>logout</button>
    </div>
  );
}

export default App;
