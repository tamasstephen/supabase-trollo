import { screen, render } from "@testing-library/react";
import { BoardListCard } from "./BoardListCard";
import userEvent from "@testing-library/user-event";

const mockDelete = jest.fn((id: string) => id);

describe("BoardListCard", () => {
  test("card appears on screen", () => {
    render(<BoardListCard title="title" id="1" onDelete={mockDelete} />);

    const card = screen.getByTestId("containercard");

    expect(card).toBeInTheDocument();
  });

  test("user is able to delete the card", async () => {
    const user = userEvent.setup();
    render(<BoardListCard title="title" id="1" onDelete={mockDelete} />);

    const button = screen.getByTestId("deletecard");
    await user.click(button);

    expect(mockDelete).toHaveBeenCalled();
  });
});
