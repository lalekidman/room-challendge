import * as express from 'express'
import {Request, Response, NextFunction, Router} from 'express'
import * as HttpStatus from 'http-status-codes'
import UserRoute from './users'
import AuthenticateUserRoute from './authenticate'
export default class _Router {
  /**
   * @class initiate router class
   */
  private readonly router: Router
  constructor () {
    this.router = Router({mergeParams: true})
  }
  /**
   * expose routes
   */
  public expose () {
    this.router
      .use('/users', new UserRoute().expose())
      .use('/authenticate', new AuthenticateUserRoute().expose())
    return this.router
  }
}