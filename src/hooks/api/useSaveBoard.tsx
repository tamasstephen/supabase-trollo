import { useAuthContext } from "..";
import { Board, BoardPayload, BoardInputTypes } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useSave } from "./useSave";

export const useSaveBoard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { supabaseClient } = useAuthContext();
  const { error: saveColumnError, saveToDb } = useSave();

  useEffect(() => {
    if (saveColumnError) {
      setError(saveColumnError);
    }
  }, [saveColumnError]);

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
        setError(true);
        return error;
      }
      payload.background = data.path;
    } catch {
      setError(true);
    }
  };

  const saveBoardData = async (payload: BoardPayload) => {
    const response = saveToDb<Board>(payload, "boards");
    return response;
  };

  const saveBoard = async ({ boardName, boardCover }: BoardInputTypes) => {
    if (!supabaseClient) {
      setError(true);
      return;
    }
    setLoading(true);
    const payload: BoardPayload = { title: "" };
    payload.title = boardName;
    if (boardCover && boardCover.length) {
      const coverImage = boardCover[0];
      const isError = await saveBoardBackGround(
        coverImage,
        supabaseClient,
        payload
      );
      if (isError) {
        setLoading(false);
        return;
      }
    }
    const res = await saveBoardData(payload);
    setLoading(false);
    return res;
  };

  return { loading, error, saveBoard };
};
