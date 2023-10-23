import { Router } from "express";
import { userController } from "../controller";
import { auth } from "../middlewares";

const router: Router = Router();

//* 닉네임 중복 검사 POST /user/duplicate
router.post("/duplicate", userController.postDuplicateNickname);
//* 유저 업데이트 버전 확인하기 GET /user/version
router.get("/version", auth, userController.getUserVersion)

export default router;