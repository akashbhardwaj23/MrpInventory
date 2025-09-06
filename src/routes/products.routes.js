import { Router } from "express";

const router = Router();


router.get("/products", getProducts);


router.post("/products", createProducts);

router.put("/products/:id", updateProduct);

router.delete("/products/:id", deleteProduct);

router.get("/reports/inventory", getInventoryReport);
router.get("/reports/transactions", getTransactionsReport);


export default router;