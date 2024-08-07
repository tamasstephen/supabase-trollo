import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NavBar } from "../components";
import { Login } from "../pages";
import { ProtectedRoute } from "./ProtectedRoute";
import { Dashboard } from "../pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavBar />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
]);

export const Routes = () => {
  return <RouterProvider router={router} />;
};
