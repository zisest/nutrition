export const VALIDATION_ERRORS = { // '-p' is for errors with parameters (like min length)
  0: 'This field should not be empty',  
  '1-p': p => `The value should be at least ${p} characters long`
}
export const VALIDATION_ERRORS_ALL = {
  0: 'Required fields should not be empty',
  '1-p': p => `Value(s) of some field(s) is not long enough`
}

export const AUTH_GET_TOKEN_ERRORS = {
  401: `Provided credentials don't match any registered users`
}