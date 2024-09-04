import { ColumnMovePayload } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../useAuthContext";

export const useUpdateColumnMove = (boardId: number) => {
  const { supabaseClient } = useAuthContext();
  const queryClient = useQueryClient();

  const updateColumns = async ({ payload, tableName }: ColumnMovePayload) => {
    if (!supabaseClient) {
      throw new Error("client is not available");
    }
    await Promise.all(
      payload.map(async (currentPayload) => {
        const { id, ...shallowPayload } = currentPayload;

        const { error: updateError } = await supabaseClient
          .from(tableName)
          .update(shallowPayload)
          .eq("id", id);
        if (updateError) {
          throw new Error(updateError.message);
        }
      })
    );
  };

  return useMutation({
    mutationFn: (args: ColumnMovePayload) => updateColumns(args),
    onSuccess: async (_, variables) => {
      queryClient.setQueryData([`tasks/${boardId}`], () => variables);
    },
  });
};
