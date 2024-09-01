import { Board } from "../../types/Board";
import { useCallback, useEffect, useState } from "react";
import { useFetch } from "./useFetch";
import { TableNames } from "@/constants";

export const useFetchBoards = () => {
  const { error, loading, supabaseClient, fetchData } = useFetch();
  const [data, setData] = useState<Board[] | null>(null);

  const fetchBoards = useCallback(async () => {
    if (supabaseClient) {
      const boards = await fetchData<Board>(TableNames.BOARD);
      if (!boards) return;
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
    }
  }, [supabaseClient, fetchData]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return { data, loading, error };
};
