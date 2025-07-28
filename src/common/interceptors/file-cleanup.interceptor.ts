import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ResourceService } from '../../resource/resource.service';

@Injectable()
export class FileCleanupInterceptor implements NestInterceptor {
  constructor(private readonly resourceService: ResourceService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>(); // Get the raw Express response object
    const file = request.file as Express.Multer.File;

    if (!file || !file.path) {
      return next.handle();
    }
    return next.handle().pipe(
      catchError(async (err) => {
        console.error(`Error in request pipeline for file ${file.path}. Attempting cleanup.`, err);
        // Perform file cleanup
        await this.resourceService.cleanupUploadedFile(file.path);

        // === CRITICAL FIX: Directly send the response for ALL errors here ===
        // This is the most aggressive way to ensure the response is sent by the interceptor.
        // It bypasses subsequent NestJS error handling.
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = 'Internal server error';
        let errorName: string | undefined = undefined;

        if (err instanceof HttpException) {
          status = err.getStatus();
          const errResponse = err.getResponse();
          message = 
          errorName = (typeof errResponse === 'object' && errResponse !== null) ? (errResponse as any).error || undefined : undefined;
        } else if (err instanceof Error) {
          message = err.message;
          errorName = err.name;
        }

        // Send the response directly using the raw Express response object
        // This will guarantee the status code and body are set.
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: message,
          error: errorName,
        });

        // Returning an empty observable or 'of()' prevents further propagation of the error
        // and signals that the response has been handled directly.
        // Using 'of()' with no value or 'of(null)' ensures the stream completes cleanly.
        return of(null); // Or just 'return of();' or 'return new Observable(subscriber => subscriber.complete());'
      }),
    );
  }
}