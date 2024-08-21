import { useState } from "react";
import { useAuthContext } from "../useAuthContext";
import { UpdateColumnProps } from "@/types";

export const useUpdateBoardColumn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { supabaseClient } = useAuthContext();

  const updateBoardColumn = async (payload: UpdateColumnProps) => {
    if (!supabaseClient) {
      setError(true);
      return;
    }
    setLoading(true);
    const { id, ...shallowPayload } = payload;
    const { error: updateError } = await supabaseClient
      .from("board_column")
      .update(shallowPayload)
      .eq("id", id);
    if (updateError) {
      setError(true);
    }
    setLoading(false);
  };

  return { error, loading, updateBoardColumn };
};
