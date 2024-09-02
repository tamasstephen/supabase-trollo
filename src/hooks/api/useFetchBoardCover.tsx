import { Board } from "@/types";
import { useAuthContext } from "../useAuthContext";
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

export const useFetchBoardCovers = (boards: Board[] | undefined) => {
  const { supabaseClient } = useAuthContext();

  const fetchBoards = useCallback(
    async (boards: Board[]) => {
      if (supabaseClient) {
        if (!boards) return;
        const result = structuredClone(boards);
        for (const board of result) {
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
        return result;
      } else {
        throw new Error("client is not available");
      }
    },
    [supabaseClient, boards]
  );

  const query = useQuery({
    queryKey: ["boardCovers", boards],
    queryFn: () => fetchBoards(boards || []),
  });
  return query;
};
