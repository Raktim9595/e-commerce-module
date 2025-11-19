import { Test } from "@nestjs/testing";

export const mockControllerApp = async ({
    controller,
    providers
}: {
    controller: any,
    providers: any
}) => {
    const moduleRef = await Test.createTestingModule({
        controllers: controller,
        providers,
    })
        .compile();

    const app = moduleRef.createNestApplication();
    await app.init();
    return app
}