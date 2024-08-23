import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NavBar } from "@/components";
import { Login, Dashboard, Board } from "@/pages";
import { ProtectedRoute } from "./ProtectedRoute";

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
