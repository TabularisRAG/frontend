import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {getLocale} from "$lib/paraglide/runtime";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };


export const formatSize = (sizeInBytes: number) => {
    const formatter = Intl.NumberFormat(getLocale(), {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    })
    if (sizeInBytes === 0) return formatter.format(0) + " B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));

    return formatter.format(sizeInBytes / Math.pow(1024, i)) + " " + sizes[i];
}