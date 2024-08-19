import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NavBar } from "@/components";
import { Login } from "@/pages";
import { ProtectedRoute } from "./ProtectedRoute";
import { Dashboard } from "@/pages";
import { Board } from "@/pages";

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
        path: "/board/:id",
        element: (
          <ProtectedRoute>
            <Board />,
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
