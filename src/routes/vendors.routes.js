import { Router } from "express";

const router = Router();


router.get("/contacts", getContacts);
router.post("/contacts", createContact);
router.put("/contacts/:id", updateContact);
router.delete("/contacts/:id", deleteContact);


router.get("/transactions", getTransactions);
router.post("/transactions", createTransaction);

export default router;