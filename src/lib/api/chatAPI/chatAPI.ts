import type { Chat, ChatDataResponse, ChatMessageRequest, Message } from "$lib/types/chat";
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

  public async get_chat_by_id(session_id: string, token: string | undefined): Promise<ChatDataResponse> {
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
}
