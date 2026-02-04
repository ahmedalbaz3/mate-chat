"use client";
import makeClient from "../lib/aplloclient";
import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";

export function ApolloProvider({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
