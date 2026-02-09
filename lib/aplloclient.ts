"use client";

import { HttpLink, ApolloLink, concat } from "@apollo/client";
import { setContext } from "@apollo/client/link/context"; // You might need to install this: npm install @apollo/client
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";

export default function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.BACKEND_API_KEY || "http://localhost:4000/graphql",
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
        authorization: `Bearer ${process.env.TOKEN || ""}`,
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    // 2. Chain the links: authLink must come before httpLink
    link: authLink.concat(httpLink),
  });
}
