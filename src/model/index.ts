export class BaseResponse<T = any> {
    data?: T;
    error?: any;
}

export class Todo {
    id: string;
    content: any;
    isCheck: boolean;
    checkedAt: any;
}