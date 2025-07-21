// for information about these interfaces
import type {Session} from "$lib/entities/session";
import type { UserDTO } from "$lib/api/userAPI/response/UserDTO";
import type { User } from "$lib/entities/user";

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}
}

export {};
