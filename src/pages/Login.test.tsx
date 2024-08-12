import { PropsWithChildren } from "react";
import { Login } from "./LogIn";
import { render, screen } from "@testing-library/react";
import { AuthContextProvider } from "@/components";

jest.mock("@supabase/auth-ui-react", () => ({
  Auth: () => <p>Auth</p>,
}));

const wrapper = ({ children }: PropsWithChildren) => (
  <AuthContextProvider>{children}</AuthContextProvider>
);

describe("Login", () => {
  test("the Auth component renders", () => {
    render(<Login />, { wrapper });

    const auth = screen.getByText("Auth");

    expect(auth).toBeInTheDocument();
  });

  test("an error is shown when the supabaseclient is not available", () => {
    render(<Login />);

    const error = screen.getByText("An error has occured");

    expect(error).toBeInTheDocument();
  });
});
