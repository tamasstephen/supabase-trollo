import { Dispatch, SetStateAction } from "react";
import {
  DraggableBoardContainer,
  DraggableTask,
  UpdateBoardItemsArgs,
} from "./Board";
import { UniqueIdentifier } from "@dnd-kit/core";
import { TaskFormElement } from "./FormTypes";

export interface ContainerListProps {
  boardColumns: DraggableBoardContainer[];
  setBoardColumn: Dispatch<SetStateAction<DraggableBoardContainer[]>>;
  setActiveId: Dispatch<SetStateAction<UniqueIdentifier | null>>;
  updateItem: ({ payload, tableName }: UpdateBoardItemsArgs) => void;
  addNewTask: (
    e: React.FormEvent<TaskFormElement>,
    columnId: UniqueIdentifier
  ) => Promise<void>;
  deleteBoardContainer: (containerId: string) => Promise<void>;
  deleteTask: (taskId: string) => void;
  activeId: UniqueIdentifier | null;
  activeContainer: DraggableBoardContainer | undefined;
  activeCard: DraggableTask | undefined;
}
