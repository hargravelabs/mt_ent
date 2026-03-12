import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

import {myStructure} from './deskStructure'
import {BulkUploadTool} from './components/BulkUploadTool'
import {UploadIcon} from '@sanity/icons'

export default defineConfig({
  name: 'default',
  title: 'MT Entertainment',

  projectId: 'nmjgru1q',
  dataset: 'production',

  plugins: [structureTool({ structure: myStructure }), visionTool()],

  tools: [
    {
      name: 'bulk-upload',
      title: 'Bulk Upload',
      icon: UploadIcon,
      component: BulkUploadTool,
    }
  ],

  schema: {
    types: schemaTypes,
  },
})
