export const VALIDATION_ERRORS = { // '-p' is for errors with parameters (like min length)
  0: 'Поле не должно быть пустым',  
  '1-p': p => `Поле должно содержать не менее ${p} символов`
}
export const VALIDATION_ERRORS_ALL = {
  0: 'Заполните обязательные поля',
  '1-p': p => `Не все поля удовлетворяют минимальному количеству символов`
}

export const AUTH_GET_TOKEN_ERRORS = {
  401: `Пользователя с такими данными не существует`
}