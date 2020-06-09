import {Request, Response, NextFunction, Router} from 'express'
import * as HttpStatus from 'http-status-codes'
import UserController from '../controller/users'
import { userPatchFormValidationPipeline, userPostFormValidationPipeline } from '../validator/user'
import { requestParamsValidatorMiddleware } from '../utils/helper'
export default class _Router {
  /**
   * @class initiate router class
   */
  private readonly router: Router
  constructor () {
    this.router = Router({mergeParams: true})
  }
  /**
   * register user route
   */
  private authenticateUserRoute = (req: Request, res: Response, next: NextFunction) => {
    const {username, password} = req.body
    return new UserController()
      .authenticateUser(username, password)
      .then((user) => {
        res.status(HttpStatus.CREATED).json({
          success: true,
          data: user
        })
      })
      .catch((err) => {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          erros: [
            err.message
          ]
        })
      })
  }
  /**
   * expose routes
   */
  public expose () {

    this.router
      .post('/', this.authenticateUserRoute)
    return this.router
  }
}