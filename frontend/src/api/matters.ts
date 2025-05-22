import {
  useQuery,
  useMutation,
  type UseQueryResult,
  type UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

/**
 * Matter status type matching the backend MatterStatus enum values
 */
export type MatterStatus = "Open" | "Closed" | "OnHold";

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
  description: string;
  status?: MatterStatus;
}

/**
 * Interface for updating an existing matter
 */
export interface MatterUpdateRequest {
  title?: string;
  description?: string;
  status?: MatterStatus;
}

/**
 * Custom hook to fetch matters for a customer
 * @param customerId ID of the customer
 * @returns UseQueryResult with the matters data
 */
export const useMattersQuery = (
  customerId: number,
): UseQueryResult<MatterResponse[], Error> => {
  return useQuery({
    queryKey: ["customers", customerId, "matters"],
    queryFn: async ({ signal }) => {
      const response = await axios.get<MatterResponse[]>(
        `/api/customers/${customerId}/matters`,
        { signal },
      );
      return response.data;
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
  matterId: number,
): UseQueryResult<MatterDetailResponse, Error> => {
  return useQuery({
    queryKey: ["customers", customerId, "matters", matterId],
    queryFn: async ({ signal }) => {
      const response = await axios.get<MatterDetailResponse>(
        `/api/customers/${customerId}/matters/${matterId}`,
        { signal },
      );
      return response.data;
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
    mutationFn: async ({
      customerId,
      data,
    }: {
      customerId: number;
      data: MatterCreateRequest;
    }) => {
      const response = await axios.post<MatterResponse>(
        `/api/customers/${customerId}/matters`,
        data,
      );
      return response.data;
    },
    onSuccess: (_data, { customerId }) => {
      // Invalidate matters query to refetch the list
      queryClient.invalidateQueries({
        queryKey: ["customers", customerId, "matters"],
      });
      // Invalidate customer detail to update the matters list there
      queryClient.invalidateQueries({ queryKey: ["customers", customerId] });
    },
  });
};

/**
 * Custom hook to update an existing matter
 * @returns UseMutationResult for updating a matter
 */
export const useUpdateMatterMutation = (): UseMutationResult<
  MatterResponse,
  Error,
  { customerId: number; matterId: number; data: MatterUpdateRequest },
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      matterId,
      data,
    }: {
      customerId: number;
      matterId: number;
      data: MatterUpdateRequest;
    }) => {
      const response = await axios.put<MatterResponse>(
        `/api/customers/${customerId}/matters/${matterId}`,
        data,
      );
      return response.data;
    },
    onSuccess: (_data, { customerId, matterId }) => {
      // Invalidate specific matter query
      queryClient.invalidateQueries({
        queryKey: ["customers", customerId, "matters", matterId],
      });
      // Invalidate matters list query
      queryClient.invalidateQueries({
        queryKey: ["customers", customerId, "matters"],
      });
      // Invalidate customer detail to update the matters list there
      queryClient.invalidateQueries({ queryKey: ["customers", customerId] });
    },
  });
};
