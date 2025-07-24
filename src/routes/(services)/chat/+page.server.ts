import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
  const layoutData = await parent();
  const { chatList } = layoutData;

  if (chatList && chatList.length > 0) {
    const LATEST_CHAT = 0;
    redirect(307, `chat/${chatList[LATEST_CHAT].session_id}`);
  }
	redirect(307, `/chat/new`);
}
