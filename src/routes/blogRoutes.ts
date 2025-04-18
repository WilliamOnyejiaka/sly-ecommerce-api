import { Router } from "express";
import  BlogController  from "../controllers/blogControllers";
import { authenticate } from "../middlewares/authmiddleWare";
import { authorize } from "../middlewares/authorizeRoles";

const router = Router();

router.get("/", BlogController.getAll);
router.get("/:id", BlogController.getOne);
router.post("/", BlogController.create);
router.put("/:id", BlogController.update);
router.delete("/:id", BlogController.delete);

router.post("/", authenticate, authorize("ADMIN", "VENDOR"), BlogController.create);
router.delete("/:id", authenticate, authorize("ADMIN"), BlogController.delete);

export default router;
