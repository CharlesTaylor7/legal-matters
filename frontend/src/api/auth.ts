import {
  useQuery,
  useMutation,
  type UseQueryResult,
  type UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router";
import axios from "axios";
import type { SuccessResponse } from "./types";

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
        const response = await axios.get<User>("/api/auth/me", { signal });
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
  User,
  Error,
  LoginRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      // Login and get success response
      await axios.post<SuccessResponse>("/api/auth/login", credentials);

      // Fetch the user data after successful login
      const userResponse = await axios.get<User>("/api/auth/me");
      return userResponse.data;
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
  SignupRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: SignupRequest) => {
      // Signup
      await axios.post<SuccessResponse>("/api/auth/signup", credentials);

      // Login after successful signup
      await axios.post<SuccessResponse>("/api/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });

      // Fetch the user data after successful login
      const userResponse = await axios.get<User>("/api/auth/me");
      return userResponse.data;
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
      await axios.post<SuccessResponse>("/api/auth/logout");
    },
    onSuccess: () => {
      // Invalidate the auth query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/");
    },
  });
};
