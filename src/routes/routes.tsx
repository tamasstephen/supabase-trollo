import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NavBar } from "../components/NavBar";
import App from "../App";

import { Login } from "../pages/LogIn";
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
            <App />
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
