import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'project',
    title: 'Project (The Reel)',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Project Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'order',
            title: 'Order',
            type: 'number',
            description: 'Set the order in which this project appears in the Reel (e.g., 1, 2, 3...)',
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Photography', value: 'Photography' },
                    { title: 'Videography', value: 'Videography' },
                    { title: 'Cinematography', value: 'Cinematography' },
                    { title: 'Event Media', value: 'Event Media' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),

        defineField({
            name: 'mediaType',
            title: 'Media Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Single Image', value: 'image' },
                    { title: 'Image Collage (2-3 photos)', value: 'image_collage' },
                    { title: 'Video', value: 'video' },
                ],
                layout: 'radio',
            },
            initialValue: 'image',
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            hidden: ({ document }) => document?.mediaType !== 'image',
        }),
        defineField({
            name: 'images',
            title: 'Image Collage',
            type: 'array',
            of: [{ type: 'image', options: { hotspot: true } }],
            options: {
                layout: 'grid',
            },
            validation: (Rule) => Rule.max(3),
            hidden: ({ document }) => document?.mediaType !== 'image_collage',
        }),
        defineField({
            name: 'video',
            title: 'Video File',
            type: 'file',
            options: {
                accept: 'video/*',
            },
            hidden: ({ document }) => document?.mediaType !== 'video',
        }),
    ],
})
