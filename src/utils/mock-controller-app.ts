import { Test } from "@nestjs/testing";

export const mockControllerApp = async ({
    controller,
    providers
}: {
    controller: any,
    providers: {
        provide: any,
        useValue: any
    }[]
}) => {
    const moduleRef = await Test.createTestingModule({
        controllers: controller,
        providers,
    })
        .compile();

    return moduleRef.createNestApplication();
}