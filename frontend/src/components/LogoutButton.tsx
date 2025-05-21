import { useLogoutMutation } from "../api/auth";

export default function LogoutButton() {
  const logoutMutation = useLogoutMutation();

  return (
    <button
      onClick={() => logoutMutation.mutate()}
      className="btn btn-ghost"
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
