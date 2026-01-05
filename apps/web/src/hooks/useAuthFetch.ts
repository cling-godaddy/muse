import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";

export function useAuthFetch() {
  const { getToken } = useAuth();

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = await getToken();
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    },
    [getToken],
  );

  return authFetch;
}
