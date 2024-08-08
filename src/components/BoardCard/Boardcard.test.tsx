import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoardCard } from "./BoardCard";

const mockTitle = "title";
const mockImageUrl = "imageUrl";
const mockFn = jest.fn();
const mockRegularCard = false;
const mockAddNewCard = true;

describe("BoardCard", () => {
  test("BoardCard renders", () => {
    render(
      <BoardCard
        title={mockTitle}
        imageUrl={mockImageUrl}
        callback={mockFn}
        addNewBoard={mockRegularCard}
      />
    );
    const card = screen.getByText(mockTitle);
    expect(card).toBeTruthy();
  });

  test("The card is clickable", async () => {
    const user = userEvent.setup();

    render(
      <BoardCard
        title={mockTitle}
        imageUrl={mockImageUrl}
        callback={mockFn}
        addNewBoard={mockRegularCard}
      />
    );

    await user.click(screen.getByRole("link"));

    expect(mockFn).toHaveBeenCalled();
  });

  test("The card has the center style", () => {
    render(
      <BoardCard
        title={mockTitle}
        imageUrl={mockImageUrl}
        callback={mockFn}
        addNewBoard={mockAddNewCard}
      />
    );

    const element = screen.getByTestId("card-div");

    expect(element.classList.contains("center")).toBe(true);
  });

  test("The card does not have the center style", () => {
    render(
      <BoardCard
        title={mockTitle}
        imageUrl={mockImageUrl}
        callback={mockFn}
        addNewBoard={mockRegularCard}
      />
    );

    const element = screen.getByTestId("card-div");

    expect(element.classList.contains("center")).toBe(false);
  });
});
