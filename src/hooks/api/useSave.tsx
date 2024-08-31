import { BoardPayload } from "@/types";
import { useState } from "react";
import { useAuthContext } from "../useAuthContext";
import { DbObject, TaskPayload } from "@/types/Board";

interface BoardColumnPayload {
  title: string;
  index: number;
  board_id: number;
}

export type SavePayload = BoardColumnPayload | BoardPayload | TaskPayload;

export const useSave = (): {
  saveToDb: <T extends DbObject>(
    payload: SavePayload,
    tabeName: string
  ) => Promise<T | undefined>;
  error: boolean;
  loading: boolean;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { supabaseClient } = useAuthContext();

  const saveToDb = async <T extends DbObject>(
    payload: SavePayload,
    tableName: string
  ) => {
    if (!supabaseClient) {
      setError(true);
      return;
    }
    const response = await supabaseClient
      .from(tableName)
      .insert(payload)
      .select();
    if (!response || response.error) {
      setError(true);
      return;
    }
    setLoading(false);
    return response.data[0] as T;
  };

  return { saveToDb, error, loading };
};
