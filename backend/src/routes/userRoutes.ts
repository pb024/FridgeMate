import { Router } from "express";
import { syncUser } from "../contollers/userControllers";

const router = Router();


// sync clerk to db
// when POST request sent to /sync call syncUser
router.post("/sync", syncUser);

export default router;