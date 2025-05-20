import type {Locale} from "$lib/paraglide/runtime";
import UnitedKingdom from "$lib/icons/united-kingdom.svg";
import Germany from "$lib/icons/germany.svg";

export type Lang = { name: string, code: Locale, flag: string }

export const languages = [
    {name: "English", code: "en", flag: UnitedKingdom},
    {name: "Deutsch", code: "de", flag: Germany},
] as Array<Lang>