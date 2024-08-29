import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useAuthContext } from "../useAuthContext";
import { DraggableBoardContainer } from "@/types";
import { BoardPrefixes } from "@/constants/constants";
import { BoardColumnType, DraggableTask } from "@/types/Board";
import { SupabaseClient } from "@supabase/supabase-js";

export const useFetchBoardColumns = (
  boardId: number,
  setBoardColumns: Dispatch<SetStateAction<DraggableBoardContainer[]>>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { supabaseClient } = useAuthContext();

  const fetchTasks = useCallback(
    async (id: number, supabaseClient: SupabaseClient) => {
      const { data, error } = await supabaseClient
        .from("task")
        .select()
        .eq("board_id", id);
      if (error) {
        setError(true);
      }
      return data;
    },
    []
  );

  const fetchBoardColumns = useCallback(async () => {
    if (!supabaseClient) {
      setError(true);
      return;
    }
    setLoading(true);
    const { data, error } = await supabaseClient
      .from("board_column")
      .select()
      .eq("board_id", boardId);
    if (error) {
      setError(true);
      return;
    }
    const columns = data as BoardColumnType[];
    for (const column of columns) {
      const columnTasks = await fetchTasks(column.id, supabaseClient);
      if (columnTasks) {
        const tasks = columnTasks as unknown as DraggableTask[];
        column.items = tasks.map((task) => {
          task.id = `${BoardPrefixes.ITEM}${task.id}`;
          return task;
        });
      } else {
        column.items = [];
      }
    }
    const draggableColumns = columns as unknown as DraggableBoardContainer[];
    const idPrefixedColumns = draggableColumns
      .map((column) => {
        column.id = `${BoardPrefixes.COLUMN}${column.id}`;
        return column;
      })
      .sort((a, b) => a.index - b.index);
    setBoardColumns(idPrefixedColumns);
    setLoading(false);
  }, [
    supabaseClient,
    setLoading,
    setError,
    boardId,
    setBoardColumns,
    fetchTasks,
  ]);

  useEffect(() => {
    fetchBoardColumns();
  }, [fetchBoardColumns]);

  return { error, loading };
};
