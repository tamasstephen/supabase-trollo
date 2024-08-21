import { SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";

export const useDeleteBoardColumn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const deleteBoardColumn = async (
    boardId: number,
    supabaseClient: SupabaseClient
  ) => {
    if (!supabaseClient) {
      setError(true);
    }

    setLoading(true);

    const response = await supabaseClient
      .from("board_column")
      .delete()
      .eq("id", boardId);

    if (response.error) {
      setError(true);
    }
    setLoading(false);
  };

  return { error, loading, deleteBoardColumn };
};
