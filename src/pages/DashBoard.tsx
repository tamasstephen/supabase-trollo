import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";

interface Board {
  background: string | null;
  name: string;
}

export const Dashboard = () => {
  const { supabaseClient } = useAuthContext();
  const [boards, setBoards] = useState<Board[]>([]);
  const [fetchError, setFetchError] = useState(false);

  const saveTable = async () => {
    const response = await supabaseClient
      ?.from("boards")
      .insert({ name: "whatever" });
    console.log("response", response);
  };

  const fetchBoards = async () => {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.from("boards").select();
      if (error) {
        setFetchError(true);
        return;
      }
      const boards = data as Board[];
      setBoards(boards);
    }
  };

  useEffect(() => {
    fetchBoards();
  });

  if (fetchError) {
    return <div>An error has occured during the board loading...</div>;
  }

  return (
    <div>
      <button onClick={saveTable}>Save Table</button>
      Dashboard
    </div>
  );
};
