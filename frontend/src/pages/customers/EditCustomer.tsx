import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  useCustomerQuery,
  useUpdateCustomerMutation,
  type CustomerUpdateRequest,
} from "../../api/customers";
import PhoneInput from "../../components/PhoneNumberInput";

export default function EditCustomer() {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const id = Number(customerId);

  // State for the customer being edited
  const [customerData, setCustomerData] = useState<CustomerUpdateRequest>({
    name: "",
    phone: "",
  });

  // Fetch customer data
  const { data: customer, isLoading, isError, error } = useCustomerQuery(id);

  // Update mutation
  const updateCustomerMutation = useUpdateCustomerMutation();

  // Set form data when customer data is loaded
  useEffect(() => {
    if (customer) {
      setCustomerData({
        name: customer.name,
        phone: customer.phone,
      });
    }
  }, [customer]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateCustomerMutation.mutate(
      {
        id,
        data: customerData,
      },
      {
        onSuccess: () => {
          // Navigate back to customers list
          navigate("/customers");
        },
      },
    );
  };

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="modal modal-open">
        <div className="modal-box max-w-2xl">
          <div className="flex justify-center items-center p-8">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
        <div
          className="modal-backdrop"
          onClick={() => navigate("/customers")}
        ></div>
      </div>
    );
  }

  // If error, show error message
  if (isError) {
    return (
      <div className="modal modal-open">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg text-error mb-4">Error</h3>
          <p>{error?.message || "Failed to load customer data"}</p>
          <div className="modal-action">
            <button className="btn" onClick={() => navigate("/customers")}>
              Close
            </button>
          </div>
        </div>
        <div
          className="modal-backdrop"
          onClick={() => navigate("/customers")}
        ></div>
      </div>
    );
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-6">Edit Customer</h3>

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
                value={customerData.name}
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
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
              <PhoneInput
                type="tel"
                className="input input-bordered w-full"
                value={customerData.phone}
                onChange={(phone) =>
                  setCustomerData({
                    ...customerData,
                    phone,
                  })
                }
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                title="Phone number must be in format: 123-456-7890"
                placeholder="123-456-7890"
                required
              />
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => navigate("/customers")}
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
      </div>
      <div
        className="modal-backdrop"
        onClick={() => navigate("/customers")}
      ></div>
    </div>
  );
}
