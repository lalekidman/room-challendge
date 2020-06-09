import {ICollectionDefault} from './general'
import {Document} from 'mongoose'
export interface IUserBody {
  username: string
  password: string
  mobileToken: string
}

export default interface IUserModel extends Document, ICollectionDefault, IUserBody {}