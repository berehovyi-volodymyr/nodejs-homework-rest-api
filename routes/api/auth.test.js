const mongoose = require("mongoose");
const request = require("supertest");

const app = require("../../app");

const DB_HOST_TEST =
  "mongodb+srv://Volodymyr:adnDTkMf8c1UJX01@cluster0.jyvut9u.mongodb.net/contacts_book_test?retryWrites=true&w=majority";

describe("test signup", () => {
  let server = null;

  beforeAll(async () => {
    server = app.listen(3000);
    await mongoose.connect(DB_HOST_TEST);
  });

  afterAll(async () => {
    server.close();
    await mongoose.connection.close();
  });

  test("test route with correct data", async () => {
    const data = {
      email: "Volodymyr@gmail.com",
      password: "1234567",
    };

    const res = await request(app).post("/api/users/login").send(data);
    expect(res.statusCode).toBe(200);
    expect(Boolean(res.body.token)).toBe(true);
    expect(Object.keys(res.body.user)).toStrictEqual(["user", "subscription"]);
    expect(typeof res.body.user.user).toBe("string");
    expect(typeof res.body.user.subscription).toBe("string");
  });
});
