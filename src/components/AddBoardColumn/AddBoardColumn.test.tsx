import { InputTypes } from "@/types";
import { render, screen } from "@testing-library/react";
import { AddBoardColumn } from "./AddBoardColumn";
import userEvent from "@testing-library/user-event";

const mockCallback = jest.fn(
  ({ boardColumnTitle }: Pick<InputTypes, "boardColumnTitle">) =>
    boardColumnTitle
);

describe("AddBoardColumn", () => {
  test("it renders on screen", () => {
    render(<AddBoardColumn callback={mockCallback} />);

    const heading = screen.getByText("Create a new list");
    expect(heading).toBeInTheDocument();
  });

  test("user is able to use the input field", async () => {
    const userInput = "abc";
    const user = userEvent.setup();
    render(<AddBoardColumn callback={mockCallback} />);

    const input = screen.getByTestId<HTMLInputElement>("columntitle");
    await user.type(input, userInput);

    expect(input.value).toBe(userInput);
  });

  test("user is able to press submit", async () => {
    const userInput = "abc";
    const user = userEvent.setup();
    render(<AddBoardColumn callback={mockCallback} />);

    const input = screen.getByTestId<HTMLInputElement>("columntitle");
    await user.type(input, userInput);
    const button = screen.getByText("Add new list");

    await user.click(button);

    expect(mockCallback).toHaveBeenCalledWith({ boardColumnTitle: userInput });
  });
});
