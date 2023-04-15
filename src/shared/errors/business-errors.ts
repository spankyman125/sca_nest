export class EntityNotFoundError extends Error {
  message: string = "Object not found";
  name: string = "NotFoundError";
}

export class ForbiddenError extends Error {
  message: string = "Action forbidden";
  name: string = "ForbiddenError";
}

export class UnprocessableEntityError extends Error {
  message: string = "Wrong data provided";
  name: string = "UnprocessableEntityError";
}

export class UsernameExists extends Error {
  message: string = "Username already exists";
  name: string = "UsernameExists";
}