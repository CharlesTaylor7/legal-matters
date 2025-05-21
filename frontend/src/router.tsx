import { createBrowserRouter, Navigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import App from "./App";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Matters from "./pages/Matters";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Auth loader to protect routes
const authLoader = async () => {
  // We need to check if the user is authenticated
  const response = await fetch("/api/auth/me");
  
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login if not authenticated
      throw new Response("Unauthorized", { status: 401 });
    }
    throw new Response("Error fetching user", { status: response.status });
  }
  
  return await response.json();
};

// Error element for protected routes
const ProtectedRouteErrorElement = () => {
  return <Navigate to="/login" replace />;
};

// Home loader to fetch user data (without requiring authentication)
const homeLoader = async () => {
  try {
    const response = await fetch("/api/auth/me");
    
    if (!response.ok) {
      if (response.status === 401) {
        // Not authenticated, but that's okay for the home page
        return null;
      }
      throw new Response("Error fetching user", { status: response.status });
    }
    
    return await response.json();
  } catch (error) {
    // Return null if there's an error, allowing the home page to render for unauthenticated users
    return null;
  }
};

// Create the router
export const router = createBrowserRouter([
  {
    path: "/",
    id: "root",
    element: <App />,
    loader: homeLoader,
    children: [
      {
        index: true,
        element: <Home />,
        loader: homeLoader,
        handle: {
          title: "Home"
        }
      },
      {
        path: "customers",
        element: <Customers />,
        loader: authLoader,
        errorElement: <ProtectedRouteErrorElement />,
        handle: {
          title: "Customers"
        }
      },
      {
        path: "matters",
        element: <Matters />,
        loader: authLoader,
        errorElement: <ProtectedRouteErrorElement />,
        handle: {
          title: "Matters"
        }
      },
      {
        path: "login",
        element: <Login />,
        handle: {
          title: "Login"
        }
      },
      {
        path: "signup",
        element: <Signup />,
        handle: {
          title: "Sign Up"
        }
      }
    ]
  }
]);
