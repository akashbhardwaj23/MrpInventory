import { Router } from "express";
import { auth } from "../middlewares/auth";
import { createTransaction, getTransactions } from "../controllers/transaction";


const router = Router();

router.use(auth);


router.get('/transactions', getTransactions);

router.post('/transactions', createTransaction)


export default router;