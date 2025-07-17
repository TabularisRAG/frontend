import ChatAPI from '$lib/api/chatAPI/chatAPI';
import type { ChatDataResponse, ChatMessageResponse } from '$lib/types/chat';
import type { UUID } from 'crypto';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch, depends, cookies }) => {
  depends(`/chat/${params.session_id}`);
  const session_id = params.session_id;
  const token = cookies.get('auth-session');

  try {
    const chat_API = new ChatAPI();
    const data = await chat_API.get_chat_by_id(session_id, token);

    const messages: { type: string; value: string; modelId?: UUID}[] =
    (data.messages ?? []).map((msg: ChatMessageResponse) => ({
      type: msg.type ?? 'error',
      value: msg.value ?? '',
      modelId: msg.model_id,
    }));

    return {
      session_id: data.session_id,
      chat_name: data.name ?? 'no name',
      started_at: data.started_at,       
      last_message_at: data.last_message_at,
      token: token,
      messages,                        
    };
  } catch (e) {
    return {
      session_id: session_id,
      chat_name: "anonymous",
      started_at: null,       
      last_message_at: null,
      token: token,
      messages: []
    };
  }
};
