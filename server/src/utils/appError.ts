
export class AppError extends Error {
    public readonly statusCode:number;
    constructor(ms:string,statusCode:number){
        super(ms);
        this.statusCode = statusCode;
    }
}

export class InternalError extends AppError {
    constructor(ms:string){
        super(ms,500);
    }
}
export class UnauthorizedError extends AppError {
    constructor(ms:string){
        super(ms,401);
    }
}

export class UnRegisterError extends AppError {
    constructor(ms:string){
        super(ms,403);
    }
}
export class NotFoundError extends AppError {
    constructor(ms:string){
        super(ms,404);
    }
}
export class BadInputError extends AppError {
    constructor(ms:string){
        super(ms,400);
    }
}
export class PageNotFoundError extends AppError {
    constructor(ms:string){
        super(ms,404);
    }
}
export class WrongValidation extends AppError {
    constructor(ms:string){
        super(ms,401);
    }
}