import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteBoard } from "./DeleteBoard";

const mockDelete = jest.fn();
const mockCancel = jest.fn();

describe("DeleteBoard", () => {
  test("it renders", () => {
    render(<DeleteBoard onDelete={mockDelete} onCancel={mockCancel} />);
    const title = screen.getByText(
      "Are you sure you want to delete this board?"
    );

    expect(title).toBeInTheDocument();
  });

  test("it calls delete callback when delete is pressed", async () => {
    const user = userEvent.setup();
    render(<DeleteBoard onDelete={mockDelete} onCancel={mockCancel} />);
    const deleteButton = screen.getByText("Delete");
    await user.click(deleteButton);

    expect(mockDelete).toHaveBeenCalled();
  });

  test("it calls onCancel callback if cancel was pressed", async () => {
    const user = userEvent.setup();
    render(<DeleteBoard onDelete={mockDelete} onCancel={mockCancel} />);
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(mockDelete).toHaveBeenCalled();
  });
});
