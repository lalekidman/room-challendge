import * as express from 'express'
import {Request, Response, NextFunction, Router} from 'express'
import * as HttpStatus from 'http-status-codes'
import UserRoute from './users'
import AuthenticateUserRoute from './authenticate'
import RoomRoute from './room'
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
      .use('/authenticate', new AuthenticateUserRoute().expose())
      .use('/users', new UserRoute().expose())
      .use('/rooms', new RoomRoute().expose())
    return this.router
  }
}