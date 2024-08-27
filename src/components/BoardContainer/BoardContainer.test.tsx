import { render, screen, waitFor } from "@testing-library/react";
import { BoardContainer } from "./BoardContainer";
import userEvent from "@testing-library/user-event";

const mockCallback = jest.fn();
const mockDelete = jest.fn();

const MockCard = () => <p>Card</p>;

const props = {
  id: "1",
  title: "title",
  callback: mockCallback,
  onDelete: mockDelete,
};

describe("BoardContainer", () => {
  test("container appears on the screen", () => {
    render(
      <BoardContainer {...props}>
        <MockCard />
      </BoardContainer>
    );

    const card = screen.getByText("Card");

    expect(card).toBeInTheDocument();
  });

  test("textarea appears on the screen", async () => {
    const user = userEvent.setup();
    render(
      <BoardContainer {...props}>
        <MockCard />
      </BoardContainer>
    );

    const button = screen.getByText("Add new task");
    await user.click(button);
    const textArea = screen.getByTestId("textarea");

    expect(textArea).toBeInTheDocument();
  });

  test("user is able to type in the textarea", async () => {
    const userInput = "abc";
    const user = userEvent.setup();
    render(
      <BoardContainer {...props}>
        <MockCard />
      </BoardContainer>
    );

    const button = screen.getByText("Add new task");
    await user.click(button);
    const textArea = screen.getByTestId<HTMLTextAreaElement>("textarea");
    await user.type(textArea, userInput);

    expect(textArea.value).toBe(userInput);
  });

  test("user is able to add a new card", async () => {
    const userInput = "abc";
    const user = userEvent.setup();
    render(
      <BoardContainer {...props}>
        <MockCard />
      </BoardContainer>
    );

    const button = screen.getByText("Add new task");
    await user.click(button);
    const textArea = screen.getByTestId<HTMLTextAreaElement>("textarea");
    await user.type(textArea, userInput);
    await user.type(textArea, "{enter}");

    expect(mockCallback).toHaveBeenCalled();
  });

  test("user is able to close textarea", async () => {
    const userInput = "abc";
    const user = userEvent.setup();
    render(
      <BoardContainer {...props}>
        <MockCard />
      </BoardContainer>
    );

    const button = screen.getByText("Add new task");
    await user.click(button);
    const textArea = screen.getByTestId<HTMLTextAreaElement>("textarea");
    await user.type(textArea, userInput);
    expect(textArea.value).toBe(userInput);
    await user.type(textArea, "{Escape}");

    await waitFor(() => expect(textArea.value).toBe(""));
  });
});
