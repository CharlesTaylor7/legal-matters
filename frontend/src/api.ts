import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export interface User {
  id: string;
  email: string;
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
