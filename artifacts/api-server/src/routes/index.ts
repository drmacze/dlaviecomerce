import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import runtimeRouter from "./runtime.js";
import profileRouter from "./profile.js";
import walletRouter from "./wallet.js";
import ppobRouter from "./ppob.js";
import ordersRouter from "./orders.js";
import adminRouter from "./admin.js";
import panelRouter from "./panel.js";
import webhooksRouter from "./webhooks.js";
import miscRouter from "./misc.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(runtimeRouter);
router.use(profileRouter);
router.use(walletRouter);
router.use(ppobRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(panelRouter);
router.use(webhooksRouter);
router.use(miscRouter);

export default router;
