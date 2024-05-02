export interface ServiceResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export function getAuthErrorResponse(): ServiceResponse<void> {
  return getErrorResponse('You are not authorized to perform that action.');
}

export function getErrorResponse(message: string): ServiceResponse<void> {
  return {
    success: false,
    message,
  };
}

export function getSuccessResponse<T>(obj?: T): ServiceResponse<T> {
  const response = {
    statusCode: 200,
    success: true
  };
  if (obj) {
    response['data'] = obj;
  }
  return response;
}

export enum Environment {
  PROD = 'prod',
  DEV = 'dev',
}
