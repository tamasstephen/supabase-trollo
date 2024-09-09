import {
  TrolloQueryKey,
  DbObject,
  DraggableBoardContainer,
  SaveQueryProps,
  BoardColumnType,
} from "@/types";
import { useRef, useState } from "react";
import { useAuthContext } from "../useAuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BoardPrefixes, TableNames } from "@/constants";
import { reArrangeTaskColumns } from "@/utils";

export const useSaveQuery = (boardId: number | undefined) => {
  const queryClient = useQueryClient();
  const { supabaseClient } = useAuthContext();
  const [key, setKey] = useState<TrolloQueryKey>();
  const newItemId = useRef(-1);

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
    newItemId.current = response.data[0].id;
    return response.data[0] as T;
  };

  return useMutation({
    mutationFn: (payload: SaveQueryProps) => {
      return saveToDb(payload);
    },
    onSuccess: async (_, variables) => {
      if (key?.split("/")[0] === "board_columns" && boardId) {
        queryClient.setQueriesData(
          { queryKey: [`board_columns/${boardId}`] },
          (oldData: BoardColumnType[] | undefined) => {
            if (!oldData || !("index" in variables.payload)) return;
            const oldCopy = structuredClone(oldData);
            oldCopy.push({
              ...variables.payload,
              id: newItemId.current,
              index: variables.payload.index,
            });
            return oldCopy;
          }
        );
        queryClient.setQueryData(
          [`tasks/${boardId}`],
          (oldData: DraggableBoardContainer[]) => {
            if (!oldData || !("index" in variables.payload)) return oldData;
            const oldCopy = structuredClone(oldData);
            oldCopy.push({
              ...variables.payload,
              id: `${BoardPrefixes.COLUMN}${newItemId.current}`,
              index: variables.payload.index,
              items: [],
            });
            return oldCopy;
          }
        );
      } else if (key?.split("/")[0] === "tasks" && boardId) {
        await queryClient.setQueryData(
          [`tasks/${boardId}`],
          (oldData: DraggableBoardContainer[]) =>
            reArrangeTaskColumns(oldData, newItemId, variables)
        );
      }
    },
  });
};
