import { Portal } from "./Portal";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockCloseModal = jest.fn();
const portalWrapper = document.createElement("div");
portalWrapper.setAttribute("id", "portal");

describe("Portal", () => {
  test("Portal renders as expected", () => {
    render(
      <Portal closeModal={mockCloseModal}>
        <p>Portal</p>
      </Portal>,
      { container: document.body.appendChild(portalWrapper) }
    );

    screen.getByTestId("portal");
  });

  test("Portal closes if click outside", async () => {
    const user = userEvent.setup();
    render(
      <Portal closeModal={mockCloseModal}>
        <p>Portal</p>
      </Portal>,
      { container: document.body.appendChild(portalWrapper) }
    );

    const outerDiv = screen.getByTestId("portal");
    await user.click(outerDiv);

    expect(mockCloseModal).toHaveBeenCalled();
  });
});
