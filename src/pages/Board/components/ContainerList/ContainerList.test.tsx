import { BoardPrefixes } from "@/constants";
import { DraggableBoardContainer } from "@/types";
import { UniqueIdentifier } from "@dnd-kit/core";
import { screen, render } from "@testing-library/react";
import { ContainerList } from "./ContainerList";

const mockBoardColumns: DraggableBoardContainer[] = [
  {
    id: `${BoardPrefixes.COLUMN}-1`,
    title: "board title",
    items: [
      { id: `${BoardPrefixes.ITEM}-3`, title: "title", index: 0 },
      { id: `${BoardPrefixes.ITEM}-4`, title: "title-card2", index: 1 },
    ],
    index: 1,
  },
  {
    id: `${BoardPrefixes.COLUMN}-2`,
    title: "board title2",
    items: [{ id: `${BoardPrefixes.ITEM}-5`, title: "title", index: 0 }],
    index: 2,
  },
  {
    id: `${BoardPrefixes.COLUMN}-3`,
    title: "board title3",
    items: [{ id: `${BoardPrefixes.ITEM}-6`, title: "title", index: 0 }],
    index: 2,
  },
];

const mockSetBoardColumn = jest.fn();
const mockSetActiveId = jest.fn();
const mockUpdateItem = jest.fn();
const mockAddNewTask = jest.fn();
const mockDeleteBoardContainer = jest.fn();
const mockDeleteTask = jest.fn();
const mockActiveId: UniqueIdentifier = "1";
const mockActiveContainer = mockBoardColumns[0];
const mockActiveCard = mockBoardColumns[0].items[0];
const mockContainerMove = jest.fn();

const setupTest = () =>
  render(
    <ContainerList
      boardColumns={mockBoardColumns}
      setBoardColumn={mockSetBoardColumn}
      setActiveId={mockSetActiveId}
      updateItem={mockUpdateItem}
      addNewTask={mockAddNewTask}
      deleteBoardContainer={mockDeleteBoardContainer}
      deleteTask={mockDeleteTask}
      activeId={mockActiveId}
      activeContainer={mockActiveContainer}
      activeCard={mockActiveCard}
      updateColumnMove={mockContainerMove}
    />
  );

describe("ContainerList", () => {
  test("it renders", () => {
    setupTest();

    const firstContainer = screen.getByText("board title");
    const tasks = screen.getAllByTestId("containercard");

    expect(firstContainer).toBeInTheDocument();
    expect(tasks.length).toBeGreaterThan(0);
  });
});
