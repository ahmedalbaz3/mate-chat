"use client";

import { HttpLink, ApolloLink, concat } from "@apollo/client";
import { setContext } from "@apollo/client/link/context"; // You might need to install this: npm install @apollo/client
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";

export default function makeClient() {
  const httpLink = new HttpLink({
    uri: "https://jb8tw1fp-5555.euw.devtunnels.ms/graphql",
    fetchOptions: {
      // you can keep your fetch options here if needed
    },
  });

  // 1. Create an Authentication Link
  const authLink = setContext((_, { headers }) => {
    // Get the authentication token from local storage or cookies
    // Note: Since this is "use client", window/localStorage is available
    // const token =
    //   typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiJjNmU4MzhjYy1jZDgxLTRmYzQtODhlNy0wYTZiYzA5ZmU3ZGEiLCJ0eXBlIjoiQUNDRVNTX1RPS0VOIiwiaWF0IjoxNzcwMjA3OTg3LCJleHAiOjE3NzAyNzI3ODZ9.RWjmSWItFN6E7KVMcLX3Smg7nXtt3qyDcbPyErNoECA`,
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    // 2. Chain the links: authLink must come before httpLink
    link: authLink.concat(httpLink),
  });
}
