/*  eslint-disable @typescript-eslint/no-explicit-any */
import type { Product } from "../../models/products";
import { ProductSchema } from "../../models/products";

import { injectable } from "inversify";
import type { ProductInterface } from "@interfaces/productInterface/productInterface";
import getSequelizeContext from "../sequelize";

@injectable()
export class ProductsAdapter implements ProductInterface {
  async getAllProduct(): Promise<Product[]> {
    const { sequelize } = await getSequelizeContext();

    const productData = await sequelize.models.products.findAll();

    try {
      const users = productData.map((sequelizeUser: any) => {
        ProductSchema.validateSync(sequelizeUser);

        return sequelizeUser;
      });

      return users;
    } catch (error) {
      console.log(error);
    }
    return productData;
  }

  async getProductById(productKey: string): Promise<Product> {
    const { sequelize } = await getSequelizeContext();
    const productData = await sequelize.models.products.findByPk(productKey);
    if (!productData) {
      throw new Error("Invalid product id");
    }
    ProductSchema.validateSync(productData);

    return productData;
  }

  async updateProductById(
    productKey: string,
    updateProductByid: Partial<Product>
  ): Promise<void> {
    const { sequelize } = await getSequelizeContext();

    await ProductSchema.validate(updateProductByid);
    const productData = await sequelize.models.products.update(
      updateProductByid,
      {
        where: {
          id: productKey,
        },
      }
    );

    if (!productData) {
      throw new Error("Invalid product id");
    }
  }

  async deleteProductById(productKey: string): Promise<Product> {
    console.log("Product id is: ", productKey);
    const { sequelize } = await getSequelizeContext();
    const productData = await sequelize.models.products.destroy({
      where: {
        id: productKey,
      },
    });
    if (!productData) {
      throw new Error("Invalid product id");
    }
    return productData;
  }

  async createProduct(data?: any): Promise<void> {
    const { sequelize } = await getSequelizeContext();
    try {
      await ProductSchema.validate(data);
      await sequelize.models.products.create(data);
    } catch (error: any) {
      console.log("Error found: ", error.message);
    }
  }
}
