import { useState } from "react";
import {
  useCustomersQuery,
  useCreateCustomerMutation,
  useDeleteCustomerMutation,
  type Customer,
  type CustomerInput,
} from "../api/customers";

export default function Customers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<CustomerInput>({
    name: "",
    phone: "",
  });

  // Fetch customers using the custom hook
  const {
    data: customers = [],
    isLoading,
    isError,
    error,
  } = useCustomersQuery();

  // Mutations for creating and deleting customers
  const createCustomerMutation = useCreateCustomerMutation();
  const deleteCustomerMutation = useDeleteCustomerMutation();

  // Handle form submission for creating a new customer
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomerMutation.mutate(newCustomer, {
      onSuccess: () => {
        setNewCustomer({ name: "", phone: "" });
        setIsModalOpen(false);
      },
    });
  };

  // Handle customer deletion
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      deleteCustomerMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          Add Customer
        </button>
      </div>

      {isLoading && (
        <div className="alert alert-info">Loading customers...</div>
      )}

      {isError && (
        <div className="alert alert-error">
          Error loading customers: {error?.message || "Unknown error"}
        </div>
      )}

      {!isLoading && !isError && customers.length === 0 && (
        <div className="alert alert-info">
          No customers found. Add your first customer!
        </div>
      )}

      {customers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td className="flex gap-2">
                    <button className="btn btn-sm btn-ghost">View</button>
                    <button className="btn btn-sm btn-ghost">Edit</button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(customer.id)}
                      disabled={deleteCustomerMutation.isPending}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for adding a new customer */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Customer</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Customer Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Phone Number</span>
                </label>
                <input
                  type="tel"
                  className="input input-bordered"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createCustomerMutation.isPending}
                >
                  {createCustomerMutation.isPending
                    ? "Saving..."
                    : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
