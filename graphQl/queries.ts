import { gql } from "@apollo/client";

export const GET_MATE_CHATS = gql`
  query Get_mate_chats {
    get_mate_chats(input: { page: null, limit: null }) {
      items {
        id
        title
        createdAt
        updatedAt
      }
      pageInfo {
        limit
        page
        totalCount
        hasNext
        hasPrevious
      }
    }
  }
`;

export const GET_MATE_MESSAGES = gql`
  query GetMateMessages($input: GetMateMessagesInput!) {
    get_mate_messages(input: $input) {
      items {
        id
        role
        content
      }
      hasMore
    }
  }
`;

export const SEARCH_MATE_MESSAGES = gql`
  query Search_mate_messages {
    search_mate_messages(query: null, limit: null) {
      id
      role
      content
      createdAt
    }
  }
`;
