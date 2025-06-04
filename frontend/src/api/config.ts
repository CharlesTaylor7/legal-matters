import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

export function configureAxios() {
  axios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // don't alert for:
      // - logged out users
      // - request cancellations
      if (error.status !== 401 && error.code !== "ERR_CANCELED") {
        toast.error(`${error.config?.metadata.action ?? "Request"} Failed`);
      }
      return Promise.reject(error);
    },
  );
}
