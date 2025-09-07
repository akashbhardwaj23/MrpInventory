import { Router } from "express";
import { auth } from "../middlewares/auth";
import { createContact, deleteContact, getContactById, getContacts, updateContact } from "../controllers/contact";



const router = Router();

router.use(auth);


router.get("/contacts", getContacts);

router.get('/contacts/:id', getContactById)

router.post("/contacts", createContact);

router.put("/contacts/:id", updateContact);

router.delete("/contacts/:id", deleteContact);

export default router;