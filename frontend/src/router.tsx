import { createBrowserRouter } from "react-router";
import App from "@/App";
import Home from "@/pages/Home";
import Customers from "@/pages/Customers";
import Matters from "@/pages/Matters";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ProtectedRoute from "@/components/ProtectedRoute";
import CreateCustomer from "@/pages/customers/CreateCustomer";
import EditCustomer from "@/pages/customers/EditCustomer";
import DeleteCustomer from "@/pages/customers/DeleteCustomer";
import CreateMatter from "@/pages/matters/CreateMatter";
import EditMatter from "@/pages/matters/EditMatter";
import MattersDashboard from "@/pages/matters/MattersDashboard";

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
        children: [
          {
            path: "create",
            element: <CreateCustomer />,
            handle: {
              title: "Add New Customer",
            },
          },
          {
            path: "edit/:customerId",
            element: <EditCustomer />,
            handle: {
              title: "Edit Customer",
            },
          },
          {
            path: "delete/:customerId",
            element: <DeleteCustomer />,
            handle: {
              title: "Delete Customer",
            },
          },
        ],
      },
      {
        path: "matters",
        element: (
          <ProtectedRoute>
            <MattersDashboard />
          </ProtectedRoute>
        ),
        handle: {
          title: "Matters Dashboard",
        },
        children: [
          {
            path: ":customerId",
            element: <Matters />,
            handle: {
              title: "Customer Matters",
            },
            children: [
              {
                path: "create",
                element: <CreateMatter />,
                handle: {
                  title: "Add New Matter",
                },
              },
              {
                path: "edit/:matterId",
                element: <EditMatter />,
                handle: {
                  title: "Edit Matter",
                },
              },
            ],
          },
        ],
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
