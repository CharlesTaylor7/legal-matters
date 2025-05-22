import { useNavigate, useParams } from "react-router";
import { useDeleteCustomerMutation, useCustomerQuery } from "@/api/customers";

export default function DeleteCustomer() {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const id = Number(customerId);

  // Fetch customer data to display name in confirmation
  const { data: customer, isLoading, isError } = useCustomerQuery(id);

  // Delete mutation
  const deleteCustomerMutation = useDeleteCustomerMutation();

  const handleConfirmDelete = () => {
    deleteCustomerMutation.mutate(id, {
      onSuccess: () => {
        navigate("/customers");
      },
    });
  };

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="modal modal-open">
        <div className="modal-box max-w-md">
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
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-lg text-error mb-4">Error</h3>
          <p>Could not find customer information. Please try again.</p>
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
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-4">Confirm Delete</h3>

        <p className="py-4">
          Are you sure you want to delete customer{" "}
          <span className="font-semibold">{customer?.name}</span>?
        </p>
        <p className="text-error mb-4">This action cannot be undone.</p>

        <div className="modal-action">
          <button className="btn" onClick={() => navigate("/customers")}>
            Cancel
          </button>
          <button
            className="btn btn-error"
            onClick={handleConfirmDelete}
            disabled={deleteCustomerMutation.isPending}
          >
            {deleteCustomerMutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
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
