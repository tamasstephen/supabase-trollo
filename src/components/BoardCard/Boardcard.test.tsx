import { render, screen } from "@testing-library/react";
import { BoardCard } from "./BoardCard";

const mockTitle = "title";
const mockImageUrl = "imageUrl";
const mockFn = jest.fn();
const mockAddNewBoard = false;

describe("BoardCard", () => {
  test("BoardCard renders", () => {
    render(
      <BoardCard
        title={mockTitle}
        imageUrl={mockImageUrl}
        callback={mockFn}
        addNewBoard={mockAddNewBoard}
      />
    );
    const card = screen.getByText(mockTitle);
    expect(card).toBeTruthy();
  });
});
