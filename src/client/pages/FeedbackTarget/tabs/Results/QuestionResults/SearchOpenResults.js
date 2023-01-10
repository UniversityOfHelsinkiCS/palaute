import { Box, TextField } from '@mui/material'
import { grey } from '@mui/material/colors'
import React from 'react'

const SearchOpenResults = ({ questions }) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [results, setResults] = React.useState([])

  React.useEffect(() => {
    const searchTermLower = searchTerm.toLowerCase()
    const results = questions
      .flatMap(q => q.feedbacks)
      .filter(f => f.data && f.data.toLowerCase().includes(searchTermLower))
    setResults(results)
  }, [searchTerm])

  return (
    <Box>
      <TextField
        placeholder="Hae tekstuaalisista palautteista"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <Box>
        {results.map((r, index) => (
          <Box key={index} p="1rem" borderRadius="0.8rem" backgroundColor={grey[100]} my="0.2rem">
            {r.data}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default SearchOpenResults
