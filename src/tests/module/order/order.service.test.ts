// order.service.spec.ts
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { OrderService } from 'src/module/order/order.service';
import { OrderRepository } from 'src/module/order/order.repository';
import {
    Order,
    OrderItem,
    OrderStatus,
    PaymentProvider,
    PaymentStatus,
} from 'src/module/order/model';
import { Cart } from 'src/module/cart/model';
import { CartService } from 'src/module/cart/cart.service';
import { StripeService } from 'src/module/stripe';
import { mockCartBuilder, mockOrderBuilder, mockOrderItem, mockProductBuilder } from 'src/tests/__mocks__';
import { ProductType } from 'src/module/product/model';
import { testExceptionHelper } from 'src/utils';

const order: any = mockOrderBuilder();

describe('OrderService (unit)', () => {
    let service: OrderService;

    let orderRepo: jest.Mocked<OrderRepository>;
    let cartService: jest.Mocked<CartService>;
    let stripeService: jest.Mocked<StripeService>;
    let orderModel: jest.Mocked<Model<Order>>;

    beforeEach(() => {
        orderRepo = {
            createOrder: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
        } as any;

        cartService = {
            findByUserAndId: jest.fn(),
            clearCart: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
        } as any;

        stripeService = {
            client: {
                checkout: {
                    sessions: {
                        create: jest.fn(),
                    },
                },
            },
        } as any;

        orderModel = {
            findByIdAndUpdate: jest.fn(),
        } as any;

        service = new OrderService(orderRepo, cartService, stripeService, orderModel);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Given placeorder, When called', () => {
        describe("And cart is not empty", () => {
            test('Then it creates order and clears cart', async () => {
                const cart: Cart = mockCartBuilder();

                cartService.findByUserAndId.mockResolvedValue(cart);

                const prepared = {
                    items: [mockOrderItem(),
                    mockOrderItem({
                        lineTotal: 50,
                        quantity: 2,
                        pricePerUnit: 25,
                        productBrand: "Fila",
                        productId: new Types.ObjectId(),
                        productName: "T-Shirt",
                        productType: ProductType.CLOTHING
                    })
                    ],
                    totalAmount: 20,
                };

                const prepareSpy = jest
                    .spyOn<any, any>(service, 'prepareOrders')
                    .mockResolvedValue(prepared);

                orderRepo.createOrder.mockResolvedValue(order);

                const result = await service.placeOrder({
                    cartId: 'cart1',
                    userId: 'user1',
                    shippingAddress: 'addr',
                    notes: 'note',
                });

                expect(cartService.findByUserAndId).toHaveBeenCalledWith('cart1', 'user1');
                expect(prepareSpy).toHaveBeenCalledWith(cart);
                expect(orderRepo.createOrder).toHaveBeenCalledWith({
                    ...prepared,
                    userId: 'user1',
                    shippingAddress: 'addr',
                    notes: 'note',
                });
                expect(cartService.clearCart).toHaveBeenCalledWith('user1');
                expect(result).toBe(order);
            });
        })

        describe("And cart is empty", () => {
            test("Then it throws bad request exception with proper message", async () => {
                cartService.findByUserAndId.mockResolvedValue({
                    items: [],
                } as any);

                const preparePromise = service.placeOrder({
                    cartId: 'c1',
                    userId: 'u1',
                    shippingAddress: 'addr',
                    notes: '',
                });

                await testExceptionHelper(preparePromise, {
                    exception: BadRequestException,
                    message: 'Cart is empty',
                    status: 400,
                })
            })
        })

        describe("And cart is not found for the user", () => {
            test("Then it throws bad request exception with proper message", async () => {
                cartService.findByUserAndId.mockResolvedValue(null);

                const preparePromise = service.placeOrder({
                    cartId: 'c1',
                    userId: 'u1',
                    shippingAddress: 'addr',
                    notes: '',
                });

                await testExceptionHelper(preparePromise, {
                    exception: BadRequestException,
                    message: 'Cart is empty',
                    status: 400,
                })
            })
        })

    });

    describe('Given prepareOrders, When called', () => {
        test('Then it builds items and reduces stock', async () => {
            const cart: Cart = {
                items: [
                    {
                        product: mockProductBuilder({
                            _id: 'p1',
                            name: 'P1',
                            brand: 'B',
                            type: ProductType.ACCESSORIES,
                            price: 15,
                            stock: 10,
                            isActive: true,
                        }),
                        quantity: 2,
                    },
                ],
            } as any;

            const result = await (service as any).prepareOrders(cart);

            expect(result.totalAmount).toBe(30);
            expect(result.items).toHaveLength(1);
            expect(result.items[0]).toMatchObject({
                productName: 'P1',
                quantity: 2,
                pricePerUnit: 15,
                lineTotal: 30,
            });
            // stock should be decreased
            expect((cart.items[0].product as any).stock).toBe(8);
        });

        it('throws if product inactive', async () => {
            const cart: Cart = {
                items: [
                    {
                        product: {
                            isActive: false,
                        } as any,
                        quantity: 1,
                    },
                ],
            } as any;

            await expect((service as any).prepareOrders(cart)).rejects.toBeInstanceOf(
                NotFoundException,
            );
        });

        it('throws if not enough stock', async () => {
            const cart: Cart = {
                items: [
                    {
                        product: {
                            isActive: true,
                            stock: 1,
                            price: 10,
                            name: 'P',
                        } as any,
                        quantity: 3,
                    },
                ],
            } as any;

            await expect((service as any).prepareOrders(cart)).rejects.toBeInstanceOf(
                BadRequestException,
            );
        });
    });

    describe('Given confirmOrder, When called', () => {
        test('Then it creates stripe session and updates order', async () => {
            const order: Order = mockOrderBuilder({
                _id: "123",
            })

            orderRepo.findById.mockResolvedValue(order as any);

            const stripeSession = {
                id: 'sess_123',
                url: 'https://checkout.test/session/sess_123',
            };

            (stripeService.client.checkout.sessions.create as jest.Mock).mockResolvedValue(
                stripeSession,
            );

            const updateSpy = jest
                .spyOn<any, any>(service, 'updateOrderInfo')
                .mockResolvedValue(undefined);

            const result = await service.confirmOrder('order1', { userId: 'u1' });

            expect(orderRepo.findById).toHaveBeenCalledWith('order1');
            expect(
                stripeService.client.checkout.sessions.create as jest.Mock,
            ).toHaveBeenCalled();
            expect(updateSpy).toHaveBeenCalledWith('order1', 'sess_123');
            expect(result).toEqual({ checkoutUrl: stripeSession.url });
        });

        describe("And order is not found", () => {
            test("Then it throws not found exception", async () => {
                orderRepo.findById.mockResolvedValue(null);
                const orderPromise = service.confirmOrder('order1', { userId: 'u1' })
                await testExceptionHelper(orderPromise, {
                    exception: NotFoundException,
                    message: 'Order not found',
                    status: 404
                })
            }
            )
        })

        describe("And order is already paid", () => {
            test("Then it throws bad request exception", async () => {
                const order: any = mockOrderBuilder({
                    _id: "o1",
                    paymentStatus: PaymentStatus.SUCCESS,
                })
                orderRepo.findById.mockResolvedValue(order);
                const orderPromise = service.confirmOrder('order1', { userId: 'u1' })
                await testExceptionHelper(orderPromise, {
                    exception: BadRequestException,
                    message: 'Order has already been paid',
                    status: 400
                })
            })
        })

        describe("And order does not contain any items", () => {
            test("Then it throws bad request exception", async () => {
                const order: any = mockOrderBuilder({
                    _id: "o1",
                    items: [],
                })
                orderRepo.findById.mockResolvedValue(order);
                const orderPromise = service.confirmOrder('order1', { userId: 'u1' })
                await testExceptionHelper(orderPromise, {
                    exception: BadRequestException,
                    message: 'No items in order to be paid',
                    status: 400
                })
            })
        })
    });

    describe('Given completeOrder, When called', () => {
        test('Then it updates order to paid', async () => {
            (orderModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(undefined);

            await service.completeOrder('order1');

            expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith('order1', {
                paymentStatus: PaymentStatus.SUCCESS,
                status: OrderStatus.PAID,
            });
        });
    });

    describe('findById / findByUserId', () => {
        test('findById delegates to repository', async () => {
            orderRepo.findById.mockResolvedValue({ id: 'o1' } as any);
            const res = await service.findById('o1');
            expect(orderRepo.findById).toHaveBeenCalledWith('o1');
            expect(res).toEqual({ id: 'o1' });
        });

        test('findByUserId delegates to repository', async () => {
            orderRepo.findByUserId.mockResolvedValue([{ id: 'o1' }] as any);
            const res = await service.findByUserId('u1');
            expect(orderRepo.findByUserId).toHaveBeenCalledWith('u1');
            expect(res).toEqual([{ id: 'o1' }]);
        });
    });
});
