import { gql } from "@apollo/client";

export const CREATE_MATE_CHAT = gql`
  mutation CreateMateChat($title: String) {
    create_mate_chat(input: { title: $title }) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_MATE_CHAT_TITLE = gql`
  mutation Update_mate_chat_title($chatId: String!, $title: String!) {
    update_mate_chat_title(input: { chatId: $chatId, title: $title }) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_MATE_CHAT = gql`
  mutation Delete_mate_chat($chatId: String!) {
    delete_mate_chat(chatId: $chatId)
  }
`;

export const DELETE_ALL_MATE_CHATS = gql`
  mutation Delete_all_mate_chats {
    delete_all_mate_chats
  }
`;
