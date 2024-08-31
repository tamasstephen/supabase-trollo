import { Dispatch, SetStateAction } from "react";
import {
  DraggableBoardContainer,
  DraggableTask,
  UpdateColumnProps,
  UpdateTaskProps,
} from "./Board";
import { UniqueIdentifier } from "@dnd-kit/core";
import { TableNames } from "@/constants";
import { TaskFormElement } from "./FormTypes";

export interface ContainerListProps {
  boardColumns: DraggableBoardContainer[];
  setBoardColumn: Dispatch<SetStateAction<DraggableBoardContainer[]>>;
  setActiveId: Dispatch<SetStateAction<UniqueIdentifier | null>>;
  updateItem: (
    payload: UpdateColumnProps | UpdateTaskProps,
    tableName: TableNames
  ) => Promise<void>;
  addNewTask: (
    e: React.FormEvent<TaskFormElement>,
    columnId: UniqueIdentifier | null
  ) => Promise<void>;
  deleteBoardContainer: (containerId: string) => Promise<void>;
  deleteTask: (taskId: string) => void;
  activeId: UniqueIdentifier | null;
  activeContainer: DraggableBoardContainer | undefined;
  activeCard: DraggableTask | undefined;
}
