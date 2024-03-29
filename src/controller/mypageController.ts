import { FriendRecommendRequestDTO } from "./../interfaces/friend/FriendRecommendRequestDTO";
import { Request, Response } from "express";
import { fail, success } from "../constants/response";
import { rm, sc } from "../constants";
import { slackErrorMessage } from "../modules/slack/slackErrorMessage";

import { friendService, mypageService, userService } from "../service";
import { userTokenCheck } from "../constants/userTokenCheck";
import { patchUserRequestDTO } from "../interfaces/mypage/patchUserRequestDTO";
import blockService from "../service/blockService";
import { sendWebhookErrorMessage } from "../modules/slack/slackWebhook";

//* 유저 탈퇴하기
const deleteUser = async (req: Request, res: Response) => {
  const userId = req.body.userId;

  if (!userId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }

  try {
    const data = await mypageService.deleteUser(+userId);

    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.DELETE_USER_FAIL));
    }

    return res.status(sc.OK).send(success(sc.OK, rm.DELETE_USER_SUCCESS));
  } catch (error) {
    const errorMessage = slackErrorMessage(
      req.method.toUpperCase(),
      req.originalUrl,
      error,
      req.statusCode
    );

    sendWebhookErrorMessage(errorMessage);

    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

//* 사용자 정보 수정하기
const patchUser = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const patchUserRequestDTO: patchUserRequestDTO = req.body;
  const image: Express.MulterS3.File | undefined =
    req.file as Express.MulterS3.File;

  patchUserRequestDTO.profileImage = image ? image.location : null;

  const intro = patchUserRequestDTO.intro;
  const refinedIntro = intro?.replace(/\n/g, " ");
  const nickname = patchUserRequestDTO.nickname;
  const refinedNickname = nickname.replace(/ /g, "");

  patchUserRequestDTO.intro = refinedIntro;
  patchUserRequestDTO.nickname = refinedNickname;

  if (!userId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }

  if (!patchUserRequestDTO.nickname) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.NULL_NICKNAME));
  }

  try {
    const data = await mypageService.patchUser(+userId, patchUserRequestDTO);

    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.CREATE_IMAGE_FAIL));
    }

    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.UPDATE_USER_PRIFILE_SUCCESS));
  } catch (error) {
    const errorMessage = slackErrorMessage(
      req.method.toUpperCase(),
      req.originalUrl,
      error,
      req.statusCode
    );

    sendWebhookErrorMessage(errorMessage);

    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

//* 사용자 정보 조회하기
const getUserData = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  if (!userId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }

  try {
    const data = await userService.getUserIntro(+userId);

    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.READ_USER_FAIL));
    }

    return res.status(sc.OK).send(success(sc.OK, rm.READ_USER_SUCCESS, data));
  } catch (error) {
    const errorMessage = slackErrorMessage(
      req.method.toUpperCase(),
      req.originalUrl,
      error,
      req.statusCode
    );

    sendWebhookErrorMessage(errorMessage);

    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

/**
 * @route DELETE /mypage/blocklist/:friendId
 * @desc 친구 차단 해제하기
 **/
const cancleBlock = async (req: Request, res: Response) => {
  const { friendId } = req.params;
  const userId = req.body.userId;

  if (!friendId) {
    return res.status(sc.BAD_REQUEST).send(fail(sc.BAD_REQUEST, rm.NULL_VALUE));
  }

  try {
    const data = await blockService.cancleBlockedFriend(+userId, +friendId);

    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.SUCCESS_CANCLE_BLOCK_FIREND));
  } catch (error) {
    const errorMessage = slackErrorMessage(
      req.method.toUpperCase(),
      req.originalUrl,
      error,
      req.statusCode
    );
    sendWebhookErrorMessage(errorMessage);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

/**
 * @route GET /mypage/blocklist
 * @desc 친구 차단 리스트 조회하기
 **/
const getBlockList = async (req: Request, res: Response) => {
  const userId = req.body.userId;

  try {
    const data = await blockService.getBlockList(+userId);

    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.SUCCESS_GET_BLOCK_LIST, data));
  } catch (error) {
    const errorMessage = slackErrorMessage(
      req.method.toUpperCase(),
      req.originalUrl,
      error,
      req.statusCode
    );
    sendWebhookErrorMessage(errorMessage);
    res
      .status(sc.INTERNAL_SERVER_ERROR)
      .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
  }
};

const mypageController = {
  deleteUser,
  patchUser,
  getUserData,
  cancleBlock,
  getBlockList,
};

export default mypageController;
