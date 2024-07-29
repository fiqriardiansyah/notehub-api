export class BaseResponse<T = any> {
    data?: T;
    error?: any;
}