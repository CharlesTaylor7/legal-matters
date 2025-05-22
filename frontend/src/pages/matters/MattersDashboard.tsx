import { useNavigate } from "react-router";
import { Outlet, useParams } from "react-router";
import { useCustomersQuery } from "@/api/customers";
import { useEffect } from "react";

export default function MattersDashboard() {
  const navigate = useNavigate();
  const { customerId: activeCustomerId } = useParams<{ customerId?: string }>();

  // Fetch all customers (now with open matters count)
  const { data: customers = [], isLoading: isLoadingCustomers } =
    useCustomersQuery();

  // Handle customer selection change
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCustomerId = e.target.value;
    if (selectedCustomerId) {
      navigate(`/matters/${selectedCustomerId}`);
    }
  };

  if (isLoadingCustomers) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="container mx-auto p-4">
      {customers.length === 0 ? (
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>No customers found. Please add customers first.</span>
        </div>
      ) : (
        <div className="form-control w-full max-w-xs mx-auto mb-6">
          <select
            className="select select-bordered w-full"
            value={activeCustomerId || ""}
            onChange={handleCustomerChange}
          >
            <option value="" disabled>
              Select a customer
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  );
}
