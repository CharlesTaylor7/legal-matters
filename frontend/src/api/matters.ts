import {
  useQuery,
  useMutation,
  type UseQueryResult,
  type UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { ErrorResponse, SuccessResponse } from "./types";

/**
 * Matter status enum matching the backend MatterStatus enum
 */
export enum MatterStatus {
  Open = 0,
  InProgress = 1,
  Closed = 2,
}

/**
 * Interface for matter response from the API
 */
export interface MatterResponse {
  id: number;
  title: string;
  description?: string;
  openDate: string; // ISO date string
  status: MatterStatus;
  customerId: number;
}

/**
 * Interface for detailed matter response from the API
 */
export interface MatterDetailResponse {
  id: number;
  title: string;
  description?: string;
  openDate: string; // ISO date string
  status: MatterStatus;
  customerId: number;
  customerName: string;
}

/**
 * Interface for creating a new matter
 */
export interface MatterCreateRequest {
  title: string;
  description?: string;
  openDate?: string; // Optional ISO date string
  status?: MatterStatus; // Optional status
}

/**
 * Custom hook to fetch matters for a customer
 * @param customerId ID of the customer
 * @returns UseQueryResult with the matters data
 */
export const useMattersQuery = (
  customerId: number
): UseQueryResult<MatterResponse[], Error> => {
  return useQuery({
    queryKey: ["customers", customerId, "matters"],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}/matters`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as ErrorResponse));
        throw new Error(errorData.message || "Failed to fetch matters");
      }

      return response.json() as Promise<MatterResponse[]>;
    },
    enabled: !!customerId, // Only run the query if customerId is provided
  });
};

/**
 * Custom hook to fetch a single matter
 * @param customerId ID of the customer
 * @param matterId ID of the matter
 * @returns UseQueryResult with the matter data
 */
export const useMatterQuery = (
  customerId: number,
  matterId: number
): UseQueryResult<MatterDetailResponse, Error> => {
  return useQuery({
    queryKey: ["customers", customerId, "matters", matterId],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${customerId}/matters/${matterId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as ErrorResponse));
        throw new Error(errorData.message || "Failed to fetch matter");
      }

      return response.json() as Promise<MatterDetailResponse>;
    },
    enabled: !!customerId && !!matterId, // Only run the query if both IDs are provided
  });
};

/**
 * Custom hook to create a matter for a customer
 * @returns UseMutationResult for creating a matter
 */
export const useCreateMatterMutation = (): UseMutationResult<
  MatterResponse,
  Error,
  { customerId: number; data: MatterCreateRequest },
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, data }: { customerId: number; data: MatterCreateRequest }) => {
      const response = await fetch(`/api/customers/${customerId}/matters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as ErrorResponse));
        throw new Error(errorData.message || "Failed to create matter");
      }

      return response.json() as Promise<MatterResponse>;
    },
    onSuccess: (data, { customerId }) => {
      // Invalidate matters query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["customers", customerId, "matters"] });
      // Invalidate customer detail to update the matters list there
      queryClient.invalidateQueries({ queryKey: ["customers", customerId] });
    },
  });
};
