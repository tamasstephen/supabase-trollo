import { useAuthContext } from "../useAuthContext";
import { TableNames } from "@/constants";
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
    mutationFn: (args: DeleteArgs) => deleteItem(args),
    onSuccess: (_, variables) => {
      if (variables.tableName === TableNames.BOARD) {
        queryClient.invalidateQueries({ queryKey: ["board"] });
      }
      if (
        (variables.tableName === TableNames.COLUMN ||
          variables.tableName === TableNames.TASK) &&
        id
      ) {
        queryClient.invalidateQueries({ queryKey: [`board_columns/${id}`] });
        queryClient.invalidateQueries({ queryKey: [`tasks/${id}`] });
      }
    },
  });
};
