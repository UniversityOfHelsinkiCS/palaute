import { Chart } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import React from 'react'

/**
 * Needs to be called somewhere once
 */
const useChartConfig = () => {
  React.useMemo(() => {
    Chart.register(annotationPlugin)
    Chart.register(ChartDataLabels)
    Chart.defaults.set('font', {
      family: 'Open Sans',
    })
    Chart.defaults.set('plugins.datalabels', {
      color: '#ffffff',
      font: {
        family: 'Open Sans',
        size: 12,
      },
    })
  }, [])
}

export default useChartConfig
