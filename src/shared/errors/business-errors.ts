export class ObjectNotFound extends Error {
  constructor(message = 'Object not found') {
    super();
    this.message = message;
    this.name = 'ObjectNotFound';
  }
}
export class Forbidden extends Error {
  constructor(message = 'Action forbidden') {
    super();
    this.message = message;
    this.name = 'Forbidden';
  }
}
export class UnprocessableEntity extends Error {
  constructor(message = 'Wrong data provided') {
    super();
    this.message = message;
    this.name = 'UnprocessableEntity';
  }
}
