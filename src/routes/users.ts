import {Request, Response, NextFunction, Router} from 'express'
import * as HttpStatus from 'http-status-codes'
import UserController from '../controller/users'
import { userPatchFormValidationPipeline, userPostFormValidationPipeline } from '../validator/user'
import { requestParamsValidatorMiddleware } from '../utils/helper'
import ApiGuard from '../controller/guard'
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
  private registerUserRoute = (req: Request, res: Response, next: NextFunction) => {
    return new UserController()
      .addUser({...req.body, mobileToken: req.body.mobile_token})
      .then((newUser) => {
        res.status(HttpStatus.CREATED).json({
          success: true,
          data: newUser
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
   * update existing user route.
   */
  private updateUserRoute = (req: Request, res: Response, next: NextFunction) => {
    const {userId} = req.params
    return new UserController()
      .updateUser(userId, {...req.body, mobileToken: req.body.mobile_token})
      .then((updatedUser) => {
        res.status(HttpStatus.ACCEPTED).json({
          success: true,
          data: updatedUser
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
   * update existing user route.
   */
  private removeUserRoute = (req: Request, res: Response, next: NextFunction) => {
    const {userId} = req.params
    return new UserController()
      .removeUser(userId)
      .then((removedUser) => {
        res.status(HttpStatus.ACCEPTED).json({
          success: true,
          data: removedUser
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
   * list of the user with pagination format.
   */
  private getUserListsRoute = (req: Request, res: Response, next: NextFunction) => {
    return new UserController()
      .getLists(req.query)
      .then((users) => {
        res.status(HttpStatus.OK).json({
          success: true,
          data: users
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
   * get user by id or username
   */
  private getUserByIdRoute = (req: Request, res: Response, next: NextFunction) => {
    const {userId = ''} = req.params
    return new UserController()
      .getById(userId)
      .then((user) => {
        res.status(HttpStatus.OK).json({
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
   * get user by username (not implemented)
   */
  private getUserByUsernameRoute = (req: Request, res: Response, next: NextFunction) => {
    const {username = ''} = req.params
    return new UserController()
      .getByUsername(username)
      .then((user) => {
        res.status(HttpStatus.OK).json({
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
      .get('/', this.getUserListsRoute)
      .get('/:userId', this.getUserByIdRoute)
      .post('/',
        requestParamsValidatorMiddleware(userPostFormValidationPipeline), 
        this.registerUserRoute)
      .use(ApiGuard)
      .patch('/:userId', 
        requestParamsValidatorMiddleware(userPatchFormValidationPipeline), 
        this.updateUserRoute)
      .delete('/:userId', 
        this.removeUserRoute)
    return this.router
  }
}