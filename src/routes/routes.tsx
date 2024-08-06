import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NavBar } from "../components/NavBar";
import { Login } from "../pages/LogIn";
import { ProtectedRoute } from "./ProtectedRoute";
import { Dashboard } from "../pages/DashBoard";

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
