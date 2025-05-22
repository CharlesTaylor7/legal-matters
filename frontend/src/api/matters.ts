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
    queryFn: ({ signal }) =>
      axios
        .get<
          MatterResponse[]
        >(`/api/customers/${customerId}/matters`, { signal, metadata: { action: "Fetching Matters" } })
        .then((res) => res.data),
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
    queryFn: ({ signal }) =>
      axios
        .get<MatterDetailResponse>(
          `/api/customers/${customerId}/matters/${matterId}`,
          {
            signal,
            metadata: {
              action: "Fetching Matter",
            },
          },
        )
        .then((res) => res.data),
    // Only run the query if both IDs are provided
    enabled: !!customerId && !!matterId,
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
    }) =>
      axios
        .post<MatterResponse>(`/api/customers/${customerId}/matters`, data, {
          metadata: { action: "Creating Matter" },
        })
        .then((res) => res.data),
    onSuccess: (_data, { customerId }) => {
      // Invalidate matters query to refetch the list
      queryClient.invalidateQueries({
        queryKey: ["customers", customerId, "matters"],
      });
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
    }) =>
      axios
        .put<MatterResponse>(
          `/api/customers/${customerId}/matters/${matterId}`,
          data,
          { metadata: { action: "Updating Matter" } },
        )
        .then((res) => res.data),
    onSuccess: (_data, { customerId }) => {
      // Invalidate matters list query
      queryClient.invalidateQueries({
        queryKey: ["customers", customerId, "matters"],
      });
    },
  });
};
