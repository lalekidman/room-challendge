import * as passport from 'passport'
import * as HttpStatus from 'http-status-codes'
import * as RC from '../utils/response-codes'
import AppError from '../utils/app-error'
import {Request, Response, NextFunction} from 'express'
const f = (req: Request, res: Response, next: NextFunction) => {
  return (error: any, data: any, errCode: any) => {
    if (errCode) {
      res.status(HttpStatus.UNAUTHORIZED).send(new AppError({
        location: 'headers',
        msg: RC.INVALID_ACCESS_TOKEN_FORMAT,
        param: 'bearer',
        value: undefined
      }))
    } else if (error) {
      res.status(HttpStatus.UNAUTHORIZED).send(new AppError({
        location: 'headers',
        msg: RC.ACCESS_TOKEN_EXPIRED,
        param: 'bearer',
        value: undefined
      }))
    } else {
      req.user = data
      next()
    }
  }
}
export default (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', {session: false}, f(req, res, next))(req, res, next)
}