import { Outlet, useNavigate } from "react-router";
import { useCustomersQuery, type Customer } from "../api/customers";

export default function Customers() {
  const navigate = useNavigate();

  // Fetch customers using the custom hook
  const {
    data: customers = [],
    isLoading,
    isError,
    error,
  } = useCustomersQuery();

  // Navigate to edit customer page
  const handleEdit = (customer: Customer) => {
    navigate(`edit/${customer.id}`);
  };

  // Navigate to delete confirmation page
  const handleDelete = (id: number) => {
    navigate(`delete/${id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button className="btn btn-primary" onClick={() => navigate("create")}>
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
                <th>Name</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-sm btn-outline btn-primary"
                      onClick={() => navigate(`/matters/${customer.id}`)}
                    >
                      Matters
                    </button>
                    <button
                      className="btn btn-sm btn-outline btn-accent"
                      onClick={() => handleEdit(customer)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline btn-error"
                      onClick={() => handleDelete(customer.id)}
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

      {/* Outlet for modal routes */}
      <Outlet />
    </div>
  );
}
