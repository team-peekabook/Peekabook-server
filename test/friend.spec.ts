import app from "../src/index";
import req from "supertest";
import expect from "chai";
import dotenv from "dotenv";

dotenv.config();

describe('Friend Test', () => {
    it('[GET] 사용자 검색하기 성공', (done) => {
        req(app)
            .get('/friend?nickname=현정이')  // api 요청
            .set('Content-Type', 'application/json')
            .set('auth', '1')  // header 설정
            .expect(200) // 예측 상태 코드
            .expect('Content-Type', /json/) // 예측 content-type
            .then((res) => {
                done();
            })
            .catch((err) => {
                console.error("<< -- Error -- >>", err);
                done(err);
            })
    });

    it('[POST] 팔로우 하기 성공', done => {
        req(app)
            .post('/friend/3')
            .set('Content-Type', 'application/json')
            .set('auth', '1')
            .expect(200)
            .expect('Content-Type', /json/) // 예측 content-type
            .then((res) => {
                done();
            })
            .catch(err => {
                console.error("<< -- Error -- >>", err);
                done(err);
            })
    });
    it('[POST] 친구에게 책 추천하기 성공', done => {
        req(app)
            .post('/friend/3/recommend')
            .set('Content-Type', 'application/json')
            .set('auth', '1')
            .send({
                "recommendDesc": "좋아요 너무나도 ~~",
                "bookTitle": "잘될 수밖에 없는 너에게",
                "author": "최서영",
                "bookImage": "http://image.yes24.com/goods/111750543/XL"
            })
            .expect(200)
            .expect('Content-Type', /json/) // 예측 content-type
            .then((res) => {
                done();
            })
            .catch(err => {
                console.error("<< -- Error -- >>", err);
                done(err);
            })
    });
});