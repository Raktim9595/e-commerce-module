import { HttpException } from "@nestjs/common";

type Args = {
    message: string,
    status: number,
    exception: new (...args: any[]) => HttpException;
}

export const testExceptionHelper = async (fn: any, { message, status, exception }: Args) => {
    await expect(fn).rejects.toBeInstanceOf(exception);
    await expect(fn).rejects.toMatchObject({
        message,
        status
    })
}