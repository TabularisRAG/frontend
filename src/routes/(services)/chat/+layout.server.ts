import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ fetch }) => {
  try {
    const res = await fetch("http://localhost:8000/api/chats");
    if (!res.ok) throw error(res.status, "History could not be loaded");

    const list: {
      session_id: string;
      name: string;
      last_message_at: string;
    }[] = await res.json();

    return {
      chat_list: list.map((c) => ({
        session_id: c.session_id,
        name: c.name || "no name",
        last_at: c.last_message_at,
        url: `/chat/${c.session_id}`
      }))
    };
  } catch (e) {
    console.error("Sidebar: error while loading data: ", e);
    return { chat_list: [] };
  }
};
