// for information about these interfaces
import type { User } from "$lib/entities/user";
import type {Session} from "$lib/entities/session";

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}
}

export {};
