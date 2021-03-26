import React, { useState } from 'react'
import { Button } from '@material-ui/core'

import MessageComponent from './MessageComponent'
import VirtualizedTable from './VirtualizedTable'
import DesignSystem from './DesignSystem'

const generateData = (amount) => {
  const res = []
  for (let i = 0; i < amount; i++) {
    res.push({
      name: `name ${i}`,
      left: i % 1000,
    })
  }
  return res
}

export default () => {
  const [greetings, setGreetings] = useState(['Hello'])

  const nextGreeting = `${greetings[greetings.length - 1]}!`

  const columns = [
    {
      label: 'Name',
      key: 'name',
      renderCell: ({ name }) => name,
      width: 300,
    },
    {
      label: 'Left',
      key: 'left',
      renderCell: ({ left }) => <span style={{ color: 'red' }}>{left}</span>,
      getCellVal: ({ left }) => left,
    },
    {
      label: 'Do something',
      key: 'button',
      renderCell: ({ name }) => (
        <Button
          color="secondary"
          onClick={() => console.log(`Clicked ${name}!`)}
        >
          CLICK
        </Button>
      ),
      disableSort: true,
    },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div>
        {greetings.join(' ')}
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setGreetings([...greetings, nextGreeting])}
        >
          {nextGreeting}
        </Button>
      </div>
      <MessageComponent />
      <VirtualizedTable
        searchable
        data={generateData(10000)}
        columns={columns}
        defaultCellWidth={100}
      />
      <DesignSystem />
    </div>
  )
}
