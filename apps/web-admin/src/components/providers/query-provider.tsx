"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ComponentProps, useState } from "react";

type QueryProviderProps = {
  children: ComponentProps<typeof QueryClientProvider>["children"];
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}