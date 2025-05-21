import { useState } from "react";
import { Link, Navigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SignupCredentials {
  email: string;
  password: string;
  firmName: string;
}

interface SignupResponse {
  id: string;
  email: string;
  firmName: string;
  token?: string; // Might be returned if using JWT
}

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firmName, setFirmName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectToHome, setRedirectToHome] = useState(false);

  const queryClient = useQueryClient();

  // Signup mutation
  const signupMutation = useMutation<SignupResponse, Error, SignupCredentials>({
    mutationFn: async (credentials) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookie-based auth
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Signup failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch auth query to update UI
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      // Set user data in query cache to avoid an extra network request
      queryClient.setQueryData(["auth", "me"], data);

      // Redirect to home page after successful signup
      setRedirectToHome(true);
    },
    onError: (error) => {
      setErrorMessage(error.message || "Signup failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any previous errors
    signupMutation.mutate({ email, password, firmName });
  };

  // Redirect after successful signup
  if (redirectToHome) {
    return <Navigate to="/" />;
  }

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col">
        <div className="text-center">
          <h1 className="text-5xl font-bold">Sign Up</h1>
          <p className="py-6">Create your Legal Matters account</p>
        </div>
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          {errorMessage && (
            <div className="alert alert-error mt-4 mx-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={signupMutation.isPending}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={signupMutation.isPending}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Firm Name</span>
              </label>
              <input
                type="text"
                placeholder="firm name"
                className="input input-bordered"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                required
                disabled={signupMutation.isPending}
              />
            </div>
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
            <div className="text-center mt-4">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="link link-primary">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
