import { writable } from 'svelte/store';
import { userStore, loadUserWith } from './user';

export const accessToken = writable<string>();

accessToken.subscribe(value => {
  if (value) {
    localStorage.setItem("access_token", value);
    console.log("Following access token stored:", value);

  }
  if (value!=""){
    loadUserWith(value)
  }
});

export function logout() {
  userStore.set(null)
  accessToken.set("")
  console.log("User logged out and token deleted")
}
