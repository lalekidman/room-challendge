
import Queries from '../utils/queries'
import RoomModel from '../models/room'
import IUserModel, {default as IRoomModel, IRoomBody} from '../interfaces/room'
import * as RS from 'randomstring'
interface IRoomData {
  name: string
  participantLimit?: number
}
export default class Users extends Queries<IRoomModel> {
  constructor () {
    super(RoomModel)
  }
  /**
   * add new room
   * @param userData 
   */
  public async addRoom(roomData: IRoomData, user: IUserModel) {
    const {
      participantLimit = 5, name = ''
    } = roomData
    return this.generateReferenceId()
      .then(async (referenceId) => {
        if (participantLimit <= 0) {
          throw new Error('participantLimit must be a greater than 0.')
        }
        try {
          const newRoom = this.initilize<IRoomBody>({
            displayName: name,
            name,
            participantLimit,
            referenceId,
            createdBy: user._id,
            participants: [{
              hostedAt: Date.now(),
              isHost: true,
              joinedAt: Date.now(),
              userId: user._id
            }]
          })
          newRoom.save()
          // add logs
          return newRoom
        } catch (err) {
          throw err
        }
      })
  }
  /**
   * change the host of current room
   * @param roomId
   * @param user 
   */
  public changeHost (roomId: string, newHostId: string, user: IUserModel) {
    return this.getById(roomId)
      .then(async (room) => {
        const newHostIndex = room.participants.findIndex((participant) => participant.userId === newHostId)
        const currentHostIndex = room.participants.findIndex((participant) => participant.userId === user._id)
        if (newHostIndex === -1) {
          throw new Error('userId is currently not participants for this room.')
        }
        if (currentHostIndex === -1) {
          throw new Error('Unable to perform this action. You are not participants of this room.')
        }
        if (!room.participants[currentHostIndex].isHost) {
          throw new Error('Unable to perform change host. You must be the host of the room before you perform this action. Thank you.')
        }
        // didnt use the user object to find the index on participants array
        // set all participants host status to false to make sure that only 1 participant can be host on every single room.
        // convert toJSON to convert the room to ordinary object.
        room.participants = room.toJSON().participants.map((participant: any) => ({...participant, isHost: false}))
        room.participants[newHostIndex].hostedAt = Date.now()
        room.participants[newHostIndex].isHost = true
        await room.save()
        // add some logs of someting
        return room
      })
  }
  /**
   * join to the room
   * @param roomId 
   * @param user 
   */
  public joinToRoom (roomId: string, user: IUserModel) {
    return this.getById(roomId)
      .then((room) => {
        if (room.participants.length >= room.participantLimit) {
          throw new Error('rooom reached its limit. Please try again to other room. Thank you.')
        }
        const newParticipantIndex = room.participants.findIndex((participant) => participant.userId === user._id)
        if (newParticipantIndex === -1) {
          room.participants.push({
            hostedAt: 0,
            isHost: false,
            joinedAt: Date.now(),
            userId: user._id
          })
          room.participantLimit +=1
          room.save()
          // add some logs
        }
        // didnt throw errors if the user is already in participants.
        return room
      })
  }
  /**
   * leave to the room
   * @param roomId 
   * @param user 
   */
  public leaveToRoom (roomId: string, user: IUserModel) {
    return this.getById(roomId)
      .then((room) => {
        const userIndex = room.participants.findIndex((participant) => participant.userId === user._id)
        if (userIndex === -1) {
          throw new Error(`You are not participant to leave to this room.`)          
        }
        if (room.participants.length === 1) {
          // check if the room participants is only 1, then if true, remove the room.
          // move to history but for now, just remove it.
          return room.remove()
        }
        const removedParticipant = room.participants[userIndex]
        room.participants.splice(userIndex, 1)
        if (removedParticipant.isHost) {
          var newHostIndex = -1
          const newHost = <any> {joinedAt: Date.now()}
          for (let x = 0; x<room.participants.length; x++) {
            if (room.participants[x].joinedAt < newHost.joinedAt) {
              newHostIndex = x
            }
          }
          console.log(' >>> newHostIndex', newHostIndex)
          if (newHostIndex >= 0) {
            room.participants[newHostIndex].isHost = true
          } else {
            // just make host the first participants
            room.participants[0].isHost = true
          }
        }
        room.save()
       // add some logs
        return room
      })
  }
  /**
   * generate referenceId for the room
   */
  public generateReferenceId (): Promise<string> {
    const referenceId = RS.generate({
      charset: 'alphanumeric', 
      capitalization: 'uppercase',
      length: 25
    })
    return RoomModel.findOne({
      referenceId
    })
    .sort({
      createdAt: -1
    })
    .then((rooms) => {
      if (rooms) {
        // if referenceId is existing, try to generate again until its become unique.
        return this.generateReferenceId()
      }
      return referenceId
    })
  }
  /**
   * 
   * @param id roomId or referenceId
   */
  public getById(id: string) {
    return RoomModel.findOne({
      $or: [
        {
          _id: id.toString()
        },
        {
          referenceId: id.toString()
        }
      ]
    })
    .then((room) => {
      if (!room) {
        throw new Error('No room info found.')
      }
      return room
    })
  }
  /**
   * get roomList
   */
  public getRoomList (filters: any) {
    const {} = filters
    return this.aggregateWithPagination([
      {
        $unwind: {
          preserveNullAndEmptyArrays: true,
          path: '$participants'
        }
      },
      {
        $lookup: {
          from: 'users',
          let: {
            participant: '$participants'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$participant.userId']
                }
              }
            },
            {
              $sort: {
                _id: 1
              }
            },
            // {
            //   $limit: 1
            // },
            {
              $project: {
                _id: 1,
                username: 1
              }
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: ['$$ROOT', '$$participant']
                }
              }
            }
          ],
          as: "participant"
        }
      },
      {
        $unwind: {
          preserveNullAndEmptyArrays: true,
          path: '$participant'
        }
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            name: "$name",
            displayName: "$displayName",
            participantLimit: "$participantLimit",
            createdAt: "$createdAt"
          },
          participants: {
            $push: '$participant'
          }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$$ROOT', '$_id']
          }
        }
      }
    ], {...filters}, ['name', 'participants.username'])
  }
}