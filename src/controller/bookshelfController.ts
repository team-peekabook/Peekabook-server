import { Request, Response } from "express";
import { rm, sc } from "../constants";
import { fail, success } from "../constants/response";
import { BookshelfCreateDTO } from "../interfaces/bookshelf/BookshelfCreateDTO";
import { BookshelfUpdateDTO } from "../interfaces/bookshelf/BookshelfUpdateDTO";
import { BookshelfDuplicateReqDTO } from "../interfaces/bookshelf/BookshelfDuplicateReqDTO";
import { slackErrorMessage } from "../modules/slack/slackErrorMessage";
import { sendWebhookErrorMessage } from "../modules/slack/slackWebhook";
import { bookshelfService } from "../service";

/**
 * @route POST /bookshelf
 * @desc 내 책장에 책 등록하기
 **/
const createMyBook = async (req: Request, res: Response) => {
  const bookshelfCreateDto: BookshelfCreateDTO = req.body;
  const auth = req.body.userId;

  const refinedDescription = bookshelfCreateDto.description.replace(/\n/g, " ");
  const refinedMemo = bookshelfCreateDto.memo.replace(/\n/g, " ");
  bookshelfCreateDto.description = refinedDescription;
  bookshelfCreateDto.memo = refinedMemo;

  if (!bookshelfCreateDto.author || !bookshelfCreateDto.bookTitle) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.CREATE_MYBOOK_FAIL));
  }

  try {
    const data = await bookshelfService.createMyBook(+auth, bookshelfCreateDto);

    const createMybookDTO = {
      id: data.id,
    };

    if (!data) {
      return res
        .status(sc.INTERNAL_SERVER_ERROR)
        .send(fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
    }
    return res
      .status(sc.CREATED)
      .send(success(sc.CREATED, rm.CREATE_MYBOOK_SUCCESS, createMybookDTO));
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
 * @route GET /bookshelf/detail/:bookshelfId
 * @desc 등록한 책의 상세 정보 불러오기
 */
const getBookById = async (req: Request, res: Response) => {
  const { bookshelfId } = req.params;

  try {
    if (!bookshelfId) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
    }

    const data = await bookshelfService.getBookById(+bookshelfId);

    if (data === null || data === undefined) {
      return res
        .status(sc.NOT_FOUND)
        .send(fail(sc.NOT_FOUND, rm.READ_MYBOOK_FAIL));
    }
    return res.status(sc.OK).send(success(sc.OK, rm.READ_MYBOOK_SUCCESS, data));
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
 * @route DELETE /bookshelf/:bookshelfId
 * @desc 등록한 책 삭제하기
 */
const deleteMyBook = async (req: Request, res: Response) => {
  const { bookshelfId } = req.params;

  try {
    if (!bookshelfId) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
    }

    const data = await bookshelfService.deleteMyBook(+bookshelfId);

    if (data == sc.NOT_FOUND) {
      return res
        .status(sc.NOT_FOUND)
        .send(fail(sc.NOT_FOUND, rm.READ_MYBOOK_FAIL));
    }
    return res.status(sc.OK).send(success(sc.OK, rm.DELETE_MYBOOK_SUCCESS));
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
 * @route PATCH /bookshelf/:bookshelfId
 * @desc 등록한 책 정보 수정하기
 */
const updateMyBook = async (req: Request, res: Response) => {
  const bookshelfUpdateDto: BookshelfUpdateDTO = req.body;
  const { bookshelfId } = req.params;
  const auth = req.body.userId;

  const refinedDescription = bookshelfUpdateDto.description?.replace(
    /\n/g,
    " "
  );
  const refinedMemo = bookshelfUpdateDto.memo?.replace(/\n/g, " ");
  bookshelfUpdateDto.description = refinedDescription;
  bookshelfUpdateDto.memo = refinedMemo;

  try {
    if (!bookshelfId) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
    }

    if (!bookshelfUpdateDto) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.UPDATE_MYBOOK_FAIL));
    }

    const data = await bookshelfService.updateMyBook(
      +bookshelfId,
      bookshelfUpdateDto
    );

    if (data == sc.NOT_FOUND) {
      return res
        .status(sc.NOT_FOUND)
        .send(fail(sc.NOT_FOUND, rm.READ_MYBOOK_FAIL));
    }
    return res.status(sc.OK).send(success(sc.OK, rm.UPDATE_MYBOOK_SUCCESS));
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
 * @route GET /bookshelf
 * @desc 내 책장 (메인 뷰) 조회하기
 */
const getMyBookshelf = async (req: Request, res: Response) => {
  const auth = req.body.userId;

  const data = await bookshelfService.getMyBookshelf(+auth);

  try {
    if (!data) {
      return res
        .status(sc.BAD_REQUEST)
        .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
    }
    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.READ_BOOKSHELF_SUCCESS, data));
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
 * @route GET /bookshelf/friend/:friendId
 * @desc 친구 책장 조회하기
 */
const getFriendBookshelf = async (req: Request, res: Response) => {
  const { friendId } = req.params;
  const auth = req.body.userId;

  if (!friendId) {
    return res
      .status(sc.BAD_REQUEST)
      .send(fail(sc.BAD_REQUEST, rm.BAD_REQUEST));
  }

  const data = await bookshelfService.getFriendBookshelf(+auth, +friendId);

  try {
    if (data == sc.NOT_FOUND) {
      return res
        .status(sc.NOT_FOUND)
        .send(fail(sc.NOT_FOUND, rm.NOT_FOUND_FRIEND_ID));
    }

    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.READ_FRIEND_BOOKSHELF_SUCCESS, data));
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
 * @route POST /bookshelf/duplicate
 * @desc 책 등록 시, 중복된 책인지 확인하기
 */
const checkDuplicateBook = async (req: Request, res: Response) => {
  const bookshelfDuplicateReqDTO: BookshelfDuplicateReqDTO = req.body;
  const userId = req.body.userId;

  try {
    const data = await bookshelfService.checkDuplicateBook(
      bookshelfDuplicateReqDTO,
      +userId
    );

    return res
      .status(sc.OK)
      .send(success(sc.OK, rm.SUCCESS_CHECK_BOOKSHELF_DUPLICATE, data));
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

const bookshelfController = {
  createMyBook,
  getBookById,
  deleteMyBook,
  updateMyBook,
  getMyBookshelf,
  getFriendBookshelf,
  checkDuplicateBook,
};

export default bookshelfController;
