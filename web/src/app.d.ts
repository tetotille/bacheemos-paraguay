/// <reference types="unplugin-icons/types/svelte" />
import type { Perfil } from '#lib/domain/types';

export interface User {
	id: string;
	email?: string;
	nombre?: string;
	rol?: string;
	[key: string]: unknown;
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			token: string | null;
			user: User | null;
			perfil: Perfil | null;
		}
		interface PageData {
			token?: string | null;
			user?: User | null;
			perfil?: Perfil | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '$env/static/public' {
	export const PUBLIC_API_URL: string;
	export const PUBLIC_SUPABASE_URL: string;
	export const PUBLIC_SUPABASE_ANON_KEY: string;
	export const PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
	export const PUBLIC_MAP_STYLE_URL: string;
	export const PUBLIC_TURNSTILE_SITE_KEY: string;
}

declare module '$app/env/public' {
	export const PUBLIC_API_URL: string;
	export const PUBLIC_SUPABASE_URL: string;
	export const PUBLIC_SUPABASE_ANON_KEY: string;
	export const PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
	export const PUBLIC_MAP_STYLE_URL: string;
	export const PUBLIC_TURNSTILE_SITE_KEY: string;
}

export {};
