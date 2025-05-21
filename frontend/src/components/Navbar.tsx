import { NavLink } from "react-router";
import { useAuthQuery, useLogoutMutation } from "../api";

export default function Navbar() {
  // Get user data from the query
  const { data: user } = useAuthQuery();

  return (
    <div className="navbar bg-base-100 shadow-md py-2">
      {/* Mobile hamburger menu - Only shown when user is logged in */}
      {user && (
        <div className="navbar-start md:hidden">
          <div className="dropdown">
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
                <NavLink
                  to="/customers"
                  className={({ isActive }) =>
                    `cursor-pointer ${isActive ? "menu-active" : ""}`
                  }
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
                >
                  Matters
                </NavLink>
              </li>
              <li className="mt-2 border-t pt-2">
                <LogoutButton />
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function LogoutButton() {
  const logoutMutation = useLogoutMutation();

  return (
    <button
      onClick={() => logoutMutation.mutate()}
      className="btn btn-ghost hidden md:flex"
      disabled={logoutMutation.isPending}
    >
      {logoutMutation.isPending ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        "Logout"
      )}
    </button>
  );
}
