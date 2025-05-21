import {
  useQuery,
  useMutation,
  type UseQueryResult,
  type UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";

export interface Customer {
  id: number;
  name: string;
  phone: string;
}

export interface CustomerInput {
  name: string;
  phone: string;
}

/**
 * Custom hook to fetch customers
 * @returns UseQueryResult with the customers data
 */
export const useCustomersQuery = (): UseQueryResult<Customer[], Error> => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      return response.json() as Promise<Customer[]>;
    },
  });
};

/**
 * Custom hook to fetch a single customer
 * @param id Customer ID
 * @returns UseQueryResult with the customer data
 */
export const useCustomerQuery = (
  id: number
): UseQueryResult<Customer, Error> => {
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
  Customer,
  Error,
  CustomerInput,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData: CustomerInput) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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
  Customer,
  Error,
  { id: number; data: CustomerInput },
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CustomerInput }) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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
  void,
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
        throw new Error("Failed to delete customer");
      }
    },
    onSuccess: (_, id) => {
      // Invalidate customers query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // Remove the specific customer from the cache
      queryClient.removeQueries({ queryKey: ["customers", id] });
    },
  });
};