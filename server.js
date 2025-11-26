const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'register.html'));
});

app.get('/posts', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'post-list.html'));
});

app.get('/posts/write', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'write.html'));
});

app.get('/posts/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'post-detail.html'));
});

app.get('/users/me', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'user-edit.html'));
});

app.get('/users/me/password', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'pw-edit.html'));
});

app.get('/terms/service', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'terms-of-service.html'));
});

app.get('/terms/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'privacy-policy.html'));
});


app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>404 - 페이지를 찾을 수 없습니다</title>
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <div style="text-align: center; margin-top: 100px;">
                <h1>404 - 페이지를 찾을 수 없습니다</h1>
                <p>요청하신 페이지를 찾을 수 없습니다.</p>
                <a href="/" class="btn btn-primary">홈으로 돌아가기</a>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log('========================================');
    console.log('프론트엔드 서버 실행 중');
    console.log(`주소: http://localhost:${PORT}`);
    console.log('========================================');
    console.log('');
    console.log('접속 가능한 URL:');
    console.log(`- 홈: http://localhost:${PORT}/`);
    console.log(`- 로그인: http://localhost:${PORT}/login`);
    console.log(`- 회원가입: http://localhost:${PORT}/register`);
    console.log(`- 게시글 목록: http://localhost:${PORT}/posts`);
    console.log(`- 글쓰기: http://localhost:${PORT}/posts/write`);
    console.log('========================================');
    console.log('');
    console.log('백엔드 API 서버는 별도로 8080 포트에서 실행하세요!');
    console.log('========================================');
});