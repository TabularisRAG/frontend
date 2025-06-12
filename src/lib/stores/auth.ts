import { writable } from 'svelte/store';

export const accessToken = writable<string>();

accessToken.subscribe(value => {
  if (value) {
    localStorage.setItem("access_token", value);
  }
  if (value!=""){
    
  }
});


