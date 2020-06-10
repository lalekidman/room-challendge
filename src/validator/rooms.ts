import {body} from 'express-validator'
export const roomPostFormValidationPipeline = [
  body('name')
    .isString()
    // didn't added more validation since the logic implementation already here.
    .withMessage('username must be a string'),
  body('participantLimit')
    .isNumeric()
    .withMessage('participantLimit must be a numeric.'),
    // didn't added more validation since the logic implementation already here.
]
export const userPatchFormValidationPipeline = [
  body('password')
    .isString()
    // didn't added more validation since the logic implementation already here.
    .withMessage('username must be a string'),
  body('mobile_token')
    .isString()
    .optional()
    // didn't added more validation since the logic implementation already here.
    .withMessage('username must be a string')
]