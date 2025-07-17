import type { UUID } from "crypto";

export enum ChatMessageType {
  UPDATE_CHATNAME = "update_chatname",
  STOPPED = "stopped",
  ERROR = "error",
  MESSAGE_RECEIVED = "message_received",
  CONNECTION_ERROR = "connection_error",
  TOKEN_GENERATED = "token_generated",
  COMPLETION_GENERATED = "completion_generated",
  AI = "ai",
  HUMAN = "human",
}

export type Message = {
  type: string;
  value: string;
  modelId?: string
};

export interface ChatMessageResponse {
  model_id?: UUID;
  value?: string;
  type?: ChatMessageType;
}

export interface ChatDataResponse {
  session_id?: UUID;
  name?: string;
  started_at?: string; 
  last_message_at?: string; 
  messages?: ChatMessageResponse[];
}

export interface ChatMessageRequest {
  message?: string;
  model_id?: UUID;
  stop: boolean;
}

export type Chat = {
  session_id: UUID;
  name: string;
  last_message_at: string;
  started_at: string;
  url: string,
}


