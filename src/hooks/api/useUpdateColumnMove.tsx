import {
  BoardColumnType,
  ColumnMovePayload,
  DraggableBoardContainer,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../useAuthContext";
import { BoardPrefixes } from "@/constants";

export const useUpdateColumnMove = (boardId: number) => {
  const { supabaseClient } = useAuthContext();
  const queryClient = useQueryClient();

  const updateColumns = async ({ payload, tableName }: ColumnMovePayload) => {
    if (!supabaseClient) {
      throw new Error("client is not available");
    }
    await Promise.all(
      payload.map(async (currentPayload) => {
        const { id, index, title, ...rest } = currentPayload;

        const { error: updateError } = await supabaseClient
          .from(tableName)
          .update({ index, title })
          .eq("id", id)
          .select();

        if (updateError) {
          throw new Error(updateError.message);
        }
      })
    );
  };

  return useMutation({
    mutationFn: (args: ColumnMovePayload) => updateColumns(args),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [`board_columns/${boardId}`],
      });
      await queryClient.setQueryData([`tasks/${boardId}`], () => {
        const newData = variables.payload.map((container) => {
          const newContainer = {
            ...container,
            id: `${BoardPrefixes.COLUMN}${container.id}`,
          } as DraggableBoardContainer;
          return newContainer;
        });
        return newData;
      });
    },
  });
};
