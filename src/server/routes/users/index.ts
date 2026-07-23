import { Router } from 'express'

import { router as pinsRouter } from './pinsController'
import { router as userRouter } from './userController'

const router = Router()
router.use(pinsRouter)
router.use(userRouter)

export const userController = router
