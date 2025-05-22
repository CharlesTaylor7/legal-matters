import {
  useQuery,
  useMutation,
  type UseQueryResult,
  type UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router";
import axios from "axios";
import type { SuccessResponse } from "@/api/types";

export interface User {
  id: number;
  email: string;
  firmName: string;
  role: Role;
}

export type Role = "Admin" | "Lawyer";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
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
    queryFn: async ({ signal }) => {
      try {
        const response = await axios.get<User>("/api/auth/me", {
          signal,
          metadata: {
            action: "Get User Info",
          },
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Not authenticated, but not an error
          return null;
        }
        throw error;
      }
    },
  });
};

/**
 * Custom hook for user login
 * @returns UseMutationResult for login
 */
export const useLoginMutation = (): UseMutationResult<
  SuccessResponse,
  Error,
  LoginRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      // Login and get success response
      axios
        .post<SuccessResponse>("/api/auth/login", credentials, {
          metadata: { action: "Login" },
        })
        .then((res) => res.data),
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
  SuccessResponse,
  Error,
  SignupRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: SignupRequest) =>
      axios
        .post<SuccessResponse>("/api/auth/signup", credentials, {
          metadata: {
            action: "Signing up",
          },
        })
        .then((res) => res.data),
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
  SuccessResponse,
  Error,
  void,
  unknown
> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () =>
      axios
        .post<SuccessResponse>("/api/auth/logout", void null, {
          metadata: {
            action: "Logging out",
          },
        })
        .then((res) => res.data),
    onSuccess: () => {
      // Invalidate the auth query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/");
    },
  });
};
