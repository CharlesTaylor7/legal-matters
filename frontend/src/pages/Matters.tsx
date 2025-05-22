import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useCustomersQuery } from "../api/customers";
import {
  useMattersQuery,
  MatterStatus,
  type MatterResponse,
} from "../api/matters";

export default function Matters() {
  const navigate = useNavigate();
  
  // State for customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );

  // Fetch customers
  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    error: customersError,
  } = useCustomersQuery();

  // Fetch matters for selected customer
  const {
    data: matters = [],
    isLoading: isLoadingMatters,
    error: mattersError,
  } = useMattersQuery(selectedCustomerId ?? 0);



  // Handle customer selection
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = Number(e.target.value);
    setSelectedCustomerId(customerId || null);
  };



  // Navigate to edit matter page
  const handleEditMatter = (customerId: number, matterId: number) => {
    navigate(`edit/${customerId}/${matterId}`);
  };

  // Navigate to create matter page
  const handleCreateMatter = () => {
    if (!selectedCustomerId) return;
    navigate(`create/${selectedCustomerId}`);
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: MatterStatus) => {
    let badgeClass = "badge";
    switch (status) {
      case MatterStatus.Open:
        badgeClass += " badge-primary";
        break;
      case MatterStatus.InProgress:
        badgeClass += " badge-warning";
        break;
      case MatterStatus.Closed:
        badgeClass += " badge-success";
        break;
    }
    
    const statusText = (() => {
      switch (status) {
        case MatterStatus.Open:
          return "Open";
        case MatterStatus.InProgress:
          return "In Progress";
        case MatterStatus.Closed:
          return "Closed";
        default:
          return "Unknown";
      }
    })();
    
    return <span className={badgeClass}>{statusText}</span>;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Matters</h1>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="form-control w-full md:w-80">
            <select
              className="select select-bordered w-full"
              value={selectedCustomerId || ""}
              onChange={handleCustomerChange}
            >
              <option value="">Select a customer</option>
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary w-full md:w-auto"
            onClick={handleCreateMatter}
            disabled={!selectedCustomerId}
          >
            Add Matter
          </button>
        </div>

      {/* Error Messages */}
      {customersError && (
        <div className="alert alert-error mb-4">
          <div className="flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-6 h-6 mx-2 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              ></path>
            </svg>
            <label>Error loading customers: {customersError.message}</label>
          </div>
        </div>
      )}

      {mattersError && (
        <div className="alert alert-error mb-4">
          <div className="flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-6 h-6 mx-2 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              ></path>
            </svg>
            <label>Error loading matters: {mattersError.message}</label>
          </div>
        </div>
      )}

      {/* Loading States */}
      {isLoadingCustomers && (
        <div className="loading loading-spinner loading-lg mx-auto my-8"></div>
      )}

      {/* Matters table */}
      <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Title</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Open Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingMatters ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <div className="loading loading-spinner loading-md mx-auto"></div>
                  </td>
                </tr>
              ) : matters && matters.length > 0 ? (
                matters.map((matter) => (
                  <tr key={matter.id}>
                    <td>{matter.title}</td>
                    <td>{matter.customerName}</td>
                    <td>{renderStatusBadge(matter.status)}</td>
                    <td>
                      {new Date(matter.openDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-accent"
                          onClick={() =>
                            handleEditMatter(matter.customerId, matter.id)
                          }
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    {selectedCustomerId
                      ? "No matters found for this customer."
                      : "Please select a customer to view their matters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      {/* Outlet for modal routes */}
      <Outlet />

      {!selectedCustomerId && !isLoadingCustomers && (
        <div className="alert alert-info mt-4">
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
          <span>Please select a customer to view their matters.</span>
        </div>
      )}
      </div>
    </div>
  );
}
