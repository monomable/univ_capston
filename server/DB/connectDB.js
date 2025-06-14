const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,          // 나중에 포트 변경해야함
  user: process.env.DB_USER,          // MySQL 사용자 이름
  password: process.env.DB_PASSWORD,  // MySQL 비밀번호
  database: process.env.DB_SCHEMA,     // 사용하려는 데이터베이스 이름
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0
});

// 콜백 스타일 쿼리를 위한 Connection pool 래퍼
const connection = {
  query: function(sql, values, callback) {
    if (typeof values === 'function') {
      callback = values;
      values = undefined;
    }
    
    pool.query(sql, values, callback);
  }
};

module.exports = connection;