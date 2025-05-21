import { NavLink } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthQuery } from "../api";

export default function Navbar() {
  const queryClient = useQueryClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get user data from the query
  const { data: user, isLoading } = useAuthQuery();

  // Mutation for logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      // Invalidate the auth query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  const handleLogout = () => {
    setIsMenuOpen(false);
    logoutMutation.mutate();
  };

  return (
    <div className="navbar bg-base-100 shadow-md py-2">
      {/* Mobile hamburger menu - Only shown when user is logged in */}
      {user && (
        <div className="navbar-start md:hidden">
          <div className={`dropdown ${isMenuOpen ? "dropdown-open" : ""}`}>
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <NavLink
                  to="/customers"
                  className={({ isActive }) =>
                    `cursor-pointer ${isActive ? "menu-active" : ""}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Customers
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/matters"
                  className={({ isActive }) =>
                    `menu-item ${isActive ? "menu-active" : ""}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Matters
                </NavLink>
              </li>
              <li className="mt-2 border-t pt-2">
                <button
                  onClick={handleLogout}
                  className="text-error"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Logout"
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Title centered on mobile, left-aligned on desktop */}
      <div
        className={`${user ? "navbar-center md:navbar-start" : "navbar-start"} flex-1`}
      >
        <NavLink to="/" className="btn btn-ghost text-xl">
          Legal Matters
        </NavLink>
      </div>

      {/* Desktop menu - Only shown when user is logged in */}
      {user && (
        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <NavLink
                to="/customers"
                className={({ isActive }) => (isActive ? "menu-active" : "")}
              >
                Customers
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/matters"
                className={({ isActive }) => (isActive ? "menu-active" : "")}
              >
                Matters
              </NavLink>
            </li>
          </ul>
        </div>
      )}

      {/* Auth buttons - Only shown on desktop when logged in */}
      <div className="navbar-end">
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : user ? (
          <button
            onClick={handleLogout}
            className="btn btn-ghost hidden md:flex"
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Logout"
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
