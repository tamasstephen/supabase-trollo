import { BoardType } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";

interface BoardColumnPayload {
  title: string;
  index: number;
  board_id: number;
}

export const useSaveBoardColumn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const saveBoardColumn = async (
    payload: BoardColumnPayload,
    supabaseClient: SupabaseClient
  ) => {
    setLoading(true);
    const response = await supabaseClient
      .from("board_column")
      .insert(payload)
      .select();
    if (!response || response.error) {
      setError(true);
      return;
    }
    setLoading(false);
    return response.data[0] as Omit<BoardType, "items">;
  };

  return { loading, error, saveBoardColumn };
};
