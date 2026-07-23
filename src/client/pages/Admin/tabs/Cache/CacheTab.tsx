import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material'
import { useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'

import { NorButton } from '../../../../components/common/NorButton'
import apiClient from '../../../../util/apiClient'

type CacheInfo = {
  name: string
  keyCount: number
}

type CacheCardProps = {
  name: string
  keyCount: number
  onInvalidate: (name: string) => void
  loading: boolean
}

const CacheCard = ({ name, keyCount, onInvalidate, loading }: CacheCardProps) => (
  <Card variant="outlined" sx={{ maxWidth: 360 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {name}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {keyCount} cached {keyCount === 1 ? 'entry' : 'entries'}
      </Typography>
      <NorButton color="secondary" onClick={() => onInvalidate(name)} disabled={loading || keyCount === 0}>
        Invalidate
      </NorButton>
    </CardContent>
  </Card>
)

const CacheTab = () => {
  const { enqueueSnackbar } = useSnackbar()
  const [caches, setCaches] = useState<CacheInfo[]>([])
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/admin/cache-stats')
      setCaches(data)
    } catch {
      enqueueSnackbar('Failed to fetch cache stats', { variant: 'error' })
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleInvalidate = async (name: string) => {
    setLoading(true)
    try {
      await apiClient.post(`/admin/cache/invalidate/${name}`, {})
      enqueueSnackbar(`Invalidated cache: ${name}`, { variant: 'success' })
      await fetchStats()
    } catch {
      enqueueSnackbar(`Failed to invalidate cache: ${name}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Redis Caches
      </Typography>
      {caches.length === 0 ? (
        <CircularProgress size={24} />
      ) : (
        <Box display="flex" gap={2} flexWrap="wrap">
          {caches.map(cache => (
            <CacheCard
              key={cache.name}
              name={cache.name}
              keyCount={cache.keyCount}
              onInvalidate={handleInvalidate}
              loading={loading}
            />
          ))}
        </Box>
      )}
      <Box mt={2}>
        <NorButton onClick={fetchStats} disabled={loading}>
          Refresh
        </NorButton>
      </Box>
    </Box>
  )
}

export default CacheTab
