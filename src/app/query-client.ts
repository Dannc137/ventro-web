import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const isClientError =
          axios.isAxiosError(error) &&
          error.response !== undefined &&
          error.response.status < 500;

        if (isClientError) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});