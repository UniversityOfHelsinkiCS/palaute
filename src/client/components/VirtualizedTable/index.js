import React, { useState, useMemo } from 'react'
import {
  AutoSizer,
  Table,
  Column,
  SortDirection,
  ScrollSync,
  ColumnSizer,
} from 'react-virtualized'
import { sortBy as lodashSortBy, debounce } from 'lodash'
import { Input } from '@material-ui/core'
import './virtualizedTable.scss'

const VirtualizedTable = ({
  data,
  columns,
  rowHeight = 50,
  headerHeight = 30,
  searchable,
  defaultCellWidth,
}) => {
  const [sortBy, setSortBy] = useState(null)
  const [sortDirection, setSortDirection] = useState(SortDirection.ASC)
  const [filter, setFilter] = useState('')

  const sortedData = useMemo(() => {
    const selectedColumn = columns.find(({ key }) => sortBy === key)
    if (
      !selectedColumn ||
      !(selectedColumn.getCellVal || selectedColumn.renderCell)
    )
      return data
    const result = lodashSortBy(
      data,
      selectedColumn.getCellVal || selectedColumn.renderCell,
    )
    if (sortDirection === SortDirection.ASC) result.reverse()
    return result
  }, [sortBy, sortDirection, data])

  const filteredData = useMemo(
    () =>
      sortedData.filter((params) => {
        let flag = false
        Object.values(params).forEach((value) => {
          if (flag) return
          if (
            !filter ||
            (value &&
              String(value)
                .trim()
                .toLowerCase()
                .includes(filter.trim().toLowerCase()))
          ) {
            flag = true
          }
        })
        return flag
      }),
    [sortBy, sortDirection, filter, data],
  )

  const handleFilterChange = ({ target }) => {
    debounce(({ value }) => {
      setFilter(value)
    }, 300)(target)
  }

  const manualWidths = useMemo(
    () =>
      columns.reduce(
        (acc, { width }) => (width ? acc + (width - defaultCellWidth) : acc),
        0,
      ),
    [columns],
  )

  return (
    <div style={{ maxWidth: '100%', flex: 1, display: 'flex' }}>
      <div style={{ flex: 1 }}>
        {searchable && (
          <Input
            onChange={handleFilterChange}
            placeholder="Search..."
            icon="search"
          />
        )}
        <AutoSizer disableWidth>
          {({ height }) => (
            <ScrollSync>
              {({ onScroll, scrollLeft, scrollTop }) => (
                <ColumnSizer
                  columnCount={columns.length}
                  width={columns.length * defaultCellWidth + manualWidths}
                >
                  {({ adjustedWidth, columnWidth, registerChild }) => (
                    <Table
                      ref={registerChild}
                      height={searchable ? height - 40 : height}
                      width={adjustedWidth}
                      headerHeight={headerHeight}
                      rowHeight={rowHeight}
                      rowCount={filteredData.length}
                      rowGetter={({ index }) => filteredData[index]}
                      sortDirection={sortDirection}
                      sortBy={sortBy}
                      sort={({
                        sortBy: newSortBy,
                        sortDirection: newSortDirection,
                      }) => {
                        setSortBy(newSortBy)
                        setSortDirection(newSortDirection)
                      }}
                      onScroll={onScroll}
                      scrollTop={scrollTop}
                      scrollLeft={scrollLeft}
                    >
                      {columns.map(
                        ({ label, key, renderCell, disableSort, width }) => (
                          <Column
                            disableSort={disableSort}
                            width={width || columnWidth}
                            key={key}
                            label={label}
                            dataKey={key}
                            cellRenderer={({ rowData }) => renderCell(rowData)}
                            onClick={() => setSortBy(key)}
                            style={{ overflow: 'auto' }}
                          />
                        ),
                      )}
                    </Table>
                  )}
                </ColumnSizer>
              )}
            </ScrollSync>
          )}
        </AutoSizer>
      </div>
    </div>
  )
}

export default VirtualizedTable
