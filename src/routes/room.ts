import {Request, Response, NextFunction, Router} from 'express'
import * as HttpStatus from 'http-status-codes'
import RoomController from '../controller/room'
import { roomPostFormValidationPipeline } from '../validator/rooms'
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
   * add route route
   */
  private addRoomRoute = (req: Request, res: Response, next: NextFunction) => {
    return new RoomController()
      .addRoom(req.body, req.user.user)
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
   * room list route
   */
  private getRoomListRoute = (req: Request, res: Response, next: NextFunction) => {
    const {searchText= '', limitTo = 10, startAt = 0, } = req.query
    return new RoomController()
      .getRoomList({
        searchText,
        limitTo,
        startAt
      })
      .then((rooms) => {
        res.status(HttpStatus.OK).json({
          success: true,
          data: rooms
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
   * room list route
   */
  private getRoomById = (req: Request, res: Response, next: NextFunction) => {
    const {roomId} = req.params
    return new RoomController()
      .getById(roomId)
      .then((room) => {
        res.status(HttpStatus.OK).json({
          success: true,
          data: room
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
   * join to room route
   */
  private joinToRoomRoute = (req: Request, res: Response, next: NextFunction) => {
    const {roomId = ''} = req.params
    return new RoomController()
      .joinToRoom(roomId, req.user.user)
      .then((rooms) => {
        res.status(HttpStatus.ACCEPTED).json({
          success: true,
          data: rooms
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
   * join to room route
   */
  private leaveToRoomRoute = (req: Request, res: Response, next: NextFunction) => {
    const {roomId = ''} = req.params
    return new RoomController()
      .leaveToRoom(roomId, req.user.user)
      .then((rooms) => {
        res.status(HttpStatus.ACCEPTED).json({
          success: true,
          data: rooms
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
   * join to room route
   */
  private changeRoomHostRoute = (req: Request, res: Response, next: NextFunction) => {
    const {roomId = ''} = req.params
    const {userId} = req.body
    return new RoomController()
      .changeHost(roomId, userId, req.user.user)
      .then((rooms) => {
        res.status(HttpStatus.ACCEPTED).json({
          success: true,
          data: rooms
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
      .get('/', this.getRoomListRoute)
      .get('/:roomId', this.getRoomById)
      .use(ApiGuard)
      .post('/',
        requestParamsValidatorMiddleware(roomPostFormValidationPipeline), 
        this.addRoomRoute)
      .patch('/:roomId/host',
        this.changeRoomHostRoute)
      .patch('/:roomId/join',
        // requestParamsValidatorMiddleware(userPostFormValidationPipeline), 
        this.joinToRoomRoute)
      .patch('/:roomId/leave',
        // requestParamsValidatorMiddleware(userPostFormValidationPipeline), 
        this.leaveToRoomRoute)
    return this.router
  }
}