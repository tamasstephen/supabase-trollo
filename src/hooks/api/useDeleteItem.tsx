import { useAuthContext } from "../useAuthContext";
import { TableNames } from "@/constants";
import { BoardColumnType } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteArgs {
  itemId: number;
  tableName: TableNames;
}

export const useDeleteItem = (id?: number | undefined) => {
  const { supabaseClient } = useAuthContext();
  const queryClient = useQueryClient();

  const deleteItem = async ({ itemId, tableName }: DeleteArgs) => {
    if (!supabaseClient) {
      throw new Error("client is not available");
    }

    const response = await supabaseClient
      .from(tableName)
      .delete()
      .eq("id", itemId);

    if (response.error) {
      throw new Error(response.error.message);
    }
  };

  return useMutation({
    mutationFn: (args: DeleteArgs) => {
      return deleteItem(args);
    },
    onSuccess: async (_, variables) => {
      if (variables.tableName === TableNames.BOARD) {
        queryClient.invalidateQueries({ queryKey: ["board"] });
      } else if (variables.tableName === TableNames.TASK && id) {
        queryClient.invalidateQueries({ queryKey: [`board_columns/${id}`] });
        queryClient.invalidateQueries({ queryKey: [`tasks/${id}`] });
      } else if (variables.tableName === TableNames.COLUMN && id) {
        queryClient.setQueriesData(
          { queryKey: [`board_columns/${id}`] },
          (oldData: BoardColumnType[] | undefined) => {
            if (!oldData) return;
            const oldCopy = structuredClone(oldData);
            const result = oldCopy.filter(
              (container) => container.id !== variables.itemId
            );
            return result;
          }
        );
      }
    },
  });
};
