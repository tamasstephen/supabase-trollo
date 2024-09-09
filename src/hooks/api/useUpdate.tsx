import { useAuthContext } from "../useAuthContext";
import { UpdateBoardItemsArgs } from "@/types/Board";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdate = (id?: number | undefined) => {
  const { supabaseClient } = useAuthContext();
  const queryClient = useQueryClient();

  const updateItem = async ({ payload, tableName }: UpdateBoardItemsArgs) => {
    if (!supabaseClient) {
      throw new Error("client is not available");
    }
    const { id, ...shallowPayload } = payload;
    const { error: updateError } = await supabaseClient
      .from(tableName)
      .update(shallowPayload)
      .eq("id", id);
    if (updateError) {
      throw new Error(updateError.message);
    }
  };

  return useMutation({
    mutationFn: (args: UpdateBoardItemsArgs) => updateItem(args),
    onSuccess: async (_, variables) => {
      if (
        variables.tableName === "board_column" ||
        (variables.tableName === "task" && id)
      ) {
        await queryClient.invalidateQueries({
          queryKey: [`board_columns/${id}`],
        });
        await queryClient.invalidateQueries({ queryKey: [`tasks/${id}`] });
      }
    },
  });
};
