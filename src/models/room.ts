import IRoomModel from '../interfaces/room'
import {CollectionDefaultField} from './general'
import {model, Schema} from 'mongoose'

const ParticipantSchema = new Schema({
  userId: {
    type: String,
    default: '',
    required: true
  },
  joinedAt: {
    type: Number,
    default: 0
  },
  isHost: {
    type: Boolean,
    default: false
  },
  hostedAt: {
    type: Number,
    default: 0,
  }
}, {
  _id: false
})

const CollectionSchema = {
  ...CollectionDefaultField,
  name: {
    type: String,
    default: '',
    required: true
  },
  referenceId: {
    type: String,
    default: '',
    required: true,
    unique: true
  },
  participantLimit: {
    type: Number,
    default: 0
  },
  participants: [ParticipantSchema],
  createdBy: {
    type: String,
    default: 0
  }
}
const RoomModel = model<IRoomModel>('rooms', new Schema(CollectionSchema))
export default RoomModel