import { createClient } from '@sanity/client';

export const client = createClient({
    projectId: 'nmjgru1q', // Match with sanity.config.ts
    dataset: 'production',
    apiVersion: '2024-03-03',
    useCdn: !import.meta.env.DEV,
});
