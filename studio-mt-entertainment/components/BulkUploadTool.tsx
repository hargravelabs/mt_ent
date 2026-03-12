import React, { useState, useCallback } from 'react'
import { useClient } from 'sanity'
import {
  Card,
  Container,
  Heading,
  Stack,
  Text,
  Select,
  Flex,
  Box,
  Badge,
} from '@sanity/ui'
import { UploadIcon } from '@sanity/icons'

export function BulkUploadTool() {
  const client = useClient({ apiVersion: '2023-01-01' })
  const [category, setCategory] = useState('Photography')
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<{ file: File; status: 'pending' | 'uploading' | 'complete' | 'error'; error?: string }[]>([])

  const categories = ['Photography', 'Videography', 'Cinematography', 'Event Media']

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const processFiles = useCallback(async (files: File[]) => {
    const newUploads = files.map(file => ({ file, status: 'pending' as const }))
    setUploads(prev => [...prev, ...newUploads])

    for (const item of newUploads) {
      setUploads(prev => prev.map(u => u.file === item.file ? { ...u, status: 'uploading' } : u))
      try {
        const isVideo = item.file.type.startsWith('video/')
        const assetType = isVideo ? 'file' : 'image'
        
        // 1. Upload the asset
        const asset = await client.assets.upload(assetType, item.file, {
          filename: item.file.name,
        })
        
        // 2. Create the document
        const documentPayload = {
          _type: 'galleryItem',
          title: '', // Empty by default
          category: category,
          mediaType: isVideo ? 'video' : 'image',
          ...(isVideo 
            ? { video: { _type: 'file', asset: { _type: 'reference', _ref: asset._id } } }
            : { image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } })
        }
        await client.create(documentPayload as any)

        setUploads(prev => prev.map(u => u.file === item.file ? { ...u, status: 'complete' } : u))
      } catch (err: any) {
        setUploads(prev => prev.map(u => u.file === item.file ? { ...u, status: 'error', error: err.message } : u))
      }
    }
  }, [category, client])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files)
      processFiles(filesArray)
    }
  }, [processFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      processFiles(filesArray)
    }
  }, [processFiles])

  return (
    <Container width={1} padding={4}>
      <Stack space={4}>
        <Heading as="h1">Bulk Upload Gallery Items</Heading>
        <Text muted>Select a category and drop images or videos below to instantly create gallery items.</Text>

        <Card padding={4} radius={2} shadow={1}>
          <Stack space={4}>
            <Box>
              <Text weight="semibold" size={1} style={{ marginBottom: '8px' }}>Target Category</Text>
              <Select value={category} onChange={(e) => setCategory(e.currentTarget.value)}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </Box>

            <Card
              padding={5}
              radius={2}
              border
              style={{
                borderStyle: 'dashed',
                borderColor: isDragging ? 'var(--card-focus-ring-color)' : 'var(--card-border-color)',
                backgroundColor: isDragging ? 'var(--card-bg-color-hover)' : 'transparent',
                transition: 'all 0.2s',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Flex direction="column" align="center" style={{ gap: '12px' }}>
                <Text size={4}><UploadIcon /></Text>
                <Text>Drag and drop files here</Text>
                <Text muted size={1}>or click to select files</Text>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </Flex>
            </Card>
          </Stack>
        </Card>

        {uploads.length > 0 && (
          <Card padding={4} radius={2} shadow={1}>
            <Stack space={3}>
              <Heading as="h3" size={1}>Upload Progress</Heading>
              {uploads.map((u, i) => (
                <Flex key={i} align="center" gap={3} paddingY={2} style={{ borderBottom: '1px solid var(--card-border-color)' }}>
                  <Box flex={1}>
                    <Text size={1} textOverflow="ellipsis">{u.file.name}</Text>
                  </Box>
                  <Box>
                    {u.status === 'pending' && <Badge mode="outline">Pending</Badge>}
                    {u.status === 'uploading' && <Badge tone="primary">Uploading...</Badge>}
                    {u.status === 'complete' && <Badge tone="positive">Complete</Badge>}
                    {u.status === 'error' && <Badge tone="critical">Error: {u.error}</Badge>}
                  </Box>
                </Flex>
              ))}
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  )
}
