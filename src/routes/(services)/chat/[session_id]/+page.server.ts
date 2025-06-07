import type { ChatDataResponse, ChatMessageResponse } from '$lib/types/chat';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, depends }) => {
  depends(`/chat/${params.session_id}`);
  const sessionId = params.session_id;

  try {
    const res = await fetch(`http://localhost:8000/api/chats/${sessionId}`);
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
      sessionId: data.session_id ?? sessionId,
      chatName: data.name ?? 'no name',
      startedAt: data.started_at,       
      lastMessageAt: data.last_message_at,
      messages,                        
    };
  } catch (e) {
    console.log("error");
    return {
      sessionId: sessionId,
      chatName: "anonymous",
      startedAt: null,       
      lastMessageAt: null,
      messages: []
    };
  }
};
