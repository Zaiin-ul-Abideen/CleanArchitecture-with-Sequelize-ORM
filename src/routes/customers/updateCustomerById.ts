import { Router } from "express";
import container from "../../dependencies";
import { UpdateCustomerById } from "../../application/useCases/customers/updateCustomerById";

const router: Router = Router();

router.patch("/:id", async (req, res) => {
  const updateCustomerById = container.resolve(UpdateCustomerById);
  const customerKey = req.params.id;

  const updateCustomerByid = req.body;

  const customer = await updateCustomerById.execute(
    customerKey,
    updateCustomerByid
  );
  return res.status(200).json(customer);
});

export default router;
