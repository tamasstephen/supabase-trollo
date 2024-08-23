import { BoardPayload } from "@/types";
import { useState } from "react";
import { useAuthContext } from "../useAuthContext";
import { TaskPayload } from "@/types/Board";

interface BoardColumnPayload {
  title: string;
  index: number;
  board_id: number;
}

type UseSavePayload = BoardColumnPayload | BoardPayload | TaskPayload;

export const useSave = <T extends object>(): {
  saveToDb: (
    payload: UseSavePayload,
    tabeName: string
  ) => Promise<T | undefined>;
  error: boolean;
  loading: boolean;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { supabaseClient } = useAuthContext();

  const saveToDb = async (payload: UseSavePayload, tableName: string) => {
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
