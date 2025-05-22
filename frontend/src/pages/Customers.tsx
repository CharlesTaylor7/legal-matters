import { useState } from "react";
import {
  useCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  type Customer,
  type CustomerInput,
} from "../api/customers";

export default function Customers() {
  const [newCustomer, setNewCustomer] = useState<CustomerInput>({
    name: "",
    phone: "",
  });

  // State for editing and viewing a customer
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Fetch customers using the custom hook
  const {
    data: customers = [],
    isLoading,
    isError,
    error,
  } = useCustomersQuery();

  // Mutations for creating, updating, and deleting customers
  const createCustomerMutation = useCreateCustomerMutation();
  const updateCustomerMutation = useUpdateCustomerMutation();
  const deleteCustomerMutation = useDeleteCustomerMutation();

  // Handle form submission for creating a new customer
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomerMutation.mutate(newCustomer, {
      onSuccess: () => {
        setNewCustomer({ name: "", phone: "" });
        // Close the modal using the HTML dialog element's close method
        const modal = document.getElementById(
          "add_customer_modal",
        ) as HTMLDialogElement;
        if (modal) modal.close();
      },
    });
  };

  // Handle form submission for updating a customer
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    updateCustomerMutation.mutate(
      {
        id: editingCustomer.id,
        data: {
          name: editingCustomer.name,
          phone: editingCustomer.phone,
        },
      },
      {
        onSuccess: () => {
          setEditingCustomer(null);
          // Close the modal using the HTML dialog element's close method
          const modal = document.getElementById(
            "edit_customer_modal",
          ) as HTMLDialogElement;
          if (modal) modal.close();
        },
      },
    );
  };

  // Open the edit modal for a customer
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    const modal = document.getElementById(
      "edit_customer_modal",
    ) as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  // Open the view modal for a customer
  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    const modal = document.getElementById(
      "view_customer_modal",
    ) as HTMLDialogElement;
    if (modal) modal.showModal();
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
          onClick={() => {
            const modal = document.getElementById(
              "add_customer_modal",
            ) as HTMLDialogElement;
            if (modal) modal.showModal();
          }}
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
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleView(customer)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleEdit(customer)}
                    >
                      Edit
                    </button>
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

      {/* DaisyUI Modal for adding a new customer */}
      <dialog
        id="add_customer_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-6">Add New Customer</h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 mb-6">
              <label className="self-center font-medium text-right hidden md:block">
                Customer Name
              </label>
              <div className="form-control w-full">
                <label className="label md:hidden">
                  <span className="label-text">Customer Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  required
                />
              </div>

              <label className="self-center font-medium text-right hidden md:block">
                Phone Number
              </label>
              <div className="form-control w-full">
                <label className="label md:hidden">
                  <span className="label-text">Phone Number</span>
                </label>
                <input
                  type="tel"
                  className="input input-bordered w-full"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  title="Please format like 123-456-7890"
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  required
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const modal = document.getElementById(
                    "add_customer_modal",
                  ) as HTMLDialogElement;
                  if (modal) modal.close();
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createCustomerMutation.isPending}
              >
                {createCustomerMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Saving...
                  </>
                ) : (
                  "Save Customer"
                )}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* DaisyUI Modal for editing a customer */}
      <dialog
        id="edit_customer_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-6">Edit Customer</h3>

          {editingCustomer && (
            <form onSubmit={handleUpdateSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 mb-6">
                <label className="self-center font-medium text-right hidden md:block">
                  Customer Name
                </label>
                <div className="form-control w-full">
                  <label className="label md:hidden">
                    <span className="label-text">Customer Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={editingCustomer.name}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <label className="self-center font-medium text-right hidden md:block">
                  Phone Number
                </label>
                <div className="form-control w-full">
                  <label className="label md:hidden">
                    <span className="label-text">Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    className="input input-bordered w-full"
                    value={editingCustomer.phone}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        phone: e.target.value,
                      })
                    }
                    title="Please format like 123-456-7890"
                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                    required
                  />
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setEditingCustomer(null);
                    const modal = document.getElementById(
                      "edit_customer_modal",
                    ) as HTMLDialogElement;
                    if (modal) modal.close();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateCustomerMutation.isPending}
                >
                  {updateCustomerMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Updating...
                    </>
                  ) : (
                    "Update Customer"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* DaisyUI Modal for viewing a customer */}
      <dialog
        id="view_customer_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-6">Customer Details</h3>

          {viewingCustomer && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-medium text-sm opacity-70">
                    Customer ID
                  </h4>
                  <p>{viewingCustomer.id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm opacity-70">Name</h4>
                  <p>{viewingCustomer.name}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <h4 className="font-medium text-sm opacity-70">Phone</h4>
                  <p>{viewingCustomer.phone}</p>
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setViewingCustomer(null);
                    const modal = document.getElementById(
                      "view_customer_modal",
                    ) as HTMLDialogElement;
                    if (modal) modal.close();
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    // Close view modal
                    const viewModal = document.getElementById(
                      "view_customer_modal",
                    ) as HTMLDialogElement;
                    if (viewModal) viewModal.close();

                    // Open edit modal with the same customer
                    handleEdit(viewingCustomer);
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
