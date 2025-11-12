// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			token: string | undefined;
		}
		// interface PageData {}
		interface PageState {
			// Track which dialog is open in history state
			dialog?: 'user-profile' | 'organization-profile';
		}
		// interface Platform {}
	}
}

export {};
