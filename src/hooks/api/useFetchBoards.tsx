import { Board } from "../../types/Board";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/hooks";

export const useFetchBoards = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<Board[] | null>(null);
  const { supabaseClient } = useAuthContext();

  const fetchBoards = useCallback(async () => {
    if (supabaseClient) {
      setLoading(true);
      const { data, error } = await supabaseClient.from("boards").select();
      if (error) {
        setError(true);
        return;
      }

      const boards = data as Board[];

      for (const board of boards) {
        if (board.background) {
          const { data } = await supabaseClient.storage
            .from("board_cover")
            .download(board.background);
          const imageUrl = data ? URL.createObjectURL(data) : "";
          if (imageUrl) {
            board.imageUrl = imageUrl;
          }
        }
      }
      setData(boards);
      setLoading(false);
    }
  }, [supabaseClient]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return { data, loading, error };
};
