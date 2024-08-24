import { Board } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../useAuthContext";

export const useFetchBoard = (boardId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<Board | null>(null);
  const { supabaseClient } = useAuthContext();

  const fetchBoards = useCallback(async () => {
    if (supabaseClient) {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("boards")
        .select()
        .eq("id", boardId);
      if (error) {
        setError(true);
        return;
      }

      const board = data[0] as Board;

      setData(board);
      setLoading(false);
    }
  }, [supabaseClient, boardId]);

  useEffect(() => {
    if (boardId) {
      fetchBoards();
    }
  }, [fetchBoards, boardId]);

  return { loading, error, data };
};
