import { Task, TaskPayload } from "@/types";
import { useSave } from "./useSave";

export const useSaveTask = () => {
  const { error, loading, saveToDb } = useSave<Task>();

  const saveTask = async (payload: TaskPayload) => {
    const response = await saveToDb(payload, "task");
    return response;
  };
  return { error, loading, saveTask };
};
