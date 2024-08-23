import { useState } from "react";
import { useAuthContext } from "../useAuthContext";
import { UpdateColumnProps } from "@/types";
import { UpdateTaskProps } from "@/types/Board";
import { TableNames } from "@/constants/constants";

export const useUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { supabaseClient } = useAuthContext();

  const updateItem = async (
    payload: UpdateColumnProps | UpdateTaskProps,
    tableName: TableNames
  ) => {
    if (!supabaseClient) {
      setError(true);
      return;
    }
    setLoading(true);
    const { id, ...shallowPayload } = payload;
    const { error: updateError } = await supabaseClient
      .from(tableName)
      .update(shallowPayload)
      .eq("id", id);
    if (updateError) {
      setError(true);
    }
    setLoading(false);
  };

  return { error, loading, updateItem };
};
