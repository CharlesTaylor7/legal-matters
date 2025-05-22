import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  useMatterQuery,
  useUpdateMatterMutation,
  type MatterUpdateRequest,
} from "@/api/matters";

export default function EditMatter() {
  const navigate = useNavigate();
  const { customerId, matterId } = useParams<{
    customerId: string;
    matterId: string;
  }>();

  const customerIdNum = Number(customerId);
  const matterIdNum = Number(matterId);

  // Form state
  const [updateFormData, setUpdateFormData] = useState<MatterUpdateRequest>({
    title: "",
    description: "",
    status: "Open",
  });

  // Fetch matter details
  const {
    data: matterDetail,
    isLoading,
    isError,
    error,
  } = useMatterQuery(customerIdNum, matterIdNum);

  // Update mutation
  const updateMatterMutation = useUpdateMatterMutation();

  // Effect to update form when matter detail changes
  useEffect(() => {
    if (matterDetail) {
      setUpdateFormData({
        title: matterDetail.title,
        description: matterDetail.description || "",
        status: matterDetail.status,
      });
    }
  }, [matterDetail]);

  // Handle form input changes
  const handleUpdateInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle update matter submission
  const handleUpdateMatter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerIdNum || !matterIdNum) return;

    updateMatterMutation.mutate(
      {
        customerId: customerIdNum,
        matterId: matterIdNum,
        data: updateFormData,
      },
      {
        onSuccess: () => {
          navigate(`/matters/${customerIdNum}`);
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
          onClick={() => navigate(`/matters/${customerIdNum}`)}
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
          <p>{error?.message || "Failed to load matter data"}</p>
          <div className="modal-action">
            <button
              className="btn"
              onClick={() => navigate(`/matters/${customerIdNum}`)}
            >
              Close
            </button>
          </div>
        </div>
        <div
          className="modal-backdrop"
          onClick={() => navigate(`/matters/${customerIdNum}`)}
        ></div>
      </div>
    );
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-6">Edit Matter</h3>

        <form onSubmit={handleUpdateMatter}>
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
                value={updateFormData.title}
                onChange={handleUpdateInputChange}
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
                value={updateFormData.description}
                onChange={handleUpdateInputChange}
                className="textarea textarea-bordered h-24 w-full"
              />
            </div>

            <label className="self-center font-medium text-right hidden md:block">
              Status
            </label>
            <div className="form-control w-full">
              <label className="label md:hidden">
                <span className="label-text">Status</span>
              </label>
              <select
                name="status"
                value={updateFormData.status}
                onChange={handleUpdateInputChange}
                className="select select-bordered w-full"
              >
                <option value="Open">Open</option>
                <option value="OnHold">On Hold</option>
                <option value="Closed">Closed</option>
              </select>
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
              disabled={updateMatterMutation.isPending}
            >
              {updateMatterMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Updating...
                </>
              ) : (
                "Update Matter"
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
