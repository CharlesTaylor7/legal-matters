import { createBrowserRouter } from "react-router";
import App from "./App";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Matters from "./pages/Matters";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

// Create the router
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: {
          title: "Home",
        },
      },
      {
        path: "customers",
        element: (
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        ),
        handle: {
          title: "Customers",
        },
      },
      {
        path: "matters",
        element: (
          <ProtectedRoute>
            <Matters />
          </ProtectedRoute>
        ),
        handle: {
          title: "Matters",
        },
      },
      {
        path: "login",
        element: <Login />,
        handle: {
          title: "Login",
        },
      },
      {
        path: "signup",
        element: <Signup />,
        handle: {
          title: "Sign Up",
        },
      },
    ],
  },
]);
