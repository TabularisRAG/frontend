export type ChatMessageType =
| "update_chatname"
| "stopped"
| "error"
| "message_received"
| "connection_error"
| "token_generated"
| "completion_generated"
| "ai"
| "human";

export type Message = { type: string; value: string; modelId?: string };

export interface ChatMessageResponse {
  model_id?: string;
  value?: string;
  type?: ChatMessageType;
}

export interface ChatDataResponse {
  session_id?: string;
  name?: string;
  started_at?: string; 
  last_message_at?: string; 
  messages?: ChatMessageResponse[];
}

export interface ChatMessageRequest {
  message?: string;
  model_id?: string;
  stop: boolean;
}


