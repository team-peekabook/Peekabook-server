import app from "../src/index";
import req, { Response } from "supertest";
import { expect } from "chai";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('***** Friend Test *****', () => {
    context('[GET] /friend?nickname={}', () => {
        it('사용자 검색하기 성공', done => {
            req(app)
                .get(encodeURI('/friend?nickname=test2'))  // api 요청
                .set('Content-Type', 'application/json')
                .set('auth', '300')  // header 설정
                .expect(200) // 예측 상태 코드
                .expect('Content-Type', /json/) // 예측 content-type
                .then((res) => {
                    done();
                })
                .catch((err) => {
                    console.error("###### Error >>", err);
                    done(err);
                })
        });
    });

    context('[POST] /friend/:friendId', () => {
        //?  after 작업
        after(async () => {
            await prisma.friend.deleteMany({
                where: {
                    receiverId: 301,
                    senderId: 300
                }
            });
            await prisma.alarm.deleteMany({
                where: {
                    receiverId: 301,
                    senderId: 300
                }
            })

        });

        it('팔로우 하기 성공', done => {
            req(app)
                .post('/friend/301')
                .set('Content-Type', 'application/json')
                .set('auth', '300')
                .expect(200)
                .expect('Content-Type', /json/) // 예측 content-type
                .then((res) => {
                    done();
                })
                .catch((err) => {
                    console.error("###### Error >>", err);
                    done(err);
                })
        });

        it('이미 팔로우 한 경우, 팔로우 하기 실패 ', done => {
            req(app)
                .post('/friend/302')
                .set('Content-Type', 'application/json')
                .set('auth', '300')
                .expect(400)
                .expect('Content-Type', /json/) // 예측 content-type
                .then((res) => {
                    done();
                })
                .catch((err) => {
                    console.error("###### Error >>", err);
                    done(err);
                })
        });
    });

    context('[POST] /friend/:friendId/recommend', () => {
        //?  after 작업
        after(async () => {
            await prisma.friend.create({
                data: {
                    receiverId: 302,
                    senderId: 300
                }
            });

        });

        it('팔로우 취소하기 성공', done => {
            req(app)
                .delete('/friend/302')
                .set('Content-Type', 'application/json')
                .set('auth', '300')
                .expect(200)
                .expect('Content-Type', /json/) // 예측 content-type
                .then((res) => {
                    done();
                })
                .catch((err) => {
                    console.error("###### Error >>", err);
                    done(err);
                })
        });
    });



});
