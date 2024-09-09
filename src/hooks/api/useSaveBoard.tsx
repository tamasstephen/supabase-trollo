import { useAuthContext } from "..";
import { Board, BoardPayload, BoardInputTypes, SavePayload } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TableNames } from "@/constants";

export const useSaveBoard = () => {
  const queryClient = useQueryClient();
  const { supabaseClient } = useAuthContext();

  const saveBoardBackGround = async (
    boardCover: File,
    supabaseClient: SupabaseClient,
    payload: BoardPayload
  ) => {
    try {
      const { data, error } = await supabaseClient.storage
        .from("board_cover")
        .upload(`board_cover/${boardCover.name}`, boardCover, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) {
        throw new Error(error.message);
      }
      payload.background = data.path;
    } catch {
      throw new Error("Unable to save file");
    }
  };

  const saveToDb = async (
    payload: SavePayload,
    supabaseClient: SupabaseClient
  ) => {
    const response = await supabaseClient
      .from(TableNames.BOARD)
      .insert(payload)
      .select();
    return response;
  };

  const saveBoard = async ({ boardName, boardCover }: BoardInputTypes) => {
    if (!supabaseClient) {
      throw new Error("client is not available");
    }
    const payload: BoardPayload = { title: "" };
    payload.title = boardName;
    if (boardCover && boardCover.length) {
      const coverImage = boardCover[0];
      await saveBoardBackGround(coverImage, supabaseClient, payload);
    }
    const { data, error } = await saveToDb(payload, supabaseClient);
    if (error) {
      throw new Error(error.message);
    }
    return data[0] as Board;
  };

  return useMutation({
    mutationFn: (payload: BoardInputTypes) => saveBoard(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
};
