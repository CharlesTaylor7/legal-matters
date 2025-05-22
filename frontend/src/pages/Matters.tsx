import { useState, useEffect } from "react";
import { useCustomersQuery } from "../api/customers";
import {
  useMattersQuery,
  useMatterQuery,
  useCreateMatterMutation,
  useUpdateMatterMutation,
  MatterStatus,
  type MatterResponse,
  type MatterDetailResponse,
  type MatterCreateRequest,
  type MatterUpdateRequest,
} from "../api/matters";
import { format } from "date-fns";

const Matters = () => {
  // State for customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );

  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // State for matter details
  const [selectedMatterId, setSelectedMatterId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<MatterCreateRequest>({
    title: "",
    description: "",
    openDate: new Date().toISOString().split("T")[0],
    // Always set status to Open for new matters
    status: MatterStatus.Open,
  });

  // Update form state
  const [updateFormData, setUpdateFormData] = useState<MatterUpdateRequest>({
    title: "",
    description: "",
    openDate: new Date().toISOString().split("T")[0],
    status: MatterStatus.Open,
  });

  // Fetch customers
  const {
    data: customers,
    isLoading: isLoadingCustomers,
    error: customersError,
  } = useCustomersQuery();

  // Fetch matters for selected customer
  const {
    data: matters,
    isLoading: isLoadingMatters,
    error: mattersError,
  } = useMattersQuery(selectedCustomerId ?? 0);

  // Fetch single matter details
  const { data: matterDetail, isLoading: isLoadingMatterDetail } =
    useMatterQuery(
      selectedCustomerId ?? 0,
      selectedMatterId ?? 0,
      // Only fetch when both IDs are valid and a modal is open
      {
        enabled:
          !!selectedCustomerId &&
          !!selectedMatterId &&
          (isViewModalOpen || isEditModalOpen),
      },
    );

  // Mutations
  const createMatterMutation = useCreateMatterMutation();
  const updateMatterMutation = useUpdateMatterMutation();

  // Effect to update edit form when matter detail changes
  useEffect(() => {
    if (matterDetail && isEditModalOpen) {
      setUpdateFormData({
        title: matterDetail.title,
        description: matterDetail.description || "",
        openDate: matterDetail.openDate.split("T")[0],
        status: matterDetail.status,
      });
    }
  }, [matterDetail, isEditModalOpen]);

  // Handle form input changes for create form
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? Number(value) : value,
    }));
  };

  // Handle form input changes for update form
  const handleUpdateInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? Number(value) : value,
    }));
  };

  // Handle customer selection
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = Number(e.target.value);
    setSelectedCustomerId(customerId || null);
  };

  // Handle view matter
  const handleViewMatter = (customerId: number, matterId: number) => {
    setSelectedCustomerId(customerId);
    setSelectedMatterId(matterId);
    setIsViewModalOpen(true);
  };

  // Handle edit matter
  const handleEditMatter = (customerId: number, matterId: number) => {
    setSelectedCustomerId(customerId);
    setSelectedMatterId(matterId);
    setIsEditModalOpen(true);
  };

  // Handle create matter submission
  const handleCreateMatter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;

    // Ensure status is always Open for new matters
    const dataWithOpenStatus = {
      ...formData,
      status: MatterStatus.Open,
    };

    createMatterMutation.mutate(
      {
        customerId: selectedCustomerId,
        data: dataWithOpenStatus,
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false);
          setFormData({
            title: "",
            description: "",
            openDate: new Date().toISOString().split("T")[0],
            status: MatterStatus.Open,
          });
        },
      },
    );
  };

  // Handle update matter submission
  const handleUpdateMatter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedMatterId) return;

    updateMatterMutation.mutate(
      {
        customerId: selectedCustomerId,
        matterId: selectedMatterId,
        data: updateFormData,
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
        },
      },
    );
  };

  // Format status for display
  const formatStatus = (status: MatterStatus): string => {
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
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return dateString;
    }
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
    return <span className={badgeClass}>{formatStatus(status)}</span>;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Matters</h1>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Customer Selection */}
          <select
            className="select select-bordered w-full md:w-64"
            onChange={handleCustomerChange}
            value={selectedCustomerId || ""}
            disabled={isLoadingCustomers}
          >
            <option value="">Select a customer</option>
            {customers?.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          {/* Add Matter Button */}
          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            disabled={!selectedCustomerId}
          >
            Add Matter
          </button>
        </div>
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

      {/* Table */}
      {selectedCustomerId && (
        <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
          {isLoadingMatters ? (
            <div className="flex justify-center items-center p-8">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : matters && matters.length > 0 ? (
            <table className="table w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Open Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matters.map((matter) => (
                  <tr key={matter.id} className="hover">
                    <td>{matter.id}</td>
                    <td>{matter.title}</td>
                    <td>{matter.description || "—"}</td>
                    <td>{formatDate(matter.openDate)}</td>
                    <td>{renderStatusBadge(matter.status)}</td>
                    <td className="flex gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() =>
                          handleViewMatter(matter.customerId, matter.id)
                        }
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-outline btn-accent"
                        onClick={() =>
                          handleEditMatter(matter.customerId, matter.id)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-lg text-base-content/70">
                No matters found for this customer.
              </p>
            </div>
          )}
        </div>
      )}

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

      {/* Add Matter Modal */}
      {isAddModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-6">Add New Matter</h3>
            <form onSubmit={handleCreateMatter}>
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

                {/* Status field removed from creation form - all matters are created as Open */}
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsAddModalOpen(false)}
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
            onClick={() => setIsAddModalOpen(false)}
          ></div>
        </div>
      )}

      {/* View Matter Modal */}
      {isViewModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            {isLoadingMatterDetail ? (
              <div className="flex justify-center items-center p-8">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : matterDetail ? (
              <>
                <h3 className="font-bold text-lg mb-4">{matterDetail.title}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-sm opacity-70">Customer</h4>
                    <p>{matterDetail.customerName}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm opacity-70">Status</h4>
                    <p>{renderStatusBadge(matterDetail.status)}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm opacity-70">
                      Open Date
                    </h4>
                    <p>{formatDate(matterDetail.openDate)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-sm opacity-70">
                    Description
                  </h4>
                  <p className="whitespace-pre-wrap">
                    {matterDetail.description || "No description provided."}
                  </p>
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-accent"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleEditMatter(
                        matterDetail.customerId,
                        matterDetail.id,
                      );
                    }}
                  >
                    Edit
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 text-center">
                <p className="text-error">Matter not found</p>
                <div className="modal-action">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setIsViewModalOpen(false)}
          ></div>
        </div>
      )}

      {/* Edit Matter Modal */}
      {isEditModalOpen && matterDetail && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-6">Edit Matter</h3>
            {isLoadingMatterDetail ? (
              <div className="flex justify-center items-center p-8">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : (
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
                    Open Date
                  </label>
                  <div className="form-control w-full">
                    <label className="label md:hidden">
                      <span className="label-text">Open Date</span>
                    </label>
                    <input
                      type="date"
                      name="openDate"
                      value={updateFormData.openDate}
                      onChange={handleUpdateInputChange}
                      className="input input-bordered w-full"
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
                      <option value={MatterStatus.Open}>Open</option>
                      <option value={MatterStatus.InProgress}>
                        In Progress
                      </option>
                      <option value={MatterStatus.Closed}>Closed</option>
                    </select>
                  </div>
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setIsEditModalOpen(false)}
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
            )}
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setIsEditModalOpen(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Matters;
