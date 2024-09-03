import { useEffect, useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import styles from "@/styles/Board.module.scss";
import { Portal, Error, Loading } from "@/components";
import {
  DraggableBoardContainer,
  BoardColumnType,
  UpdateBoardItemsArgs,
} from "@/types";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdate,
  useSaveQuery,
  useFetchTasksWithContainers,
  useFetch,
  useDeleteItem,
} from "@/hooks";
import { BoardPrefixes, TableNames } from "@/constants";
import {
  findActiveBoardListCard,
  findActiveContainers,
  updateContainerTasks,
} from "./helpers";
import { InputTypes, TaskFormElement } from "@/types/FormTypes";
import {
  BoardHeader,
  ContainerList,
  AddBoardColumn,
  DeleteBoard,
} from "./components";
import { Board as BoardType } from "@/types";
import { sanitizeDraggableId } from "@/utils";

enum ModalContent {
  ADD_LIST,
  DELETE_BOARD,
}

export const Board = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(ModalContent.ADD_LIST);
  const { id } = useParams();
  const boardId = parseInt(id as string);
  const [boardColumns, setBoardColumn] = useState<DraggableBoardContainer[]>(
    []
  );
  const {
    data: boardData,
    isPending: boardTitlePending,
    isError: isBoardTitleError,
  } = useFetch<BoardType>(
    `board/${parseInt(id as string)}`,
    TableNames.BOARD,
    true,
    {
      filterBy: "id",
      value: boardId,
    }
  );
  const {
    data: containers,
    isError: containerError,
    isPending: containerPending,
  } = useFetch<BoardColumnType>(
    `board_columns/${boardId}`,
    TableNames.COLUMN,
    true,
    {
      filterBy: "board_id",
      value: boardId,
    }
  );
  const {
    data: boardContainers,
    isError: taskError,
    isPending: taskPending,
  } = useFetchTasksWithContainers(boardId, containers);
  const deleteMutation = useDeleteItem(boardId);
  const saveMutation = useSaveQuery(boardId);
  const updateMutation = useUpdate(boardId);

  const hasToShowError =
    containerError ||
    taskError ||
    isBoardTitleError ||
    updateMutation.error ||
    deleteMutation.error ||
    saveMutation.error;

  const activeContainer = findActiveContainers(
    activeId as string,
    boardColumns
  );
  const activeCard = findActiveBoardListCard(activeId as string, boardColumns);

  const addNewTask = async (
    e: React.FormEvent<TaskFormElement>,
    columnId: UniqueIdentifier
  ) => {
    e.preventDefault();
    const boardTitle = e.currentTarget.elements.taskTitle.value;
    const columnToEdit = boardContainers?.find((col) => col.id === columnId);
    if (!columnToEdit) return;
    const realColumnId = sanitizeDraggableId(columnId as string);
    saveMutation.mutate({
      payload: {
        index: columnToEdit.items.length,
        title: boardTitle,
        board_id: realColumnId,
      },
      tableName: TableNames.TASK,
    });
  };

  const addBoardColumn = async (data: Pick<InputTypes, "boardColumnTitle">) => {
    const boardTitle = data.boardColumnTitle as string;
    saveMutation.mutate({
      payload: {
        board_id: parseInt(id as string),
        title: boardTitle,
        index: boardContainers?.length,
      },
      tableName: TableNames.COLUMN,
    });
  };

  const deleteTask = (taskId: string) => {
    const columnToUpdate = boardColumns.find((column) =>
      column.items.find((item) => item.id === taskId)
    );
    if (!columnToUpdate) {
      return;
    }
    deleteMutation.mutate({
      itemId: sanitizeDraggableId(taskId, BoardPrefixes.ITEM),
      tableName: TableNames.TASK,
    });
    setBoardColumn((prevColumns) => {
      const newColumns = prevColumns.map((column) => {
        if (column.id === columnToUpdate.id) {
          column.items = column.items.filter((item) => item.id !== taskId);
          updateContainerTasks(column, (args: UpdateBoardItemsArgs) =>
            updateMutation.mutate(args)
          );
        }
        return column;
      });
      return newColumns;
    });
  };

  const deleteBoardContainer = async (containerId: string) => {
    await deleteMutation.mutateAsync({
      itemId: sanitizeDraggableId(containerId),
      tableName: TableNames.COLUMN,
    });
    setBoardColumn((prevColumns) => {
      const newColumns = prevColumns
        .filter((currentContainer) => containerId !== currentContainer.id)
        .map((container, idx) => {
          container.index = idx;
          updateMutation.mutate({
            payload: {
              id: sanitizeDraggableId(container.id),
              index: container.index,
            },
            tableName: TableNames.COLUMN,
          });
          return container;
        });
      return newColumns;
    });
  };

  const deleteBoard = () => {
    deleteMutation.mutate({
      itemId: parseInt(id as string),
      tableName: TableNames.BOARD,
    });
    navigate("/");
  };

  useEffect(() => {
    if (boardContainers) {
      setBoardColumn(boardContainers);
    }
  }, [boardContainers, setBoardColumn]);

  if (hasToShowError) {
    return <Error />;
  }

  if (boardTitlePending || containerPending || taskPending) {
    return <Loading />;
  }

  return (
    <div>
      <BoardHeader
        deleteBoard={() => {
          setModalContent(ModalContent.DELETE_BOARD);
          setIsModalOpen(true);
        }}
        boardData={boardData[0]}
        setIsModalOpen={() => {
          setModalContent(ModalContent.ADD_LIST);
          setIsModalOpen(true);
        }}
      />
      <div className={styles.container}>
        {isModalOpen && (
          <Portal closeModal={() => setIsModalOpen(false)}>
            {modalContent === ModalContent.ADD_LIST ? (
              <AddBoardColumn callback={addBoardColumn} />
            ) : (
              <DeleteBoard
                onCancel={() => setIsModalOpen(false)}
                onDelete={deleteBoard}
              />
            )}
          </Portal>
        )}
        <ContainerList
          boardColumns={boardColumns}
          setBoardColumn={setBoardColumn}
          setActiveId={setActiveId}
          updateItem={(args: UpdateBoardItemsArgs) =>
            updateMutation.mutate(args)
          }
          addNewTask={addNewTask}
          deleteBoardContainer={deleteBoardContainer}
          deleteTask={deleteTask}
          activeId={activeId}
          activeContainer={activeContainer}
          activeCard={activeCard}
        />
      </div>
    </div>
  );
};
