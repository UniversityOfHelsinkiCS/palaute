import React from 'react'
import { Button } from '@material-ui/core'

import styles from '../assets/custom.module.scss'
import MessageComponent from './MessageComponent'

export default () => (
  <div>
    <Button className={styles.toskabutton}>
      Example button styled with css modules
    </Button>
    <MessageComponent />
  </div>
)
