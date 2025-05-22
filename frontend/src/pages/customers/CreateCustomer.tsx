import { useState } from "react";
import { useNavigate } from "react-router";
import {
  useCreateCustomerMutation,
  type CustomerCreateRequest,
} from "@/api/customers";
import PhoneNumberInput from "@/components/PhoneNumberInput";

export default function CreateCustomer() {
  const navigate = useNavigate();
  const [newCustomer, setNewCustomer] = useState<CustomerCreateRequest>({
    name: "",
    phone: "",
  });

  const createCustomerMutation = useCreateCustomerMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomerMutation.mutate(newCustomer, {
      onSuccess: () => {
        // Navigate back to the customers list
        navigate("/customers");
      },
    });
  };

  return (
    <div className="modal modal-open">
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
              <PhoneNumberInput
                required
                value={newCustomer.phone}
                onChange={(value) =>
                  setNewCustomer({ ...newCustomer, phone: value })
                }
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
      <div
        className="modal-backdrop"
        onClick={() => navigate("/customers")}
      ></div>
    </div>
  );
}
