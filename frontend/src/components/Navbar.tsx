import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firmName: string;
}

const Navbar = () => {
  const queryClient = useQueryClient();

  // Query to fetch the current user
  //
  // TODO:  abstract away api call query options to separate api/ folder
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, but not an error
          return null;
        }
        throw new Error("Failed to fetch user data");
      }

      return response.json() as Promise<User>;
    },
  });

  // Mutation for logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
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
    logoutMutation.mutate();
  };

  return (
    <div className="navbar bg-base-100 shadow-md flex flex-col md:flex-row py-2">
      {/* Title centered at the top */}
      <div className="w-full flex justify-center mb-2 md:mb-0 md:w-auto md:justify-start">
        <Link to="/" className="btn btn-ghost text-xl">
          Legal Matters
        </Link>
      </div>

      {/* Navigation links left-aligned */}
      <div className="w-full flex justify-start">
        {/* Mobile menu - Only shown when user is logged in */}
        {user && (
          <div className="dropdown md:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost">
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
                <Link to="/customers">Customers</Link>
              </li>
              <li>
                <Link to="/matters">Matters</Link>
              </li>
            </ul>
          </div>
        )}

        {/* Desktop menu - Only shown when user is logged in */}
        {user && (
          <ul className="menu menu-horizontal px-1 hidden md:flex">
            <li>
              <Link to="/customers">Customers</Link>
            </li>
            <li>
              <Link to="/matters">Matters</Link>
            </li>
          </ul>
        )}

        {/* Auth buttons */}
        <div className="ml-auto">
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : user ? (
            <button
              onClick={handleLogout}
              className="btn btn-ghost"
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
    </div>
  );
};

export default Navbar;
