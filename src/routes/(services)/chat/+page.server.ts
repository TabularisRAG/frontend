import { redirect } from '@sveltejs/kit';

export function load() {
  const chatId = crypto.randomUUID();
	redirect(307, `/chat/new/${chatId}`);
}
