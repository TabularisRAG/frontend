import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

type ChatMessageType =
  | 'update_chatname'
  | 'stopped'
  | 'error'
  | 'message_received'
  | 'connection_error'
  | 'token_generated'
  | 'completion_generated'
  | 'ai'
  | 'human';

interface ChatMessageResponse {
  model_id?: string;
  value?: string;
  type?: ChatMessageType;
}

interface ChatDataResponse {
  session_id?: string;
  name?: string;
  started_at?: string;      
  last_message_at?: string; 
  messages?: ChatMessageResponse[];
}

export const load: PageServerLoad = async ({ params, fetch }) => {
  // const sessionId = params.session_id;
  //
  // const res = await fetch(`http://localhost:8000/chats/${sessionId}`);
  // if (!res.ok) {
  //   throw error(res.status, 'Chat nicht gefunden');
  // }
  //
  // const data: ChatDataResponse = await res.json();
  //
  // const messages: { type: string; value: string; modelId?: string }[] =
  //   (data.messages ?? []).map((msg: ChatMessageResponse) => ({
  //     type: msg.type ?? 'error',
  //     value: msg.value ?? '',
  //     modelId: msg.model_id,
  //   }));
  //
  // return {
  //   sessionId: data.session_id ?? sessionId,
  //   chatName: data.name ?? '⎯ Ohne Titel ⎯',
  //   startedAt: data.started_at,       
  //   lastMessageAt: data.last_message_at,
  //   messages,                        
  // };
};
