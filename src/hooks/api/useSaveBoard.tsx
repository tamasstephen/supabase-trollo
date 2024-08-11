import { useAuthContext } from "..";
import { Board, BoardsFormElement } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";

type Payload = Omit<Board, "image" | "id">;

export const useSaveBoard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { supabaseClient } = useAuthContext();

  const saveBoardBackGround = async (
    boardCover: File,
    supabaseClient: SupabaseClient,
    payload: Payload
  ) => {
    const { data, error } = await supabaseClient.storage
      .from("board_cover")
      .upload(`board_cover/${boardCover.name}`, boardCover, {
        cacheControl: "3600",
        upsert: false,
      });
    if (error) {
      setError(true);
      return;
    }
    payload.background = data.path;
  };

  const saveBoardData = async (
    payload: Payload,
    supabaseClient: SupabaseClient
  ) => {
    const response = await supabaseClient.from("boards").insert(payload);
    if (!response || response.error) {
      setError(true);
      return;
    }
  };

  const saveBoard = async (event: React.FormEvent<BoardsFormElement>) => {
    if (!supabaseClient) {
      setError(true);
      return;
    }
    event.preventDefault();
    setLoading(true);
    const payload: Payload = { name: "" };
    payload.name = event.currentTarget.elements.boardName.value;
    if (event.currentTarget.elements.boardCover.files?.length) {
      const boardCover = event.currentTarget.elements.boardCover.files[0];
      await saveBoardBackGround(boardCover, supabaseClient, payload);
    }
    await saveBoardData(payload, supabaseClient);
    setLoading(false);
  };

  return { loading, error, saveBoard };
};
