import {ICollectionDefault} from './general'
import {Document} from 'mongoose'
export interface IParticipants {
  userId: string
  joinedAt: number
  hostedAt: number
  isHost: boolean
}
export interface IRoomBody {
  displayName: string
  name: string
  referenceId: string
  createdBy: string // userid
  participantLimit: number,
  participants: IParticipants[]
}

export default interface IRoomModel extends Document, ICollectionDefault, IRoomBody {}