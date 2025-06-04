import {
  useQuery,
  useMutation,
  type UseQueryResult,
  type UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import type { SuccessResponse } from "@/api/types";

export interface CustomerResponse {
  id: number;
  name: string;
  phone: string;
  lawyerId: number;
}
export interface Matter {
  id: number;
  title: string;
  description?: string;
  customerId: number;
}

export interface CustomerCreateRequest {
  name: string;
  phone: string;
}

export interface CustomerUpdateRequest {
  name: string;
  phone: string;
}

/**
 * Custom hook to fetch customers
 * @returns UseQueryResult with the customers data
 */
export const useCustomersQuery = (): UseQueryResult<
  CustomerResponse[],
  Error
> => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: ({ signal }) =>
      axios
        .get<CustomerResponse[]>("/api/customers", {
          signal,
          metadata: {
            action: "Fetching Customers",
          },
        })
        .then((res) => res.data),
  });
};

/**
 * Custom hook to fetch a single customer
 * @param id Customer ID
 * @returns UseQueryResult with the customer data
 */
export const useCustomerQuery = (
  id: number,
): UseQueryResult<CustomerResponse, Error> => {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: ({ signal }) =>
      axios
        .get<CustomerResponse>(`/api/customers/${id}`, {
          signal,
          metadata: {
            action: "Fetching Customer",
          },
        })
        .then((res) => res.data),
    enabled: !!id, // Only run the query if id is provided
  });
};

/**
 * Custom hook to create a customer
 * @returns UseMutationResult for creating a customer
 */
export const useCreateCustomerMutation = (): UseMutationResult<
  CustomerResponse,
  Error,
  CustomerCreateRequest,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerData: CustomerCreateRequest) =>
      axios
        .post<CustomerResponse>("/api/customers", customerData, {
          metadata: {
            action: "Creating Customer",
          },
        })
        .then((res) => res.data),
    onSuccess: () => {
      // Invalidate customers query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

/**
 * Custom hook to update a customer
 * @returns UseMutationResult for updating a customer
 */
export const useUpdateCustomerMutation = (): UseMutationResult<
  CustomerResponse,
  Error,
  { id: number; data: CustomerUpdateRequest },
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: CustomerUpdateRequest;
    }) => {
      const response = await axios.put<CustomerResponse>(
        `/api/customers/${id}`,
        data,
        {
          metadata: {
            action: "Updating Customer",
          },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate specific customer query and the customers list
      queryClient.invalidateQueries({ queryKey: ["customers", data.id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

/**
 * Custom hook to delete a customer
 * @returns UseMutationResult for deleting a customer
 */
export const useDeleteCustomerMutation = (): UseMutationResult<
  SuccessResponse,
  Error,
  number,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      axios
        .delete<SuccessResponse>(`/api/customers/${id}`, void null, {
          metadata: {
            action: "Deleting Customer",
          },
        })
        .then((res) => res.data),
    onSuccess: (_, id) => {
      // Invalidate customers query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // Remove the specific customer from the cache
      queryClient.removeQueries({ queryKey: ["customers", id] });
    },
  });
};
