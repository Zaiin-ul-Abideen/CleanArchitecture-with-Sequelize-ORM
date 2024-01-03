import type { Customer } from "../../models/customers";
import { CustomerSchema } from "../../models/customers";
import { injectable } from "inversify";
import type { CustomerInterface } from "@interfaces/customerInterface/customerInterface";
import getSequelizeContext from "../sequelize";
import { Transaction, Op } from "sequelize";
import type {
  PaginatedResults,
  PaginatedSearchConfiguration,
} from "../../utilities/constants/types/pagination";
@injectable()
export class CustomersAdapter implements CustomerInterface {
  async getAllCustomer(): Promise<Customer[]> {
    const { sequelize } = await getSequelizeContext();

    const customerData = await sequelize.models.customers.findAll();

    try {
      const users = customerData.map((sequelizeUser: any) => {
        CustomerSchema.validateSync(sequelizeUser);

        return sequelizeUser;
      });

      return users;
    } catch (error) {
      console.log(error);
    }
    return customerData;
  }

  async getAllPaginatedCustomer(
    paginationConfig: PaginatedSearchConfiguration<string>
  ): Promise<PaginatedResults<Customer>> {
    const { sequelize } = await getSequelizeContext();
    const { page, limit, search } = paginationConfig;

    const customerData = await sequelize.models.customers.findAndCountAll({
      offset: (page - 1) * limit,
      limit: limit,
      where: {
        customerName: { [Op.like]: `%${search}%` },
      },
    });

    const paginationResults = {
      totalRecords: customerData.count,
      totalPages: Math.ceil(customerData.count / limit),
      currentPage: page,
      results: customerData,
    };

    return paginationResults;
  }

  async getCustomerById(customerKey: string): Promise<Customer> {
    const { sequelize } = await getSequelizeContext();

    const customerData = await sequelize.models.customerProducts.findAll({
      where: {
        customerId: customerKey,
      },
      include: [
        {
          model: sequelize.models.customers,
        },
        sequelize.models.products,
      ],
    });

    return customerData;
  }

  async updateCustomerById(
    customerKey: string,
    updateCustomerByid: Partial<Customer>
  ): Promise<void> {
    const { sequelize } = await getSequelizeContext();

    await CustomerSchema.validate(updateCustomerByid);
    const customerData = await sequelize.models.customers.update(
      updateCustomerByid,
      {
        where: {
          id: customerKey,
        },
      }
    );

    if (!customerData) {
      throw new Error("Invalid customer id");
    }
  }

  async deleteCustomerById(customerKey: string): Promise<Customer> {
    const { sequelize } = await getSequelizeContext();
    const customerData = await sequelize.models.customers.destroy({
      where: {
        id: customerKey,
      },
    });
    if (!customerData) {
      throw new Error("Invalid customer id");
    }

    return customerData;
  }

  async createCustomer(data?: any): Promise<void> {
    const { sequelize } = await getSequelizeContext();

    try {
      await CustomerSchema.validate(data);
      await sequelize.models.customers.create(data);
    } catch (error: any) {
      console.log("Error found in Adapters: ", error.message);
    }
  }

  async createNewOrder(data?: any): Promise<void> {
    const { sequelize } = await getSequelizeContext();

    await sequelize.transaction(async (transaction: Transaction) => {
      const isEntryExist = await sequelize.models.customerProducts.findOne(
        {
          where: {
            customerId: data.params,
          },
        },
        { transaction }
      );

      if (isEntryExist) {
        await sequelize.models.customerProducts.destroy(
          {
            where: {
              customerId: data.params,
            },
          },
          { transaction }
        );
      }

      const entries = data.productId;
      const orders = entries.map((order: any) => {
        return {
          productId: order,
          customerId: data.params,
        };
      });

      await sequelize.models.customerProducts.bulkCreate(orders, {
        transaction,
      });
    });
  }
}
