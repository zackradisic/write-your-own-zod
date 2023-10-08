import { expect } from "bun:test";
import { z } from ".";

const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
});

const product = {
  id: 123,
  name: "Product Name",
  price: 24.99,
};

const parsed = ProductSchema.parse(product);

expect(parsed).toEqual(product);
