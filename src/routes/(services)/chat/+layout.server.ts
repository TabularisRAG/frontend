import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ fetch, depends }) => {
  depends('sidebar:chatlist');
  try {
    const res = await fetch("http://localhost:8000/api/chats");
    if (!res.ok) throw error(res.status, "History could not be loaded");

    const list: {
      session_id: string;
      name: string;
      last_message_at: string;
    }[] = await res.json();

   const sorted_list = list
      .map((c) => ({
        url: `/chat/${c.session_id}`,
        ...c,
      }))
      .sort((a, b) => {
        if (!a.last_message_at) return 1;
        if (!b.last_message_at) return -1;
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      });
    console.log(sorted_list);
    return {
      chat_list: sorted_list,
    };
  } catch (e) {
    console.error("Sidebar: error while loading data: ", e);
    return { chat_list: [] };
  }
};
