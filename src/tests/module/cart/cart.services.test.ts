import { ProductService } from "src/module/product";
import { CartRepository, CartService } from "src/module/cart";
import { Test, TestingModule } from "@nestjs/testing";
import { mockDeep } from "jest-mock-extended";
import { mockCartBuilder, mockProductBuilder } from "src/tests/__mocks__";
import { ProductType } from "src/module/product/model";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { testExceptionHelper } from "src/utils";
import { Types } from "mongoose";

const mockCartWithMultipleProducts = {
    items: [{
        product: mockProductBuilder(),
        quantity: 10,
    },
    {
        product: mockProductBuilder({
            brand: "Apple",
            type: ProductType.GADGETS,
            _id: "10"
        }),
        quantity: 10,
    }],
    userId: '1'
} as any

const mockCart = mockCartBuilder();

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
        test("Then it should call the respective repository method and return proper values", async () => {
            cartRepo.findById = jest.fn().mockResolvedValue(mockCart);
            const cart = await service.findById("123");
            expect(cartRepo.findById).toHaveBeenCalledWith("123");
            expect(cart).toEqual(mockCart);
        })
    })

    describe("Given findByUserId, When called", () => {
        test("Then it should call the respective repository method and return proper values", async () => {
            cartRepo.findByUserId = jest.fn().mockResolvedValue(mockCart);
            const cart = await service.findByUserId("userId");
            expect(cartRepo.findByUserId).toHaveBeenCalledWith("userId");
            expect(cart).toEqual(mockCart);
        })
    })

    describe("Given clearCart, When called", () => {
        test("Then it should call the respective repository method and delete the respective cart", async () => {
            await service.clearCart("userId");
            expect(cartRepo.clearCart).toHaveBeenCalledWith("userId");
        })
    })

    describe("Given findByUserAndId, When called", () => {
        test("Then it should call the respective repository method and return proper values", async () => {
            cartRepo.findByIdAndUserId = jest.fn().mockResolvedValue(mockCart);
            const cart = await service.findByUserAndId("cartId", "userId");
            expect(cartRepo.findByIdAndUserId).toHaveBeenCalledWith("cartId", "userId");
            expect(cartRepo.findById).not.toHaveBeenCalled();
            expect(cart).toEqual(mockCart);
        })
    })

    describe("Given getCurrentCartItems, When called", () => {
        test("Then it should call the respective repository method and return proper values", async () => {
            cartRepo.findByUserId = jest.fn().mockResolvedValue(mockCartWithMultipleProducts);
            const cart = await (service as any).getCurrentCartItems("userId");
            expect(cartRepo.findByUserId).toHaveBeenCalledWith("userId");
            expect(cart).toStrictEqual([
                {
                    product: "1",
                    quantity: 10,
                }, {
                    product: "10",
                    quantity: 10
                }
            ])
        })
    })

    describe("Given addItem, When called", () => {
        describe("And quantity less than zero is passed", () => {
            test("Then it should throw bad request exception with error message", async () => {
                const addItemPromise = service.addItem({
                    productId: "1",
                    quantity: -1,
                    userId: "user"
                })
                await testExceptionHelper(addItemPromise, {
                    message: "Quantity must not be smaller than zero",
                    status: 400,
                    exception: BadRequestException
                })
            })
        })

        describe("And product doesnot exist for the product id", () => {
            test("Then it should throw not found exception with error message", async () => {
                productService.findById = jest.fn().mockResolvedValue(null);
                const addItemPromise = service.addItem({
                    productId: "1",
                    quantity: 1,
                    userId: "user"
                })
                await testExceptionHelper(addItemPromise, {
                    message: "Product not found or not available",
                    status: 404,
                    exception: NotFoundException
                })
            })
        })

        describe("And product found is not listed for active", () => {
            test("Then it should throw not found exception with error message", async () => {
                productService.findById = jest.fn().mockResolvedValue(mockProductBuilder({
                    isActive: false
                }));
                const addItemPromise = service.addItem({
                    productId: "1",
                    quantity: 1,
                    userId: "user"
                })
                await testExceptionHelper(addItemPromise, {
                    message: "Product not found or not available",
                    status: 404,
                    exception: NotFoundException
                })
            })
        })

        describe("And product found has less stock than the quantity ordered", () => {
            test("Then it should throw bad request exception with error message", async () => {
                productService.findById = jest.fn().mockResolvedValue(mockProductBuilder({
                    stock: 4
                }));
                const addItemPromise = service.addItem({
                    productId: "1",
                    quantity: 6,
                    userId: "user"
                })
                await testExceptionHelper(addItemPromise, {
                    message: "Not enough stock",
                    status: 400,
                    exception: BadRequestException
                })
            })
        })

        describe("And cart is empty", () => {
            test("Then it should call respected repository method with proper values", async () => {
                cartRepo.findByUserId = jest.fn().mockResolvedValue([]);
                const product = mockProductBuilder({
                    _id: new Types.ObjectId().toHexString(),
                    stock: 100
                })
                cartRepo.updateCart = jest.fn().mockResolvedValue(mockCart);

                productService.findById = jest.fn().mockResolvedValue(product);
                const res = await service.addItem({
                    productId: product._id,
                    quantity: 3,
                    userId: "user"
                })

                expect(productService.findById).toHaveBeenCalledWith(product._id);
                expect(cartRepo.findByUserId).toHaveBeenCalledWith("user")

                expect(cartRepo.updateCart).toHaveBeenCalledWith("user", [{
                    product: new Types.ObjectId(product._id),
                    quantity: 3
                }])

                expect(res).toStrictEqual(mockCart)
            })
        })

        describe("And cart is not empty", () => {
            describe("And product is not present in the cart", () => {
                test("Then it should add product to the cart", async () => {
                    const cart = mockCartBuilder();
                    cartRepo.findByUserId = jest.fn().mockResolvedValue(cart);
                    const product = mockProductBuilder({
                        _id: new Types.ObjectId().toHexString(),
                        stock: 100
                    })
                    productService.findById = jest.fn().mockResolvedValue(product);
                    cartRepo.updateCart = jest.fn().mockResolvedValue(mockCart);

                    const res = await service.addItem({
                        productId: product._id,
                        quantity: 3,
                        userId: "1"
                    })

                    expect(productService.findById).toHaveBeenCalledWith(product._id);
                    expect(cartRepo.findByUserId).toHaveBeenCalledWith("1")

                    expect(cartRepo.updateCart).toHaveBeenCalledWith("1", expect.arrayContaining([{
                        product: new Types.ObjectId(cart.items[0].product),
                        quantity: cart.items[0].quantity
                    }, {
                        product: new Types.ObjectId(product._id),
                        quantity: 3
                    }]))
                    expect(res).toStrictEqual(mockCart)
                })
            })

            describe("And product is available in the cart", () => {
                test("Then it should update the quantity of the product in the cart", async () => {
                    const cart = mockCartBuilder();
                    cartRepo.findByUserId = jest.fn().mockResolvedValue(cart);
                    const product = mockProductBuilder({
                        _id: cart.items[0].product.toHexString(),
                        stock: 100
                    })
                    productService.findById = jest.fn().mockResolvedValue(product);
                    cartRepo.updateCart = jest.fn().mockResolvedValue(mockCart);

                    const res = await service.addItem({
                        productId: product._id,
                        quantity: 5,
                        userId: "1"
                    })

                    expect(productService.findById).toHaveBeenCalledWith(product._id);
                    expect(cartRepo.findByUserId).toHaveBeenCalledWith("1")

                    expect(cartRepo.updateCart).toHaveBeenCalledWith("1", expect.arrayContaining([{
                        product: new Types.ObjectId(cart.items[0].product),
                        quantity: 5,
                    }]))
                    expect(res).toStrictEqual(mockCart)
                })
            })
        })
    })

})