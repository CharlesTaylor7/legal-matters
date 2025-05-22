import { useState, useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import { useCustomerQuery } from "../../api/customers";
import { useMattersQuery, MatterStatus } from "../../api/matters";

export default function MattersByCustomer() {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const customerIdNum = Number(customerId);
  
  // Fetch single customer details
  const {
    data: customer,
    isLoading: isLoadingCustomer,
    error: customerError
  } = useCustomerQuery(customerIdNum);

  // Fetch matters for this customer
  const {
    data: matters = [],
    isLoading: isLoadingMatters,
    error: mattersError
  } = useMattersQuery(customerIdNum);

  // Navigate to edit matter page
  const handleEditMatter = (matterId: number) => {
    navigate(`/matters/${customerId}/edit/${matterId}`);
  };

  // Navigate to create matter page
  const handleCreateMatter = () => {
    navigate(`/matters/${customerId}/create`);
  };

  // Navigate back to matters dashboard
  const handleBackToDashboard = () => {
    navigate("/matters");
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

  if (isLoadingCustomer || isLoadingMatters) {
    return (
      <div className="fixed inset-0 bg-base-200 bg-opacity-75 flex justify-center items-center z-40">
        <div className="bg-base-100 p-8 rounded-lg shadow-xl max-w-4xl w-full">
          <div className="flex justify-center">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="fixed inset-0 bg-base-200 bg-opacity-75 flex justify-center items-center z-40">
        <div className="bg-base-100 p-8 rounded-lg shadow-xl max-w-4xl w-full">
          <h2 className="text-xl font-bold text-error mb-4">Error</h2>
          <p>{customerError?.message || "Customer not found"}</p>
          <div className="flex justify-end mt-6">
            <button
              className="btn btn-primary"
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-base-200 bg-opacity-75 flex justify-center items-center z-40">
      <div className="bg-base-100 p-8 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              className="btn btn-sm btn-ghost mb-2"
              onClick={handleBackToDashboard}
            >
              ← Back to Dashboard
            </button>
            <h2 className="text-2xl font-bold">{customer.name}'s Matters</h2>
            <p className="text-sm opacity-70">{customer.email} • {customer.phone}</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCreateMatter}
          >
            Add Matter
          </button>
        </div>
        
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

        {/* Matters table */}
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Open Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matters.length > 0 ? (
                matters.map((matter) => (
                  <tr key={matter.id}>
                    <td>{matter.title}</td>
                    <td>{renderStatusBadge(matter.status)}</td>
                    <td>
                      {new Date(matter.openDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-outline btn-accent"
                          onClick={() => handleEditMatter(matter.id)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    No matters found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Outlet for modal routes */}
      <Outlet />
    </div>
  );
}
