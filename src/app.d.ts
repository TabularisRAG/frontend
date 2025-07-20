// for information about these interfaces
import type {Session} from "$lib/entities/session";
import type { UserDTO } from "$lib/api/userAPI/response/UserDTO";

declare global {
	namespace App {
		interface Locals {
			user: UserDTO | null;
			session: Session | null;
		}
	}
}

export {};
