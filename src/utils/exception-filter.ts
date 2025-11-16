import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                // e.g. throw new BadRequestException('Invalid data')
                message = res;
            } else if (typeof res === 'object' && res !== null) {
                const r: any = res;

                // Prefer "message" field if exists (ValidationPipe, custom HttpException)
                if (r.message) {
                    message = r.message; // can be string or string[]
                } else if (r.error) {
                    message = r.error;
                } else {
                    message = r; // fallback: whole object
                }
            }
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,    // 👈 clean, extracted message (string or array)
            data: null, // 👈 keep consistent with success response shape
        });
    }
}
