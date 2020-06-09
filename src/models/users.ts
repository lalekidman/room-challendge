import IUserModel from '../interfaces/users'
import {CollectionDefaultField} from './general'
import {model, Schema} from 'mongoose'
const CollectionSchema = {
  ...CollectionDefaultField,
  username: {
    type: String,
    default: '',
    required: true
  },
  password: {
    type: String,
    default: '',
    required: true
  },
  mobileToken: {
    type: String,
    default: '',
    required: false
  }
}
const UserModel = model<IUserModel>('users', new Schema(CollectionSchema))
export default UserModel