import {
  useQuery,
  useMutation,
  type UseQueryResult,
  type UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router";

export interface User {
  id: string;
  email: string;
  firmName: string;
}

export interface SuccessResponse {
  message: string;
}

export interface ErrorResponse {
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  firmName: string;
}



/**
 * Custom hook to fetch the current authenticated user
 * @returns UseQueryResult with the user data
 */
export const useAuthQuery = (): UseQueryResult<User | null> => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");

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
};

/**
 * Custom hook for user login
 * @returns UseMutationResult for login
 */
export const useLoginMutation = (): UseMutationResult<
  User,
  Error,
  LoginCredentials,
  unknown
> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as ErrorResponse));
        throw new Error(errorData.message || "Login failed");
      }

      // Get the success response but we don't need to return it
      await response.json() as SuccessResponse;
      
      // Fetch the user data after successful login
      const userResponse = await fetch("/api/auth/me");
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data after login");
      }
      
      return userResponse.json() as Promise<User>;
    },
    onSuccess: (data) => {
      // Invalidate and refetch auth query to update UI
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      // Set user data in query cache to avoid an extra network request
      queryClient.setQueryData(["auth", "me"], data);
      navigate("/");
    },
  });
};

/**
 * Custom hook for user signup
 * @returns UseMutationResult for signup
 */
export const useSignupMutation = (): UseMutationResult<
  User,
  Error,
  SignupCredentials,
  unknown
> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as ErrorResponse));
        throw new Error(errorData.message || "Signup failed");
      }

      // Get the success response but we don't need to return it
      await response.json() as SuccessResponse;
      
      // Login after successful signup
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
      
      if (!loginResponse.ok) {
        throw new Error("Failed to login after signup");
      }
      
      // Fetch the user data after successful login
      const userResponse = await fetch("/api/auth/me");
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data after signup");
      }
      
      return userResponse.json() as Promise<User>;
    },
    onSuccess: (data) => {
      // Invalidate and refetch auth query to update UI
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      // Set user data in query cache to avoid an extra network request
      queryClient.setQueryData(["auth", "me"], data);

      navigate("/");
    },
  });
};

/**
 * Custom hook for user logout
 * @returns UseMutationResult for logout
 */
export const useLogoutMutation = (): UseMutationResult<
  void,
  Error,
  void,
  unknown
> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as ErrorResponse));
        throw new Error(errorData.message || "Logout failed");
      }
      
      // We don't need to return the success response
      await response.json() as SuccessResponse;
    },
    onSuccess: () => {
      // Invalidate the auth query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/");
    },
  });
};


