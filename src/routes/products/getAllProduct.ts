import { Router } from "express";
import container from "../../dependencies";
import { GetAllProduct } from "../../application/useCases/products/getAllProduct";

const router: Router = Router();

router.get("/", async (_req, res) => {
  const getProducts = container.resolve(GetAllProduct);
  const product = await getProducts.execute();
  return res.status(200).json(product);
});

export default router;
