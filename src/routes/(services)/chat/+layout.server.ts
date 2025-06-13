import type { Chat } from '$lib/types/chat';
import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ fetch, depends }) => {
  depends('sidebar:chatlist');
  try {
    const res = await fetch("http://localhost:8000/api/chats");
    if (!res.ok) throw error(res.status, "History could not be loaded");

    const list: Chat[] = await res.json();

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
    };
  } catch (e) {
    console.error("Sidebar: error while loading data: ", e);
    return { chat_list: [] };
  }
};
