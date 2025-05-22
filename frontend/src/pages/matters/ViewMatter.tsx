import { useNavigate, useParams } from "react-router";
import { useMatterQuery, MatterStatus } from "../../api/matters";
import { format } from "date-fns";

export default function ViewMatter() {
  const navigate = useNavigate();
  const { customerId, matterId } = useParams<{
    customerId: string;
    matterId: string;
  }>();
  
  const customerIdNum = Number(customerId);
  const matterIdNum = Number(matterId);

  // Fetch matter details
  const {
    data: matterDetail,
    isLoading,
    isError,
  } = useMatterQuery(customerIdNum, matterIdNum);

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
          onClick={() => navigate("/matters")}
        ></div>
      </div>
    );
  }

  // If error or no matter found, show error message
  if (isError || !matterDetail) {
    return (
      <div className="modal modal-open">
        <div className="modal-box max-w-2xl">
          <div className="p-4 text-center">
            <p className="text-error">Matter not found</p>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => navigate("/matters")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
        <div
          className="modal-backdrop"
          onClick={() => navigate("/matters")}
        ></div>
      </div>
    );
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
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
            onClick={() => navigate("/matters")}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-accent"
            onClick={() => navigate(`/matters/edit/${customerIdNum}/${matterIdNum}`)}
          >
            Edit
          </button>
        </div>
      </div>
      <div
        className="modal-backdrop"
        onClick={() => navigate("/matters")}
      ></div>
    </div>
  );
}
