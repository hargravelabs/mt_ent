import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export default defineType({
    name: 'eventAlbum',
    title: 'Event Album',
    type: 'document',
    orderings: [orderRankOrdering],
    fields: [
        orderRankField({ type: 'eventAlbum' }),
        defineField({
            name: 'title',
            title: 'Event Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            description: 'URL-friendly identifier (auto-generated from title).',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'thumbnail',
            title: 'Thumbnail Image',
            description: 'Cover image displayed on the Event Media gallery page.',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'date',
            title: 'Event Date',
            type: 'date',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'date',
            media: 'thumbnail',
        },
        prepare(selection) {
            const { title, subtitle, media } = selection
            return {
                title: title || 'Untitled Event',
                subtitle: subtitle || '',
                media,
            }
        },
    },
})
