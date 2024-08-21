import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useAuthContext } from "../useAuthContext";
import { BoardType } from "@/types";
import { BoardPrefixes } from "@/constants/constants";

export const useFetchBoardColumns = (
  boardId: number,
  setBoardColumns: Dispatch<SetStateAction<BoardType[]>>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { supabaseClient } = useAuthContext();

  const fetchBoardColumns = useCallback(async () => {
    if (!supabaseClient) return;
    setLoading(true);
    const { data, error } = await supabaseClient
      .from("board_column")
      .select()
      .eq("board_id", boardId);
    if (error) {
      setError(true);
      return;
    }
    const columns = data as BoardType[];
    const idPrefixedColumns = columns
      .map((column) => {
        column.id = `${BoardPrefixes.COLUMN}${column.id}`;
        column.items = [];
        return column;
      })
      .sort((a, b) => a.index - b.index);
    setBoardColumns(idPrefixedColumns);
    setLoading(false);
  }, [supabaseClient, setLoading, setError, boardId, setBoardColumns]);

  useEffect(() => {
    if (!supabaseClient) return;
    fetchBoardColumns();
  }, [supabaseClient, fetchBoardColumns]);

  return { error, loading };
};
