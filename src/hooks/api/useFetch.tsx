import { TableNames } from "@/constants";
import { DbObject } from "@/types/Board";
import { useCallback, useState } from "react";
import { useAuthContext } from "../useAuthContext";

export const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { supabaseClient } = useAuthContext();

  const fetchData = useCallback(
    async <T extends DbObject>(
      tableName: TableNames,
      enableQuery: boolean = false,
      queryParams?: { filterBy: string; value: string | number }
    ) => {
      if (!supabaseClient) {
        setError(true);
        return;
      }
      setLoading(true);
      let query = supabaseClient.from(tableName).select();
      if (enableQuery && queryParams) {
        query = query.eq(queryParams.filterBy, queryParams.value);
      }
      const { data, error } = await query;
      if (error) {
        setError(true);
        return;
      }
      setLoading(false);
      return data as T[];
    },
    [supabaseClient]
  );

  return { loading, error, supabaseClient, fetchData };
};
