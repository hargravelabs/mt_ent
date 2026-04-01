import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export default defineType({
    name: 'galleryItem',
    title: 'Gallery Item',
    type: 'document',
    orderings: [orderRankOrdering],
    fields: [
        orderRankField({ type: 'galleryItem' }),
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
            name: 'eventAlbum',
            title: 'Event Album',
            description: 'Assign this item to a specific event album.',
            type: 'reference',
            to: [{ type: 'eventAlbum' }],
            hidden: ({ document }) => document?.category !== 'Event Media',
            validation: (Rule) => Rule.custom((value, context) => {
                const doc = context.document as unknown as { category: string };
                if (doc.category === 'Event Media' && !value) {
                    return 'An event album is required for Event Media items.';
                }
                return true;
            }),
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
        defineField({
            name: 'youtubeUrl',
            title: 'YouTube URL',
            description: 'Provide a YouTube URL instead of uploading a video file (preferred for high-quality video).',
            type: 'url',
            hidden: ({ document }) => document?.mediaType !== 'video',
        }),
        defineField({
            name: 'videoThumbnail',
            title: 'Video Thumbnail',
            description: 'Placeholder image to display before the video is played.',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (Rule) => Rule.custom((value, context) => {
                const doc = context.document as unknown as { mediaType: string, youtubeUrl?: string };
                if (doc.mediaType === 'video' && !value && !doc.youtubeUrl) {
                    return 'A thumbnail is required for uploaded videos (optional for YouTube URLs).';
                }
                return true;
            }),
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
