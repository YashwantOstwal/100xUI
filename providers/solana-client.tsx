"use client";

import { createClient, type Client } from "@/client";
import { createContext, ReactNode, useContext, useState } from "react";

const ClientContext = createContext<Client | null>(null);

export function SolanaClientProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createClient);
  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  );
}

export function useSolanaClient() {
  const ctx = useContext(ClientContext);
  if (ctx == null) {
    throw new Error("useClient must be used within <ClientProvider/>");
  }
  return ctx;
}
