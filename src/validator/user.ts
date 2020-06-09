import {body} from 'express-validator'
export const userPostFormValidationPipeline = [
  body('username')
    .isString()
    // didn't added more validation since the logic implementation already here.
    .withMessage('username must be a string'),
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