import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'galleryItem',
    title: 'Gallery Item',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title / Description (Optional)',
            type: 'string',
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
                    { title: 'Image', value: 'image' },
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
            name: 'video',
            title: 'Video File',
            type: 'file',
            options: {
                accept: 'video/*',
            },
            hidden: ({ document }) => document?.mediaType !== 'video',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'category',
            media: 'image',
        },
        prepare(selection) {
            const { title, subtitle, media } = selection
            return {
                title: title || 'Untitled Gallery Item',
                subtitle: subtitle,
                media: media,
            }
        }
    }
})
