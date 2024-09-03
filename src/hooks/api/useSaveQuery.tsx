import { TrolloQueryKey, DbObject, SavePayload } from "@/types";
import { useState } from "react";
import { useAuthContext } from "../useAuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TableNames } from "@/constants";

interface SaveQueryProps {
  payload: SavePayload;
  tableName: TableNames;
}

export const useSaveQuery = (boardId: number | undefined) => {
  const queryClient = useQueryClient();
  const { supabaseClient } = useAuthContext();
  const [key, setKey] = useState<TrolloQueryKey>();

  const saveToDb = async <T extends DbObject>({
    payload,
    tableName,
  }: SaveQueryProps) => {
    if (!supabaseClient || !boardId) {
      throw new Error("client is not available");
    }

    const queryKeyMap: Record<Partial<TableNames>, TrolloQueryKey> = {
      task: `tasks/${boardId}`,
      boards: "board",
      board_column: `board_columns/${boardId}`,
    };

    setKey(queryKeyMap[tableName]);
    const response = await supabaseClient
      .from(tableName)
      .insert(payload)
      .select();
    if (!response || response.error) {
      throw new Error(response.error.message);
    }
    return response.data[0] as T;
  };

  return useMutation({
    mutationFn: (payload: SaveQueryProps) => {
      return saveToDb(payload);
    },
    onSuccess: async () => {
      if (key?.split("/")[0] === "board_columns" && boardId) {
        await queryClient.invalidateQueries({
          queryKey: [`board_columns/${boardId}`],
          refetchType: "active",
        });
        await queryClient.refetchQueries({
          queryKey: [`board_columns/${boardId}`],
        });
        await queryClient.invalidateQueries({
          queryKey: [`tasks/${boardId}`],
          refetchType: "active",
        });
      } else if (key?.split("/")[0] === "tasks" && boardId) {
        await queryClient.invalidateQueries({
          queryKey: [`tasks/${boardId}`],
          refetchType: "active",
        });
        queryClient.refetchQueries({
          queryKey: [`tasks/${boardId}`],
        });
      }
    },
  });
};
