import { StructureBuilder } from 'sanity/structure'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

export const myStructure = (S: StructureBuilder, context: any) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('project').title('Project (The Reel)'),
      S.documentTypeListItem('studioCapabilities').title('Studio Capabilities Images'),
      S.divider(),
      S.listItem()
        .title('Gallery Categories')
        .child(
          S.list()
            .title('Gallery Categories')
            .items([
              orderableDocumentListDeskItem({
                type: 'galleryItem',
                title: 'Photography',
                id: 'category-photography',
                filter: 'category == "Photography"',
                S,
                context,
              }),
              orderableDocumentListDeskItem({
                type: 'galleryItem',
                title: 'Videography',
                id: 'category-videography',
                filter: 'category == "Videography"',
                S,
                context,
              }),
              orderableDocumentListDeskItem({
                type: 'galleryItem',
                title: 'Cinematography',
                id: 'category-cinematography',
                filter: 'category == "Cinematography"',
                S,
                context,
              }),
              orderableDocumentListDeskItem({
                type: 'galleryItem',
                title: 'Event Media',
                id: 'category-event-media',
                filter: 'category == "Event Media"',
                S,
                context,
              }),
            ])
        ),
      S.divider(),
      S.documentTypeListItem('galleryItem').title('All Gallery Items (Raw List)'),
    ])
