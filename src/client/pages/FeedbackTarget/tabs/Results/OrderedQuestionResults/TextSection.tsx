import type { TypographyProps } from '@mui/material'
import type { ElementType } from 'react'
import type { Components, ExtraProps } from 'react-markdown'

import { Box, Link, Typography } from '@mui/material'
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TextQuestion } from './blocks'

import Markdown from '../../../../../components/common/Markdown'
import { NorButton } from '../../../../../components/common/NorButton'
import { getLanguageValue } from '../../../../../util/languageUtils'
import { getHeadingLevel } from './blocks'

const COLLAPSED_HEIGHT = 112
// Text only slightly taller than the collapsed height is shown in full
const COLLAPSE_SLACK = 40

const HEADING_STYLES: Pick<TypographyProps, 'variant' | 'fontSize'>[] = [
  { variant: 'h5' },
  { variant: 'h6' },
  { variant: 'subtitle1', fontSize: '1.125rem' },
]

const withoutNode = <T extends ExtraProps>({ node, ...props }: T) => props

const getComponents = (headingLevel: number): Components => {
  const heading = (depth: number) => (props: TypographyProps & ExtraProps) => (
    <Typography
      component={`h${getHeadingLevel(headingLevel, depth)}` as ElementType}
      {...(HEADING_STYLES[depth - 1] ?? HEADING_STYLES[2])}
      color="textPrimary"
      sx={{ fontWeight: 'medium', mb: 0.5 }}
      {...withoutNode(props)}
    />
  )

  return {
    h1: heading(1),
    h2: heading(2),
    h3: heading(3),
    h4: heading(4),
    h5: heading(5),
    h6: heading(6),
    p: (props: TypographyProps & ExtraProps) => (
      <Typography variant="body2" sx={{ mb: 1, '&:last-child': { mb: 0 } }} {...withoutNode(props)} />
    ),
    a: props => <Link {...withoutNode(props)} />,
  }
}

const TextSection = ({ question, headingLevel }: { question: TextQuestion; headingLevel: number }) => {
  const { t, i18n } = useTranslation()
  const contentRef = useRef<HTMLDivElement>(null)
  const contentId = useId()
  const [isLong, setIsLong] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const components = useMemo(() => getComponents(headingLevel), [headingLevel])

  useLayoutEffect(() => {
    const element = contentRef.current
    if (!element) return undefined

    const observer = new ResizeObserver(([entry]) =>
      setIsLong(entry.contentRect.height > COLLAPSED_HEIGHT + COLLAPSE_SLACK)
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const content = getLanguageValue(question.data.content, i18n.language) ?? ''
  const collapsed = isLong && !expanded

  return (
    <Box sx={{ color: 'text.secondary', typography: 'body2', mt: 1, '& > *': { maxWidth: '46rem' } }}>
      <Box
        id={contentId}
        sx={{
          '& ul, & ol': { mt: 0, mb: 1, pl: 3 },
          '& * + :is(h1, h2, h3, h4, h5, h6)': { mt: 1.5 },
          ...(collapsed && {
            maxHeight: COLLAPSED_HEIGHT,
            overflow: 'hidden',
            maskImage: 'linear-gradient(black 55%, transparent)',
            '@media print': { maxHeight: 'none', maskImage: 'none' },
          }),
        }}
      >
        <Box ref={contentRef}>
          <Markdown components={components}>{content}</Markdown>
        </Box>
      </Box>
      {isLong && (
        <NorButton
          color="empty"
          size="small"
          onClick={() => setExpanded(previous => !previous)}
          aria-expanded={expanded}
          aria-controls={contentId}
          sx={{ ml: -0.5, '@media print': { display: 'none' } }}
        >
          {expanded ? t('questionResults:showLessText') : t('questionResults:showFullText')}
        </NorButton>
      )}
    </Box>
  )
}

export default TextSection
