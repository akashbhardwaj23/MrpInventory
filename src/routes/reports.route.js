import { Router } from "express";
import { auth } from "../middlewares/auth";
import { getContactHistoryById, getDashBoardData, getInventoryReport, getProductPerformace, getTransactionReport } from "../controllers/reports";
import { getContactById } from "../controllers/contact";



const router = Router();


router.use(auth);


router.get('/inventory', getInventoryReport)

router.get('transactions/report', getTransactionReport)

router.get('/contact/:contactId', getContactHistoryById);

router.get('/products/performance', getProductPerformace)

router.get('/dashboard', getDashBoardData)


export default router;