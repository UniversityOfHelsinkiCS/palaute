import { Router } from 'express'
import { router as userRouter } from './userController'
import { router as pinsRouter } from './pinsController'

const router = Router()
router.use(pinsRouter)
router.use(userRouter)

export const userController = router
