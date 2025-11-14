export class ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: any;

  constructor(init: Partial<ApiResponse<T>>) {
    Object.assign(this, init);
  }

  static ok<T>(data: T, message = 'OK', statusCode = 200): ApiResponse<T> {
    return new ApiResponse<T>({ success: true, statusCode, message, data });
  }

  static created<T>(data: T, message = 'Created'): ApiResponse<T> {
    return new ApiResponse<T>({ success: true, statusCode: 201, message, data });
  }

  static accepted<T>(data: T, message = 'Accepted'): ApiResponse<T> {
    return new ApiResponse<T>({ success: true, statusCode: 202, message, data });
  }

  static fail(message: string, statusCode = 500, error?: any): ApiResponse<null> {
    return new ApiResponse<null>({ success: false, statusCode, message, error });
  }
}

