import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { CartController } from "src/module/cart/cart.controller";
import { CartService } from "src/module/cart/cart.service";
import { mockControllerApp } from "src/utils";
import { mockCartBuilder } from "src/tests/__mocks__";
import { Types } from "mongoose";

const cart = mockCartBuilder({
    items: [{
        product: "1" as any,
        quantity: 10
    }]
});

describe("CartController (e2e)", () => {
    let app: INestApplication;
    let cartServiceMock = {
        addItem: jest.fn(),
        findByUserId: jest.fn(),
        findById: jest.fn(),
    };

    beforeAll(async () => {

        app = await mockControllerApp({
            controller: [CartController],
            providers: [
                {
                    provide: CartService,
                    useValue: cartServiceMock
                }
            ]
        })
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe("Given POST /cart route, When called", () => {
        test("Then it should call respective method and return proper response", async () => {
            cartServiceMock.addItem.mockResolvedValue(cart);
            const body = {
                productId: "1",
                quantity: 10,
                userId: "123"
            }
            const res = await request(app.getHttpServer())
                .post("/cart")
                .send(body)
                .expect(201)
                .expect(cart);
            expect(cartServiceMock.addItem).toHaveBeenCalledWith(body)
            return res;
        })
    })

    describe("Given GET /cart/user/:id route, When called", () => {
        describe("And valid user id is passed", () => {
            test("Then it should return proper response", async () => {
                cartServiceMock.findByUserId.mockResolvedValue(cart);
                const res = await request(app.getHttpServer())
                    .get("/cart/user/123")
                    .expect(200).expect(cart);
                expect(cartServiceMock.findByUserId).toHaveBeenCalledWith("123")
                return res;
            })
        })
    });

    describe("Given GET /cart/:id route, When called", () => {
        describe("And valid cart id is passed", () => {
            test("Then it should return proper response", async () => {
                const cartId = new Types.ObjectId().toHexString();

                cartServiceMock.findById.mockResolvedValue(cart);

                const res = await request(app.getHttpServer())
                    .get(`/cart/${cartId}`)
                    .expect(200)
                    .expect(cart);

                const [[arg]] = cartServiceMock.findById.mock.calls;

                expect(arg instanceof Types.ObjectId).toBe(true);
                expect(arg.toString()).toStrictEqual(cartId);

                return res;
            })
        })

        describe("And invalid cart id is passed", () => {
            test("Then it should throw exception", async () => {
                const cartId = "1";
                return request(app.getHttpServer())
                    .get(`/cart/${cartId}`)
                    .expect(400).expect({
                        message: "Invalid ObjectId: '1' is not a valid MongoDB ObjectId",
                        error: 'Bad Request',
                        statusCode: 400
                    });
            })
        })
    });
});
