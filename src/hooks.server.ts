import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import {AuthenticationAPI, SESSION_COOKIE_NAME} from "$lib/api/AuthenticationAPI";

const handleParaglide: Handle = ({ event, resolve }) => paraglideMiddleware(event.request, ({ request, locale }) => {
	event.request = request;

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
	});
});

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(SESSION_COOKIE_NAME);
	const authenticationAPI = new AuthenticationAPI()

	if (!sessionToken) {
		authenticationAPI.deleteSession(event)
		return resolve(event);
	}

	await new AuthenticationAPI().validateSessionToken(sessionToken, event);
	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleAuth);
