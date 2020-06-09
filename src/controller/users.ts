
import Queries from '../utils/queries'
import UserModel from '../models/users'
import {default as IUserModel, IUserBody} from '../interfaces/users'
import Bcrypt from '../utils/bcrypt'
import JWTToken from '../utils/token'
import {AUTH_SECRET} from '../utils/constants'
export default class Users extends Queries<IUserModel> {
  private bcrypt:Bcrypt
  private jwt: JWTToken
  constructor () {
    super(UserModel)
    this.bcrypt = new Bcrypt(15)
    this.jwt = new JWTToken(AUTH_SECRET)
  }
  /**
   * add new user
   * @param userData 
   */
  public async addUser(userData: IUserBody) {
    const {
      mobileToken, password, username
    } = userData
    return this.getById(username)
      .catch(() => {
        return null
      })
      .then(async (user) => {
        try {
          if (user) {
            throw new Error('username already exists.')
          }
          const newUser = this.initilize({
            password: await this.bcrypt.hash(password),
            username,
            mobileToken,
          })
          newUser.save()
          // add logs
          return newUser
        } catch (err) {
          throw err
        }
      })
  }
  /**
   * update user data
   * @param userId 
   * @param userData 
   */
  public async updateUser(userId: string, userData: IUserBody) {
    try {
      const {
        mobileToken, password
      } = userData
      return this.getById(userId, true)
        .then(async (user) => {
          user.mobileToken = mobileToken
          user.password = await this.bcrypt.hash(password)
          user.save()
          // add logs
          return user
        })
    } catch (err) {
      throw err
    }
  }
  /**
   * update user data
   * @param userId 
   */
  public async removeUser(userId: string) {
    return this.getById(userId)
      .then(async (user) => {
        // removing without backup, on reality, always put on history or archive
        user.remove()
        // add logs
        return user
      })
  }
  /**
   * get user by id
   * @param userId 
   */  
  public getById (userId: string, showPassword: boolean = false) {
    return UserModel.findOne({
      $or: [
        {
          _id: userId.toString().trim()
        },
        {
          username: userId.toString().trim()
        },
      ]
    }, !showPassword ? {
      password: 0
    } : {})
    .then((user) => {
      if (!user) {
        throw new Error('No user info found.')
      }
      return user
    })
  }
  /**
   * get user by id
   * @param userId 
   */  
  public getByUsername (username: string) {
    return UserModel.findOne({
      username: username.toString()
    })
    .then((user) => {
      if (!user) {
        throw new Error('No user info found.')
      }
      return user
    })
  }
  /**
   * get user lists with pagination format
   * @param filters 
   */
  public getLists (filters: any) {
    return this.aggregateWithPagination([
    ], {...filters}, ['username'])
  }

  /**
   * authenticate user
   */
  public authenticateUser (username: string, password: string) {
    return this.getByUsername(username)
      // to ignore the first validation on finding username
      .catch(() => null)
      .then(async (user) => {
        if (!user || !(this.bcrypt.compareSync(password, user.password))) {
          throw new Error('Invalid credentials.')
        }
        const _user = user.toJSON()
          return {
            user: _user,
            // 15 minutes token expiry
            accessToken: this.jwt.generate({userId: _user._id}, 15).token
          }
      })
  }
  /**
   * authenticate user
   */
  public verifyUserAccessToken (token: string) {
    return this.jwt.verify(token)
      .then((decoded: any) => {
        return this.getById(decoded.userId)
          .then((user) => {
            return {
              user: user.toJSON(),
              accessToken: token
            }
          })
      })
  }
}