import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  UniqueIdentifier,
  DragOverlay,
} from "@dnd-kit/core";
import styles from "@/styles/Board.module.scss";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { handleDragEnd, handleDragStart } from "./handlers";
import {
  AddBoardItem,
  BoardListCard,
  Portal,
  BoardContainer,
  AddBoardColumn,
  Error,
  Loading,
} from "@/components";
import {
  BoardColumnFormElement,
  DraggableBoardContainer,
  BoardColumnType,
  Task,
} from "@/types";
import { useParams } from "react-router-dom";
import {
  useFetchBoardColumns,
  useUpdate,
  useSave,
  useDeleteBoardColumn,
} from "@/hooks";
import { BoardPrefixes, TableNames } from "@/constants";
import {
  findActiveBoardListCard,
  sanitizeDraggableId,
  findActiveContainers,
  updateContainerTasks,
} from "./helpers";
import { useDelete } from "@/hooks/api/useDelete";
import { useFetchBoard } from "@/hooks/api/useFetchBoard";

enum BoardModalContent {
  EMPTY,
  COLUMN,
  ITEM,
}

export const Board = () => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardModalContent, setBoardModalContent] = useState(
    BoardModalContent.EMPTY
  );
  const [saveItemContainer, setSaveItemContainer] = useState<string | null>(
    null
  );
  const { id } = useParams();
  const [boardColumns, setBoardColumn] = useState<DraggableBoardContainer[]>(
    []
  );
  const {
    error: boardError,
    loading: boardLoading,
    data: boardData,
  } = useFetchBoard(id);
  const { error, loading } = useFetchBoardColumns(
    parseInt(id as string),
    setBoardColumn
  );
  const { error: updateError, updateItem } = useUpdate();

  const { error: deleteColumnError, deleteBoardColumn } =
    useDeleteBoardColumn();
  const { error: deleteError, deleteItem } = useDelete();

  const { error: saveError, saveToDb } = useSave();
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

  const hasToShowError = error || saveError;
  updateError || deleteColumnError || deleteError || boardError;

  const activeContainer = findActiveContainers(
    activeId as string,
    boardColumns
  );
  const activeCard = findActiveBoardListCard(activeId as string, boardColumns);

  const addNewTask = async (
    e: React.FormEvent<BoardColumnFormElement>,
    columnId: UniqueIdentifier | null
  ) => {
    e.preventDefault();
    if (!columnId) {
      return;
    }
    const boardTitle = e.currentTarget.elements.boardColumnTitle.value;
    const columnToEdit = boardColumns.find((col) => col.id === columnId);
    if (!columnToEdit) return;
    const task = await saveToDb<Task>(
      {
        index: columnToEdit.items.length,
        title: boardTitle,
        board_id: sanitizeDraggableId(columnId as string),
      },
      TableNames.TASK
    );
    if (!task) return;
    const newId = `${BoardPrefixes.ITEM}${task.id}`;
    columnToEdit.items.push({ ...task, id: newId });

    setBoardColumn((prevColumns) => {
      const newColumns = prevColumns.map((column) => {
        if (column.id === columnId) {
          column.items = columnToEdit.items;
        }
        return column;
      });
      return newColumns;
    });
  };

  const addBoardColumn = async (e: React.FormEvent<BoardColumnFormElement>) => {
    e.preventDefault();
    const boardTitle = e.currentTarget.elements.boardColumnTitle.value;
    //TODO: implement form check
    if (!boardTitle) return;

    const newColumn = await saveToDb<BoardColumnType>(
      {
        board_id: parseInt(id as string),
        title: boardTitle,
        index: boardColumns.length,
      },
      TableNames.COLUMN
    );

    if (!newColumn) {
      return;
    }

    setBoardColumn([
      ...boardColumns,
      {
        id: `${newColumn.id}-container`,
        title: newColumn.title,
        items: [],
        index: boardColumns.length + 1,
      },
    ]);
  };

  const deleteTask = (taskId: string) => {
    const columnToUpdate = boardColumns.find((column) =>
      column.items.find((item) => item.id === taskId)
    );
    if (!columnToUpdate) {
      return;
    }
    deleteItem(
      sanitizeDraggableId(taskId, BoardPrefixes.ITEM),
      TableNames.TASK
    );
    setBoardColumn((prevColumns) => {
      const newColumns = prevColumns.map((column) => {
        if (column.id === columnToUpdate.id) {
          column.items = column.items.filter((item) => item.id !== taskId);
          updateContainerTasks(column, updateItem);
        }
        return column;
      });
      return newColumns;
    });
  };

  const deleteBoardContainer = async (containerId: string) => {
    await deleteBoardColumn(
      sanitizeDraggableId(containerId),
      boardColumns
        .find((column) => column.id === containerId)
        ?.items.map((item) => sanitizeDraggableId(item.id, BoardPrefixes.ITEM))
    );
    setBoardColumn((prevColumns) => {
      const newColumns = prevColumns
        .filter((currentContainer) => containerId !== currentContainer.id)
        .map((container, idx) => {
          container.index = idx;
          return container;
        });
      newColumns.forEach((column) =>
        updateItem(
          {
            id: sanitizeDraggableId(column.id),
            index: column.index,
          },
          TableNames.COLUMN
        )
      );
      return newColumns;
    });
  };

  if (hasToShowError) {
    return <Error />;
  }

  if (loading || boardLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className={styles.header}>
        <h2>{boardData?.title}</h2>
        <button
          className={styles.addList}
          onClick={() => {
            setBoardModalContent(BoardModalContent.COLUMN);
            setIsModalOpen(true);
          }}
        >
          Add list
        </button>
      </div>
      <div className={styles.container}>
        {isModalOpen && (
          <Portal
            closeModal={() => {
              setBoardModalContent(BoardModalContent.EMPTY);
              setIsModalOpen(false);
            }}
          >
            {boardModalContent === BoardModalContent.COLUMN && (
              <AddBoardColumn callback={addBoardColumn} />
            )}
            {boardModalContent === BoardModalContent.ITEM && (
              <AddBoardItem
                callback={addNewTask}
                containerId={saveItemContainer}
              />
            )}
          </Portal>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={(e) =>
            handleDragEnd(
              e,
              boardColumns,
              setBoardColumn,
              setActiveId,
              updateItem
            )
          }
          onDragStart={(e) => handleDragStart(e, setActiveId)}
        >
          <SortableContext items={boardColumns.map((i) => i.id)}>
            {boardColumns.map((container) => (
              <BoardContainer
                id={container.id}
                title={container.title}
                key={container.id}
                onAddItem={() => {
                  setBoardModalContent(BoardModalContent.ITEM);
                  setIsModalOpen(true);
                  setSaveItemContainer(container.id);
                }}
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
                onAddItem={() => {
                  setBoardModalContent(BoardModalContent.ITEM);
                  setIsModalOpen(true);
                }}
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
      </div>
    </div>
  );
};
