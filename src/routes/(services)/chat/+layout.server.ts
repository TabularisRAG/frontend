import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ fetch }) => {
  // try {
  //   const res = await fetch("http://localhost:8000/chats");
  //   if (!res.ok) throw error(res.status, "Chat-Historie konnte nicht geladen werden");
  //
  //   const list: {
  //     session_id: string;
  //     name: string;
  //     last_message_at: string;
  //   }[] = await res.json();
  //
  //   return {
  //     chatList: list.map((c) => ({
  //       sessionId: c.session_id,
  //       name: c.name || "⎯ Ohne Titel ⎯",
  //       lastAt: c.last_message_at
  //     }))
  //   };
  // } catch (e) {
  //   console.error("Sidebar: Fehler beim Laden der Chats", e);
  //   return { chatList: [] };
  // }
};
