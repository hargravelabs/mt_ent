import { createClient } from '@sanity/client';

const client = createClient({
    projectId: 'nmjgru1q',
    dataset: 'production',
    apiVersion: '2024-03-03',
    useCdn: false,
});

async function run() {
    const data = await client.fetch(`*[_type == "galleryItem"]`);
    console.log(JSON.stringify(data, null, 2));
}

run();
