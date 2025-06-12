import { writable } from 'svelte/store';
import type { User } from '../../entities/user';
import UserAPI from '../../api/userAPI/userAPI';

export const userStore = writable<User | null>();

userStore.subscribe(value => {
  if (value) {
    localStorage.setItem("user", JSON.stringify(value));
  }
});

export async function loadUserByJwt(jwt: string): Promise<void> {
    try {
        const userApi = new UserAPI()
        const userData: User = await userApi.loadUser(jwt)
        userStore.set(userData);
    } catch (error) {
        console.error('Error loading user:', error);
        userStore.set(null); 
    }
}