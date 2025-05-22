import {
  useQuery,
  useMutation,
  type UseQueryResult,
  type UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import type { ErrorResponse, SuccessResponse } from "./types";

export interface CustomerResponse {
  id: number;
  name: string;
  phone: string;
  lawyerId: number;
}

// Alias for backward compatibility
export type Customer = CustomerResponse;

export interface Matter {
  id: number;
  title: string;
  description?: string;
  customerId: number;
}

export interface CustomerDetailResponse {
  id: number;
  name: string;
  phone: string;
  lawyerId: number;
  matters: Matter[];
}

export interface CustomerCreateRequest {
  name: string;
  phone: string;
}

export interface CustomerUpdateRequest {
  name: string;
  phone: string;
}

// Aliases for backward compatibility
export type CustomerInput = CustomerCreateRequest;

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
    queryFn: async () => {
      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      return response.json() as Promise<CustomerResponse[]>;
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
): UseQueryResult<CustomerDetailResponse, Error> => {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch customer");
      }

      return response.json() as Promise<Customer>;
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
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}) as ErrorResponse);
        throw new Error(errorData.message || "Failed to create customer");
      }

      return response.json() as Promise<Customer>;
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
      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}) as ErrorResponse);
        throw new Error(errorData.message || "Failed to update customer");
      }

      return response.json() as Promise<Customer>;
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
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}) as ErrorResponse);
        throw new Error(errorData.message || "Failed to delete customer");
      }

      return response.json() as Promise<SuccessResponse>;
    },
    onSuccess: (_, id) => {
      // Invalidate customers query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // Remove the specific customer from the cache
      queryClient.removeQueries({ queryKey: ["customers", id] });
    },
  });
};
