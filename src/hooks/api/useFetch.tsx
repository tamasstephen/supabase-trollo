import { TableNames } from "@/constants";
import { DbObject } from "@/types/Board";
import { useCallback } from "react";
import { useAuthContext } from "../useAuthContext";
import { useQuery } from "@tanstack/react-query";
import { TrolloQueryKey } from "@/types";

export const useFetch = <T extends DbObject>(
  queryKey: TrolloQueryKey,
  tableName: TableNames,
  enableQueryFilter: boolean,
  currentQueryParams?: { filterBy: string; value: string | number }
) => {
  const { supabaseClient } = useAuthContext();
  const fetchData = useCallback(
    async (
      tableNameParam: TableNames,
      enableQuery: boolean = false,
      queryParams?: { filterBy: string; value: string | number }
    ) => {
      if (!supabaseClient) {
        throw new Error("client is not availbale");
      }
      let query = supabaseClient.from(tableNameParam).select();
      if (enableQuery && queryParams) {
        query = query.eq(queryParams.filterBy, queryParams.value);
      }
      const { data, error } = await query;
      if (error) {
        throw new Error(error.message);
      }
      return data as T[];
    },
    [supabaseClient]
  );

  const query = useQuery({
    queryKey: [queryKey, enableQueryFilter, tableName, currentQueryParams],
    queryFn: () => fetchData(tableName, enableQueryFilter, currentQueryParams),
  });

  return query;
};
