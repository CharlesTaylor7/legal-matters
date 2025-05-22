import { Outlet, useNavigate, useParams } from "react-router";
import { useCustomerQuery } from "../api/customers";
import { useMattersQuery, MatterStatus } from "../api/matters";

export default function Matters() {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const customerIdNum = Number(customerId);

  // Fetch customer details
  const {
    data: customer,
    isLoading: isLoadingCustomer,
    error: customerError,
  } = useCustomerQuery(customerIdNum);

  // Fetch matters for this customer
  const {
    data: matters = [],
    isLoading: isLoadingMatters,
    error: mattersError,
  } = useMattersQuery(customerIdNum);

  // Navigate back to matters dashboard
  const handleBackToDashboard = () => {
    navigate("/matters");
  };

  // Navigate to create matter page
  const handleCreateMatter = () => {
    navigate("create");
  };

  // Navigate to edit matter page
  const handleEditMatter = (matterId: number) => {
    navigate(`edit/${matterId}`);
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

  // If loading customer data, show loading indicator
  if (isLoadingCustomer) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center my-6">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  // If error or customer not found, show error message
  if (customerError || !customer) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error">
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
            <label>{customerError?.message || "Customer not found"}</label>
          </div>
        </div>
        <button
          className="btn btn-primary mt-4"
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{customer.name}'s Matters</h2>
          <p className="text-sm opacity-70">{customer.phone}</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateMatter}>
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

      {/* Loading States */}
      {isLoadingMatters ? (
        <div className="loading loading-spinner loading-md mx-auto my-8"></div>
      ) : (
        // Matters table
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
                    <td>{new Date(matter.openDate).toLocaleDateString()}</td>
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
      )}
      {/* Outlet for modal routes */}
      <Outlet />
    </div>
  );
}
