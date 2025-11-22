import { INestApplication } from "@nestjs/common";
import { Types } from "mongoose";
import { OrderService } from "src/module/order";
import { OrderController } from "src/module/order/order.controller";
import { mockOrderBuilder, mockOrderItem } from "src/tests/__mocks__";
import { mockControllerApp } from "src/utils";
import request from "supertest"

const order = mockOrderBuilder({
    items: [mockOrderItem({
        productId: new Types.ObjectId().toString() as any
    })]
});

describe("Given OrderController (e2e) test", () => {
    let app: INestApplication;
    const orderServiceMock = {
        placeOrder: jest.fn(),
        findByUserId: jest.fn(),
        findById: jest.fn(),
        confirmOrder: jest.fn(),
    };

    beforeAll(async () => {
        app = await mockControllerApp({
            controller: [OrderController],
            providers: [
                {
                    provide: OrderService,
                    useValue: orderServiceMock
                }
            ]
        })
        await app.init();
    });

    afterAll(() => {
        app.close();
    })

    describe("Given route GET /order/user/:id, When hit", () => {
        test("Then it should call respective method and return proper response", async () => {
            orderServiceMock.findByUserId.mockResolvedValue([]);
            const res = await request(app.getHttpServer())
                .get("/order/user/123")
                .expect(200).expect([]);
            expect(orderServiceMock.findByUserId).toHaveBeenCalledWith("123");
            return res;
        })
    })

    describe("Given route GET /order/id, When hit", () => {
        describe("And invalid id is passed", () => {
            test("Then it should throw proper exception", async () => {
                const res = await request(app.getHttpServer())
                    .get("/order/id")
                    .expect(400).expect({
                        message: "Invalid ObjectId: 'id' is not a valid MongoDB ObjectId",
                        error: 'Bad Request',
                        statusCode: 400
                    });
                return res;
            })
        })

        describe("And valid id is passed", () => {
            test("Then it should call respective metho", async () => {
                const id = new Types.ObjectId();
                const stringifiedId = id.toString();
                orderServiceMock.findById.mockResolvedValue(order);
                const res = await request(app.getHttpServer())
                    .get(`/order/${id}`).expect(200).expect(order);
                expect(orderServiceMock.findById).toHaveBeenCalledWith(id);
                return res;
            })
        })
    })

    describe("Given route POST /order", () => {
        test("Then it should create order", async () => {
            orderServiceMock.placeOrder.mockResolvedValue(order);
            const res = await request(app.getHttpServer())
                .post("/order")
                .expect(201).expect(order);
            return res;
        })
    })

    describe("Given route POST /oder/:id/checkout", () => {
        test("Then it should call respective method", async () => {
            const id = new Types.ObjectId();
            orderServiceMock.confirmOrder.mockResolvedValue(order);
            const res = await request(app.getHttpServer())
                .put(`/order/${id}/checkout`).send({
                    userId: "123"
                })
                .expect(200).expect(order);
            expect(orderServiceMock.confirmOrder).toHaveBeenCalledWith(id, {
                userId: "123"
            });
            return res;
        })
    })
})