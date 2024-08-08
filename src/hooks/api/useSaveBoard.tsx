import { useAuthContext } from "..";
import { Board, BoardsFormElement } from "@/types";
import { useState } from "react";

export const useSaveBoard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { supabaseClient } = useAuthContext();

  const saveBoard = async (event: React.FormEvent<BoardsFormElement>) => {
    if (!supabaseClient) {
      setError(true);
      return;
    }
    event.preventDefault();
    const payload: Omit<Board, "image" | "id"> = { name: "" };
    payload.name = event.currentTarget.elements.boardName.value;
    if (event.currentTarget.elements.boardCover.files?.length) {
      setLoading(true);
      const boardCover = event.currentTarget.elements.boardCover.files[0];
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
    }
    const response = await supabaseClient.from("boards").insert(payload);
    if (!response || response.error) {
      setError(true);
      return;
    }
    setLoading(false);
  };

  return { loading, error, saveBoard };
};
