import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { MatterCreateRequest } from "../../api/matters";
import { useCreateMatterMutation } from "../../api/matters";

export default function CreateMatter() {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const customerIdNum = Number(customerId);

  // Form state
  const [formData, setFormData] = useState<MatterCreateRequest>({
    title: "",
    description: "",
    openDate: new Date().toISOString().split("T")[0],
    // Always set status to Open for new matters
    status: "Open",
  });

  const createMatterMutation = useCreateMatterMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerIdNum) {
      navigate("/matters");
      return;
    }

    // Ensure status is always Open for new matters
    const dataWithOpenStatus = {
      ...formData,
      status: "Open",
    };

    createMatterMutation.mutate(
      {
        customerId: customerIdNum,
        data: dataWithOpenStatus,
      },
      {
        onSuccess: () => {
          // Navigate back to the customer's matters list
          navigate(`/matters/${customerIdNum}`);
        },
      }
    );
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? Number(value) : value,
    }));
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-6">Add New Matter</h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 mb-6">
            <label className="self-center font-medium text-right hidden md:block">
              Title
            </label>
            <div className="form-control w-full">
              <label className="label md:hidden">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                required
              />
            </div>

            <label className="self-start font-medium text-right mt-2 hidden md:block">
              Description
            </label>
            <div className="form-control w-full">
              <label className="label md:hidden">
                <span className="label-text">Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="textarea textarea-bordered h-24 w-full"
              />
            </div>

            <label className="self-center font-medium text-right hidden md:block">
              Open Date
            </label>
            <div className="form-control w-full">
              <label className="label md:hidden">
                <span className="label-text">Open Date</span>
              </label>
              <input
                type="date"
                name="openDate"
                value={formData.openDate}
                onChange={handleInputChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => navigate(`/matters/${customerIdNum}`)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMatterMutation.isPending}
            >
              {createMatterMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Creating...
                </>
              ) : (
                "Create Matter"
              )}
            </button>
          </div>
        </form>
      </div>
      <div
        className="modal-backdrop"
        onClick={() => navigate("/matters")}
      ></div>
    </div>
  );
}
