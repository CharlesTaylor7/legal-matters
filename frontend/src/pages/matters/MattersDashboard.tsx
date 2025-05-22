import { useNavigate } from "react-router";
import { Outlet } from "react-router";
import { useCustomersQuery } from "../../api/customers";

export default function MattersDashboard() {
  const navigate = useNavigate();
  
  // Fetch all customers (now with open matters count)
  const { 
    data: customers = [], 
    isLoading: isLoadingCustomers,
    error: customersError 
  } = useCustomersQuery();

  // Handle customer card click
  const handleCustomerClick = (customerId: number) => {
    navigate(`/matters/${customerId}`);
  };

  if (isLoadingCustomers) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Matters Dashboard</h1>
        <div className="flex justify-center my-12">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (customersError) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Matters Dashboard</h1>
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
            <label>Error loading customers: {customersError.message}</label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Matters Dashboard</h1>
      
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {customers.map((customer) => (
              <div 
                key={customer.id}
                className="card bg-base-100 shadow-md hover:shadow-lg cursor-pointer transition-shadow"
                onClick={() => handleCustomerClick(customer.id)}
              >
                <div className="card-body">
                  <h2 className="card-title">{customer.name}</h2>
                  <p className="text-sm opacity-70">{customer.phone}</p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-semibold">
                      {customer.openMattersCount} {customer.openMattersCount === 1 ? "Open Matter" : "Open Matters"}
                    </span>
                    <button className="btn btn-sm btn-primary">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
      
      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  );
}
