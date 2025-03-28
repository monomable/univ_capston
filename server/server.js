// server.js || Mysql 과 Express 프레임워크 연결
const express = require('express');
// 로그인 인증관련 부분
const session = require('express-session');
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session)
const dotenv = require('dotenv'); // 서버 포트 사용을 위한 모듈 임포팅
dotenv.config({ path: '.env' }); // 환경변수 사용
const path = require('path');

const dealsRouter = require('./routes/deals');// deals 라우트 가져오기
const postModel = require('./models/model');

// 로그인인증 기능 변수 세팅
var authRouter = require('./login/auth.js');
var authCheck = require('./login/authCheck.js');
var template = require('./login/template.js');

/** Create Express */
const app = express();

/** Next.js 모듈 가져오기 */
const next = require('next');
const { parse } = require('url');
const connection = require('./connectDB'); //Mysql 연결 파일
const hotdealConnection = require('./hotdealDB'); // hotdeal DB 연결 파일

/** Next.js 설정 */
const port = process.env.SERVER_PORT;

// 라우트 설정
//const postRouter = require('./routes/postRouter');
app.use('/deals', dealsRouter); // /deals 경로로 들어오는 요청은 dealsRouter가 처리

// 세션 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'j9fcOdM6ZQ1QsnzYbHfIXUg7WXogSfY8PmTx1KtKHulY',
  resave: false,
  saveUninitialized: true,
  store: new FileStore(),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

// 로그인 라우트 추가
app.use('/auth', authRouter);

// /home 경로에 대한 인증 미들웨어 추가(테스트용 => 추후 삭제 필요)
app.get('/home', authCheck, (req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname, query } = parsedUrl;
  nextApp.render(req, res, pathname, query);
});

/**
 * 개발환경이아니라면 dev 옵션을 false 로 설정하고
 * 서버 시작전에 next build 를 실행해준다.
 */
