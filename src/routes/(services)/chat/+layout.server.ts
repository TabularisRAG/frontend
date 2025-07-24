import ChatAPI from '$lib/api/chatAPI/chatAPI';
import ModelAPI from '$lib/api/modelAPI/modelAPI';
import type { Model } from '$lib/types/model';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ depends, cookies}) => {
  depends('sidebar:chatlist');

  const token = cookies.get('auth-session');
  let availableModels: Model[] = [{
    provider: 'None',
    model_name: "No model available"
  }] as Model[];
  try {
    const list = await new ChatAPI().getAllUserChats(token);
    try {
      availableModels = await new ModelAPI().getAvailableModels(token);
    }
    catch (e) {
      console.error("No models available");
    }

    const sortedList = list
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
      chatList: sortedList,
      token: token,
      availableModels
    };
  } catch (e) {
    console.error("Sidebar: error while loading data: ", e);
    return {
      chatList: [],
      token: token,
      availableModels: availableModels 
    };
  }
};
