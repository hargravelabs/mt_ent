import { StructureBuilder } from 'sanity/structure'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

export const myStructure = (S: StructureBuilder, context: any) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('companyInfo').title('Company Info'),
      S.divider(),
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
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Event Albums')
        .child(
          S.list()
            .title('Event Albums')
            .items([
              orderableDocumentListDeskItem({
                type: 'eventAlbum',
                title: 'All Event Albums',
                id: 'event-albums-list',
                S,
                context,
              }),
              S.divider(),
              S.listItem()
                .title('Event Media Items')
                .child(
                  S.documentList()
                    .title('Event Media Items')
                    .filter('_type == "galleryItem" && category == "Event Media"')
                ),
            ])
        ),
      S.divider(),
      S.documentTypeListItem('galleryItem').title('All Gallery Items (Raw List)'),
    ])
