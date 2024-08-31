import { BoardContainer, BoardListCard } from "@/components";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { handleDragEnd, handleDragStart } from "../../handlers";
import {
  DraggableBoardContainer,
  UpdateColumnProps,
  UpdateTaskProps,
} from "@/types";
import { Dispatch, SetStateAction } from "react";
import styles from "@/styles/Board.module.scss";
import { TableNames } from "@/constants";
import { TaskFormElement } from "@/types/FormTypes";
import { DraggableTask } from "@/types/Board";

interface ContainerListProps {
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

export const ContainerList = ({
  boardColumns,
  setBoardColumn,
  setActiveId,
  updateItem,
  addNewTask,
  deleteBoardContainer,
  deleteTask,
  activeId,
  activeContainer,
  activeCard,
}: ContainerListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={(e) =>
        handleDragEnd(e, boardColumns, setBoardColumn, setActiveId, updateItem)
      }
      onDragStart={(e) => handleDragStart(e, setActiveId)}
    >
      <SortableContext items={boardColumns.map((i) => i.id)}>
        {boardColumns.map((container) => (
          <BoardContainer
            id={container.id}
            title={container.title}
            key={container.id}
            callback={addNewTask}
            onDelete={() => deleteBoardContainer(container.id)}
            description=""
          >
            <SortableContext
              id={container.id}
              items={container.items.map((i) => i.id)}
            >
              <div className={styles.listcard}>
                {container.items.map((i) => (
                  <BoardListCard
                    title={i.title}
                    id={i.id}
                    key={i.id}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </SortableContext>
          </BoardContainer>
        ))}
      </SortableContext>
      <DragOverlay adjustScale={false}>
        {/* Drag Overlay For item Item */}
        {activeId && activeId.toString().includes("card") && (
          <BoardListCard
            id={activeId}
            title={activeCard?.title || ""}
            onDelete={deleteTask}
          />
        )}
        {/* Drag Overlay For Container */}
        {activeId && activeId.toString().includes("container") && (
          <BoardContainer
            id={activeId}
            title={activeContainer?.title || ""}
            callback={addNewTask}
            onDelete={() => {}}
          >
            <div className={styles.listcard}>
              {activeContainer?.items.map((i) => (
                <BoardListCard
                  key={i.id}
                  title={i.title}
                  id={i.id}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </BoardContainer>
        )}
      </DragOverlay>
    </DndContext>
  );
};
