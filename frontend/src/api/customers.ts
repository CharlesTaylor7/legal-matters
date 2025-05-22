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
    queryFn: async ({ signal }) => {
      const response = await axios.get<CustomerResponse[]>("/api/customers", {
        signal,
      });
      return response.data;
    },
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
    queryFn: async ({ signal }) => {
      const response = await axios.get<CustomerResponse>(
        `/api/customers/${id}`,
        { signal },
      );
      return response.data;
    },
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
    mutationFn: async (customerData: CustomerCreateRequest) => {
      const response = await axios.post<CustomerResponse>(
        "/api/customers",
        customerData,
      );
      return response.data;
    },
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
    mutationFn: async (id: number) => {
      const response = await axios.delete<SuccessResponse>(
        `/api/customers/${id}`,
      );
      return response.data;
    },
    onSuccess: (_, id) => {
      // Invalidate customers query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // Remove the specific customer from the cache
      queryClient.removeQueries({ queryKey: ["customers", id] });
    },
  });
};
