import ChatAPI from '$lib/api/chatAPI/chatAPI';
import ModelAPI from '$lib/api/modelAPI/modelAPI';
import { available_models } from '$lib/paraglide/messages';
import type { Chat } from '$lib/types/chat';
import type { Model } from '$lib/types/model';
import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ fetch, depends, cookies}) => {
  depends('sidebar:chatlist');

  const token = cookies.get('auth-session');
  try {
    const list = await new ChatAPI().get_all_user_chats(token);
    let available_models: Model[] = await new ModelAPI().get_available_models(token);

    const sorted_list = list
    .map((c) => ({
      url: `/chat/${c.session_id}`,
      name: c.name,
      session_id: c.session_id,
      started_at: c.started_at,
      last_message_at: c.last_message_at,
    }))
    .sort((a, b) => {
      if (!a.last_message_at) return 1;
      if (!b.last_message_at) return -1;
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
    });
    return {
      chat_list: sorted_list,
      token: token,
      available_models
    };
  } catch (e) {
    console.error("Sidebar: error while loading data: ", e);
    return {
      chat_list: [],
      token: token,
      available_models: [{
        id: '',
        provider: 'None',
        model_name: "No model available"
      }]
    };
  }
};
