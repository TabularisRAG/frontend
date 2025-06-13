import type { ChatDataResponse, ChatMessageResponse } from '$lib/types/chat';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, depends }) => {
  depends(`/chat/${params.session_id}`);
  const session_id = params.session_id;
  const API_BASE_URL = 'http://localhost:8000/api';

  try {
    const res = await fetch(`${API_BASE_URL}/chats/${session_id}`);
    if (!res.ok) {
      throw error(res.status, 'Chat not found');
    }

    const data: ChatDataResponse = await res.json();

    const messages: { type: string; value: string; modelId?: string }[] =
    (data.messages ?? []).map((msg: ChatMessageResponse) => ({
      type: msg.type ?? 'error',
      value: msg.value ?? '',
      modelId: msg.model_id,
    }));

    return {
      session_id: data.session_id ?? session_id,
      chat_name: data.name ?? 'no name',
      started_at: data.started_at,       
      last_message_at: data.last_message_at,
      messages,                        
    };
  } catch (e) {
    console.log("error");
    return {
      session_id: session_id,
      chat_name: "anonymous",
      started_at: null,       
      last_message_at: null,
      messages: []
    };
  }
};
