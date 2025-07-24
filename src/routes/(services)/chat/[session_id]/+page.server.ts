import ChatAPI from '$lib/api/chatAPI/chatAPI';
import type { ChatMessageResponse, Message } from '$lib/types/chat';
import type { UUID } from 'crypto';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, depends, cookies }) => {
  depends(`/chat/${params.session_id}`);
  const sessionId = params.session_id as UUID;
  const token = cookies.get('auth-session');

  try {
    const data = await new ChatAPI().getChatById(sessionId, token);

    const messages: Message[] =
    (data.messages ?? []).map((msg: ChatMessageResponse) => ({
      type: msg.type ?? 'error',
      value: msg.value ?? '',
      modelId: msg.model_id,
    }));

    return {
      session_id: sessionId,
      chat_name: data.name ?? 'no name',
      started_at: data.started_at,       
      last_message_at: data.last_message_at,
      token: token,
      messages,                        
    };
  } catch (e) {
    throw redirect(307, "/chat/new");
  }
};
