import { BoardPrefixes } from "@/constants";

export const sanitizeDraggableId = (
  containerId: string,
  prefix?: BoardPrefixes
) => parseInt(containerId.replace(prefix ? prefix : BoardPrefixes.COLUMN, ""));
