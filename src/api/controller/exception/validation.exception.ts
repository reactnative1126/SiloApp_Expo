export class ValidationException extends Error {

  messages: {[key: string]: string} = {};

  constructor(messages: {[key: string]: string}) {
    super();
    this.messages = messages;
  }

  addKeyMessage(key: string, message: string) {
    this.message[key] = message;
  }
}
