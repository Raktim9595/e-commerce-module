import { INestApplication } from "@nestjs/common";
import { CartModule, CartService } from "src/module/cart";
import request from "supertest";
import { mockDeep } from "jest-mock-extended";
import { Test } from "@nestjs/testing";
import { CartController } from "src/module/cart/cart.controller";
import { mockControllerApp } from "src/utils";

describe("CartController (e2e)", () => {
    let app: INestApplication;
    let cartService = {
        addItem: jest.fn(),
        findById: jest.fn(),
        findByUserId: jest.fn()
    }


    beforeAll(async () => {
        app = await mockControllerApp({
            controller: [CartController],
            providers: [{
                provide: CartService,
                useValue: cartService
            }]
        })
    });

    afterAll(async () => {
        await app.close()
    })


    it("GET /cart/user/:id", async () => {
        cartService.findById.mockResolvedValue({ id: "123" });
        request(app.getHttpServer())
            .get("/cart/user/123")
            .expect(200).expect({ id: "123" });
    });
});