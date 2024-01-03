import { inject, injectable } from "inversify";
import { CustomerInterface } from "../../interfaces/customerInterface/customerInterface";
import type { Customer } from "@models/customers";

@injectable()
export class UpdateCustomerById {
  @inject(CustomerInterface) customerInterface!: CustomerInterface;

  async execute(
    customerKey: string,
    updateCustomerByid: Partial<Customer>
  ): Promise<void> {
    return this.customerInterface.updateCustomerById(
      customerKey,
      updateCustomerByid
    );
  }
}
