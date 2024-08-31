import { Board } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { useFetch } from "./useFetch";
import { TableNames } from "@/constants";

export const useFetchBoard = (boardId: string | undefined) => {
  const { error, loading, fetchData } = useFetch();
  const [data, setData] = useState<Board | null>(null);

  const fetchBoard = useCallback(async () => {
    if (!boardId) return;
    const data = await fetchData<Board>(TableNames.BOARD, true, {
      filterBy: "id",
      value: boardId,
    });
    if (!data) return;
    const board = data[0] as Board;
    setData(board);
  }, [boardId, fetchData]);

  useEffect(() => {
    if (boardId) {
      fetchBoard();
    }
  }, [fetchBoard, boardId]);

  return { loading, error, data };
};
