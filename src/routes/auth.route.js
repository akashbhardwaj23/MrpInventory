import { Router } from "express";
import { auth } from "../middlewares/auth";

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', auth,  logout);

router.get('/profile', auth, getMe);

export default router;