const nextApp = next({ dev: true, port });
const handle = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(() => {
    /** Express Settings */
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    /** static 경로 설정 */
    app.use(express.static(path.join(__dirname, '../', 'public')));

    /** Express Router Settings */
    app.use('/hello', (req, res, next) => {
      res.send('hello!');
    });

    /** Next.js Routing */
    app.get('/', (req, res) => {
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;
      nextApp.render(req, res, pathname, query);

      /*
      UserModel.find()
      .then(users => res.json(users))
      .catch(err => res.json(err))
      */
    });

    /*
    // 로그인 인증 라우터
    app.use('/auth', authRouter);
    */

    /* CRUD api 구현 공간 */
    
    app.get('/api/list', (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 15;
      const offset = (page - 1) * limit;

      // 전체 아이템 수를 가져오는 쿼리
      hotdealConnection.query('SELECT COUNT(*) as total FROM hotdeals', (err, countResult) => {
        if (err) {
          console.error(err);
          res.status(500).send('서버 오류');
          return;
        }
        
        const total = countResult[0].total;

        // 페이지네이션된 데이터를 가져오는 쿼리
        hotdealConnection.query(
          'SELECT * FROM hotdeals ORDER BY id DESC LIMIT ? OFFSET ?', 
          [limit, offset], 
          (err, result) => {
            if (err) {
              console.error(err);
              res.status(500).send('서버 오류');
              return;
            }
            res.send({
              items: result,
              total: total,
              currentPage: page,
              totalPages: Math.ceil(total / limit)
            });
          }
        );
      });
    });

    app.get('/api/post/list', (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 15;
      const offset = (page - 1) * limit;

      // 전체 아이템 수를 가져오는 쿼리
      connection.query('SELECT COUNT(*) as total FROM Post', (err, countResult) => {
        if (err) throw err;
        
        const total = countResult[0].total;

        // 페이지네이션된 데이터를 가져오는 쿼리
        connection.query(
          'SELECT * FROM Post ORDER BY board_id DESC LIMIT ? OFFSET ?', 
          [limit, offset], 
          (err, result) => {
            if (err) throw err;
            res.send({
              items: result,
              total: total,
              currentPage: page,
              totalPages: Math.ceil(total / limit)
            });
          }
        );
      });
      /* 기존 게시판 코드
      connection.query('SELECT * FROM Post ORDER BY board_id DESC LIMIT 15', function (err, result, fields) {
        if (err) throw err;
        res.send(result);
      })
      */
    });

    app.get('/api/post/sidelist', (req, res) => {
      connection.query('SELECT * FROM Post ORDER BY board_id DESC LIMIT 5', function (err, result, fields) {
        if (err) throw err;
        res.send(result);
      })
    });
    
    // ID Post View
    app.get('/api/post/:id', (req, res, next) =>{
      connection.query('SELECT * FROM Post', (err, rows) =>{
        if (err) throw err;
        const postview = rows.find(post => post.idx === parseInt(req.params.id));
        if(!postview) {
          return res.status(404).send('해당 글을 찾을 수 없습니다. ');
        }
        res.send(postview);
      })
    })
    
    // Create API
    app.post('/api/post/create', function (req, res) { // create창에서 값들을 가져옴
      const body = req.body

      // body에서 name이 writer, title, content, regdata인 input값들을 가져옴
      connection.query('insert into Post (writer, title, content) values (?, ?, ?);', [
        body.writer,
        body.title,
        body.content,
      ], function(err) {
        if (err) {
          throw err;
        } else {
          res.redirect('/home/post') // create 완료후 /home으로 리다이렉트
        }
      })
    }) 

    // Delete API
    app.get('/api/post/delete/:id', function (req, res) {
      connection.query('delete from Post where board_id=?', [req.params.id], function () {
        res.redirect('/home/post') // delete 완료후 /home으로 리다이렉트
      })
    })

    // Edit API
    app.get('/api/post/edit/:id', function (req, res) { // id값에 맞춰 edit할 값들 가져오기
      connection.query('select * from Post where board_id=?', [req.params.id], function (err, results) {
        if (err) {
          throw err
        } else {
          res.send(results)
        }
      })
    })
    
    app.post('/api/post/edit/:id', function (req, res) { // 변경된 데이터 post
      const body = req.body
    
      connection.query('update Post SET writer=?, title=?, content=? where board_id=?',[
        body.writer, 
        body.title, 
        body.content,
        req.params.id
      ], function () {
        res.redirect('/home/post') // /home으로 리다이렉트
      })
    })

    
    app.get('/api/search', (req, res) => {
      //console.log(req.query.query);
      // "search?query=" 뒤 url query값을 받아서 db에 검색 (검색값은 title 필드에 한해서 검색)
      hotdealConnection.query(`SELECT * FROM hotdeals WHERE title LIKE ?`, '%' + req.query.query + '%', 
        function(err, result) {
        if (err) {
          throw err;
        } else {
          //console.log(result);
          res.send(result);  // db 검색 데이터 전달
        }
      })
      //return handle(req, res);
    });

    // 이미지 데이터를 가져오는 API 추가  // 임시로 퀘이사존 리스트만 받아오도록 설정
    app.get('/api/images', (req, res) => {
      hotdealConnection.query('SELECT image_base64, link FROM hotdeals WHERE source_website = "quasarzone" AND image_base64 IS NOT NULL ORDER BY id DESC LIMIT 6', function (err, result) {
        if (err) throw err;
        res.send(result);
      })
    });
    

    app.get('*', (req, res) => {
      return handle(req, res);
    });
    
    app.listen(port, () => {
      console.log(`Express server listen port:${port}`);
      console.log(`http://localhost:${port}`);
    });
    
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });

// 에러 핸들링 미들웨어 (모든 라우터 아래에 추가)
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!res.headersSent) {
    res.status(500).send('서버 오류');
  } else {
    next(err);
  }
});

module.exports = app;