import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { ZodError } from "zod";

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse();

        if (exception instanceof HttpException) {
            response.status(exception.getStatus()).json({
                error: exception.getResponse(),
            });
            return;
        }

        if (exception instanceof ZodError) {
            const message = () => {
                if (!JSON.parse(exception.message)) return 'Validation error';
                const field = JSON.parse(exception.message)[0]?.path[0] || '';
                const message = JSON.parse(exception.message)[0]?.message || '';
                return `${field} - ${message}`;
            };
            response.status(400).json({
                error: message(),
            });
            return;
        }

        response.status(500).json({
            error: exception?.message || "Server error!",
        });
    }
}