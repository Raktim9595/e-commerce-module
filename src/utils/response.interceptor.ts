import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        return next.handle().pipe(
            map((data) => {
                // If controller returns { data, message }, extract it
                let payload = data;
                let message: string | null = null;

                if (
                    data &&
                    typeof data === 'object' &&
                    'data' in data &&
                    'message' in data
                ) {
                    payload = data.data;
                    message = data.message;
                }

                return {
                    statusCode: response.statusCode,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message,
                    data: payload ?? null,
                };
            }),
        );
    }
}
