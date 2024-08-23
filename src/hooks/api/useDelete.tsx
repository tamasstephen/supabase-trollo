import { useState } from "react";
import { useAuthContext } from "../useAuthContext";
import { TableNames } from "@/constants";

export const useDelete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { supabaseClient } = useAuthContext();

  const deleteItem = async (itemId: number, tableName: TableNames) => {
    if (!supabaseClient) {
      setError(true);
      return;
    }
    setLoading(true);

    const response = await supabaseClient
      .from(tableName)
      .delete()
      .eq("id", itemId);

    if (response.error) {
      setError(true);
    }
    setLoading(false);
  };

  return { error, loading, deleteItem };
};
