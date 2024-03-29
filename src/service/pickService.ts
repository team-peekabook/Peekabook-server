import { PrismaClient } from "@prisma/client";
import { PickPatchRequestDTO } from "../interfaces/pick/PickPatchRequestDTO";
const prisma = new PrismaClient();

//* Pick한 책 수정
const patchPick = async (pickPatchRequestDTO: PickPatchRequestDTO, auth: number) => {

    // 원래 pick값 false로 수정하기
    //! pickIndex 초기에 null 가능한지
    const previousPick = await prisma.bookshelf.updateMany({
        where: {
            pickIndex: { in: [1, 2, 3] },
            userId: auth
        },
        data: {
            pickIndex: 0,
        }
    });


    // 새롭게 pick한 값 index 세팅하기
    if (pickPatchRequestDTO.firstPick != 0) {
        const firstPick = await prisma.bookshelf.update({
            where: {
                id: pickPatchRequestDTO.firstPick,
            },
            data: {
                pickIndex: 1
            }
        });
    }

    if (pickPatchRequestDTO.secondPick != 0) {
        const secondPick = await prisma.bookshelf.update({
            where: {
                id: pickPatchRequestDTO.secondPick,
            },
            data: {
                pickIndex: 2,
            }
        })
    }

    if (pickPatchRequestDTO.thirdPick != 0) {
        const thirdPick = await prisma.bookshelf.update({
            where: {
                id: pickPatchRequestDTO.thirdPick,
            },
            data: {
                pickIndex: 3,
            }
        })
    }

    return true;

}

//* 책 전체 조회
const getBook = async (auth: number) => {
    const books = await prisma.bookshelf.findMany({
        where: {
            userId: auth,
        },
        select: {
            id: true,
            pickIndex: true,
            Book: {
                select: {
                    id: true,
                    bookImage: true,
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    return books;
}

const pickService = {
    patchPick,
    getBook
}

export default pickService;