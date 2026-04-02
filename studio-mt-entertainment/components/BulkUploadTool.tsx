import React, { useState, useCallback, useEffect } from 'react'
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
  const [eventAlbumId, setEventAlbumId] = useState('')
  const [eventAlbums, setEventAlbums] = useState<{ _id: string; title: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<{ file: File; status: 'pending' | 'uploading' | 'complete' | 'error'; error?: string }[]>([])

  const categories = ['Photography', 'Videography', 'Cinematography', 'Event Media']

  // Fetch event albums when category is Event Media
  useEffect(() => {
    if (category !== 'Event Media') {
      setEventAlbumId('')
      return
    }

    client
      .fetch<{ _id: string; title: string }[]>(
        `*[_type == "eventAlbum"] | order(title asc) { _id, title }`
      )
      .then((albums) => {
        setEventAlbums(albums)
        if (albums.length > 0 && !eventAlbumId) {
          setEventAlbumId(albums[0]._id)
        }
      })
      .catch(console.error)
  }, [category, client])

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
        const documentPayload: Record<string, unknown> = {
          _type: 'galleryItem',
          title: '',
          category: category,
          mediaType: isVideo ? 'video' : 'image',
          ...(isVideo
            ? { video: { _type: 'file', asset: { _type: 'reference', _ref: asset._id } } }
            : { image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } })
        }

        // Add event album reference for Event Media items
        if (category === 'Event Media' && eventAlbumId) {
          documentPayload.eventAlbum = {
            _type: 'reference',
            _ref: eventAlbumId,
          }
        }

        await client.create(documentPayload as any)

        setUploads(prev => prev.map(u => u.file === item.file ? { ...u, status: 'complete' } : u))
      } catch (err: any) {
        setUploads(prev => prev.map(u => u.file === item.file ? { ...u, status: 'error', error: err.message } : u))
      }
    }
  }, [category, eventAlbumId, client])

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

  const isUploadDisabled = category === 'Event Media' && !eventAlbumId

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

            {category === 'Event Media' && (
              <Box>
                <Text weight="semibold" size={1} style={{ marginBottom: '8px' }}>Event Album</Text>
                {eventAlbums.length === 0 ? (
                  <Text muted size={1}>No event albums found. Create one first in Event Albums.</Text>
                ) : (
                  <Select value={eventAlbumId} onChange={(e) => setEventAlbumId(e.currentTarget.value)}>
                    {eventAlbums.map(album => (
                      <option key={album._id} value={album._id}>{album.title}</option>
                    ))}
                  </Select>
                )}
              </Box>
            )}

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
                cursor: isUploadDisabled ? 'not-allowed' : 'pointer',
                opacity: isUploadDisabled ? 0.5 : 1,
              }}
              onDragOver={isUploadDisabled ? undefined : handleDragOver}
              onDragLeave={isUploadDisabled ? undefined : handleDragLeave}
              onDrop={isUploadDisabled ? undefined : handleDrop}
              onClick={isUploadDisabled ? undefined : () => document.getElementById('file-upload')?.click()}
            >
              <Flex direction="column" align="center" style={{ gap: '12px' }}>
                <Text size={4}><UploadIcon /></Text>
                <Text>{isUploadDisabled ? 'Select an event album first' : 'Drag and drop files here'}</Text>
                <Text muted size={1}>or click to select files</Text>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  disabled={isUploadDisabled}
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
