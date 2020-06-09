import * as passport from 'passport'
import {Strategy as JWTStrategy, ExtractJwt} from 'passport-jwt'
import {AUTH_SECRET} from '../utils/constants'
import {RequestToken} from '../utils/interfaces'
import User from './users'
var jwtOpt = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: AUTH_SECRET,
  passReqToCallback: true
}
passport.use(new JWTStrategy(jwtOpt, (req: RequestToken, payload: any, done: any) => {
  //@ts-ignore
  const accessToken = req.headers.authorization.split(' ')[1]
  new User()
    .verifyUserAccessToken(accessToken)
      .then((user) => {
  //   req.authPayload = payload
        return done(null, user)
      })
      .catch((err:Error) => {
        console.log('err.message: ', err.message)
        done(err.message, false, err.message)
      })
}))