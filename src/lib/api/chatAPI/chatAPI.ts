import type { Chat, ChatDataResponse, ChatMessageRequest, Message } from "$lib/types/chat";
import type { UUID } from "crypto";
import APIClient from "../ApiClient";
import { error } from '@sveltejs/kit';

export default class ChatAPI extends APIClient {
  private socket: WebSocket | null = null;

  public async create_new_chat(token: string | undefined, chat_message_request: ChatMessageRequest) {
    try {
      const response = await fetch(`${this.serverURL}/api/chats/new`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chat_message_request)  
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create new chat:', error);
      throw error;
    }
  }

  public async get_all_user_chats(token: string | undefined): Promise<Chat[]> {
    try {
      const res = await fetch(`${this.serverURL}/api/chats`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw error(res.status, "History could not be loaded");
      }

      const list: Chat[] = await res.json();
      return list;

    } catch (err) {
      throw err;
    }
  }

  public async get_chat_by_id(session_id: UUID, token: string | undefined): Promise<ChatDataResponse> {
    try {
      const res = await fetch(`${this.serverURL}/api/chats/${session_id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw error(res.status, 'Chat not found');
      }

      const data: ChatDataResponse = await res.json();
      return data;

    } catch (err) {
      throw err;
    }
  }

  public async delete_chat(session_id: UUID, token: string) {
    try {
      const res = await fetch(`${this.serverURL}/api/chats/${session_id}/delete`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw error(res.status, 'Error while deleting');
      }

      return res

    } catch (err) {
      throw err;
    }

  }

  public async rename_chat(session_id: UUID, new_name: string, token: string) {
    try {
      const res = await fetch(`${this.serverURL}/api/chats/${session_id}/set_name/${new_name}`, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) {
        throw error(res.status, 'Chat could not be renamed');
      }

      return res

    } catch (err) {
      throw err;
    }
  }
}
