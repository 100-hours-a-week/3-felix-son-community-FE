// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============= 미들웨어 설정 =============

// 보안 헤더 설정
app.use((req, res, next) => {
  // XSS 방지
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // CORS 설정 (개발 환경)
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// 요청 로깅
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// 정적 파일 서빙 (CSS, JS, 이미지 등)
app.use(express.static(__dirname, {
  maxAge: '1d', // 캐시 설정 (개발: 1일, 프로덕션: 더 길게)
  etag: true,
}));

// ============= 라우트 설정 =============

// 홈
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 로그인
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

// ✅ 회원가입 URL 통일 (signup과 register 모두 지원)
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'register.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'register.html'));
});

// 게시글 목록
app.get('/posts', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'post-list.html'));
});

// ✅ 글쓰기 (동적 라우트보다 먼저 정의)
app.get('/posts/write', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'write.html'));
});

// ✅ 게시글 수정
app.get('/posts/:id/edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'edit.html'));
});

// 게시글 상세 (동적 라우트는 마지막에)
app.get('/posts/:id', (req, res) => {
  const postId = req.params.id;
  // UUID 형식 검증 (간단한 v4 UUID: 36자, 숫자/소문자/대문자/하이픈)
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  
  if (!uuidRegex.test(postId)) {
    return res.status(404).sendFile(path.join(__dirname, 'pages', '404.html'));
  }
  res.sendFile(path.join(__dirname, 'pages', 'post-detail.html'));
});


// 회원정보 수정 (프로필 사진, 닉네임)
app.get('/users/me', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'user-edit.html'));
});

// 비밀번호 수정
app.get('/users/me/password', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'pw-edit.html'));
});

// 이용약관
app.get('/terms/service', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'terms-of-service.html'));
});

// 개인정보처리방침
app.get('/terms/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'privacy-policy.html'));
});

// ============= 에러 처리 =============

// 404 에러 처리
app.use((req, res) => {
  // 404.html 파일이 있으면 사용, 없으면 기본 HTML 반환
  const notFoundPage = path.join(__dirname, 'pages', '404.html');
  
  res.status(404);
  
  // 404 페이지 파일 존재 여부 확인
  require('fs').access(notFoundPage, (err) => {
    if (err) {
      // 404.html이 없으면 기본 HTML 반환
      res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - 페이지를 찾을 수 없습니다</title>
            <link rel="stylesheet" href="/css/style.css">
            <style>
                .error-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    text-align: center;
                    padding: 20px;
                }
                .error-code {
                    font-size: 120px;
                    font-weight: bold;
                    color: #007bff;
                    margin: 0;
                    line-height: 1;
                }
                .error-message {
                    font-size: 24px;
                    color: #333;
                    margin: 20px 0;
                }
                .error-description {
                    font-size: 16px;
                    color: #666;
                    margin-bottom: 30px;
                }
                .btn-home {
                    display: inline-block;
                    padding: 12px 30px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .btn-home:hover {
                    background-color: #0056b3;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <h1 class="error-code">404</h1>
                <p class="error-message">페이지를 찾을 수 없습니다</p>
                <p class="error-description">
                    요청하신 페이지가 존재하지 않거나 이동되었습니다.
                </p>
                <a href="/" class="btn-home">홈으로 돌아가기</a>
            </div>
        </body>
        </html>
      `);
    } else {
      res.sendFile(notFoundPage);
    }
  });
});

// 서버 에러 처리
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  
  res.status(500).send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>500 - 서버 오류</title>
        <link rel="stylesheet" href="/css/style.css">
        <style>
            .error-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                text-align: center;
                padding: 20px;
            }
            .error-code {
                font-size: 120px;
                font-weight: bold;
                color: #dc3545;
                margin: 0;
                line-height: 1;
            }
            .error-message {
                font-size: 24px;
                color: #333;
                margin: 20px 0;
            }
            .error-description {
                font-size: 16px;
                color: #666;
                margin-bottom: 30px;
            }
            .btn-home {
                display: inline-block;
                padding: 12px 30px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                transition: all 0.2s;
            }
            .btn-home:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="error-container">
            <h1 class="error-code">500</h1>
            <p class="error-message">서버 오류가 발생했습니다</p>
            <p class="error-description">
                잠시 후 다시 시도해주세요.
            </p>
            <a href="/" class="btn-home">홈으로 돌아가기</a>
        </div>
    </body>
    </html>
  `);
});

// ============= 서버 시작 =============

app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 프론트엔드 서버 실행 중');
  console.log(`📍 주소: http://localhost:${PORT}`);
  console.log('========================================');
  console.log('');
  console.log('📑 접속 가능한 URL:');
  console.log(`  ├─ 홈:           http://localhost:${PORT}/`);
  console.log(`  ├─ 로그인:       http://localhost:${PORT}/login`);
  console.log(`  ├─ 회원가입:     http://localhost:${PORT}/signup`);
  console.log(`  ├─ 게시글 목록:  http://localhost:${PORT}/posts`);
  console.log(`  ├─ 글쓰기:       http://localhost:${PORT}/posts/write`);
  console.log(`  ├─ 프로필 수정:  http://localhost:${PORT}/users/me`);
  console.log(`  └─ 비밀번호:     http://localhost:${PORT}/users/me/password`);
  console.log('');
  console.log('========================================');
  console.log('⚠️  백엔드 API 서버는 별도로 실행하세요!');
  console.log('📍 백엔드: http://localhost:8080');
  console.log('========================================');
  console.log('');
  console.log('💡 Ctrl+C를 눌러 서버를 종료할 수 있습니다.');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n서버를 종료합니다...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n서버를 종료합니다...');
  process.exit(0);
});