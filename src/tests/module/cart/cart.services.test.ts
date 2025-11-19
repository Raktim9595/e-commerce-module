import { ProductService } from "src/module/product";
import { CartRepository, CartService } from "src/module/cart";
import { Test, TestingModule } from "@nestjs/testing";
import { mockDeep } from "jest-mock-extended";

describe("CartService Unit Test", () => {
    let service: CartService;
    let cartRepo: CartRepository;
    let productService: ProductService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartService,
                {
                    provide: CartRepository,
                    useValue: mockDeep<CartRepository>()
                },
                {
                    provide: ProductService,
                    useValue: mockDeep<ProductService>()
                }
            ]
        }).compile();

        service = module.get<CartService>(CartService);
        cartRepo = module.get<CartRepository>(CartRepository);
        productService = module.get<ProductService>(ProductService);
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    describe("Given findById, When called", () => {
        test("Then it should call the respective repository method and return proper", async () => {
            await service.findById("123");
            expect(cartRepo.findById).toHaveBeenCalledWith("123");
        })
    })
})