## 📣 Just For Share


### 🖥️ Frontend 소개

- 자유롭게 이야기를 나누는 **커뮤니티 프로젝트**입니다.
- 대부분 순수 **자바스크립트**를 사용하였습니다.
- 초기 화면 구성부터 기능 구현, 백엔드, 인프라까지 **직접** 구현했습니다.

### 📌 개발 인원 및 기간

- **개발 기간:** 2025-9-15 ~ 2025-12-07 (약 12주)
- **개발 인원:** FE, BE, Infra (1인 개발)

### 🛠️ 사용 기술 및 Tools

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)

### 🗃️ BE 깃허브
- [Backend Github](https://github.com/100-hours-a-week/3-felix-son-community-BE)

### 📁 폴더 구조
<details>
<summary>폴더 구조 보기</summary>

<pre>
3-FELIX-SON-COMMUNITY-FE/
├── .github/
│   └── workflows/
│       └── ci-cd-FE.yml
├── css/
│   ├── base.css
│   ├── components.css
│   └── pages.css
├── js/
│   ├── apiService.js
│   ├── authManager.js
│   ├── authUiManager.js
│   ├── commentService.js
│   ├── fileUploadService.js
│   ├── initService.js
│   ├── layout.js
│   ├── notificationService.js
│   ├── postService.js
│   ├── userService.js
│   └── utils.js
├── node_modules/
├── pages/
│   ├── login.html
│   ├── post-detail.html
│   ├── post-list.html
│   ├── pw-edit.html
│   ├── register.html
│   ├── user-edit.html
│   └── write.html
├── .dockerignore
├── .gitignore
├── Dockerfile
├── frontend-task-def.json
├── index.html
├── package-lock.json
├── package.json
└── server.js
</pre>

</details>

### 서비스 화면

`홈`
| 홈 화면 | 게시글 목록 화면 |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/7fc59b0d-f0eb-4319-8eb0-4d5b992f1cd0" alt="홈 화면" width="400"/> | <img src="https://github.com/user-attachments/assets/be07f697-5964-498f-a968-bd8dc1c50a2c" alt="게시글 목록 화면" width="400"/> |

`인증`
| 로그인 화면 | 회원가입 화면 |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/a03494ae-1257-451b-b863-fe2079b47ae4" alt="로그인 화면" width="400"/> | <img src="https://github.com/user-attachments/assets/b1ed27f0-e09f-488a-ab76-053528c8ddbe" alt="회원가입 화면" width="400"/> |

`게시글 작성/상세/수정/삭제`
| 게시글 작성 | 게시글 상세 | 게시글 수정 | 게시글 삭제 |
| :---: | :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/a217e4de-98ec-49fa-b801-caba63003bb3" alt="게시글 작성 화면" width="400"/> | <img src="https://github.com/user-attachments/assets/d9ce6fb4-beab-40e2-a779-8f549e1e918f" alt="게시글 상세 화면" width="400"/> | <img src="https://github.com/user-attachments/assets/1c8be5ee-5ef0-41d6-80e4-d55e3274ce3f" alt="게시글 수정 화면" width="400"/> | <img src="https://github.com/user-attachments/assets/e210a007-ebdc-487a-930e-777f790e8d86" alt="게시글 삭제 화면" width="400"/> | 

`댓글 작성/목록/수정/삭제`
| 댓글 작성 | 댓글 목록 | 댓글 수정 | 댓글 삭제 |
| :---: | :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/f0316cb1-0698-4886-af99-e27640be8caf" alt="댓글 작성" width="400"/> | <img src="https://github.com/user-attachments/assets/01fee3d1-d9b0-486b-9e85-6694b52ebd7b" alt="댓글 목록" width="400"/> | <img src="https://github.com/user-attachments/assets/c6d7652b-40ae-46b7-b263-ae735f14a1d2" alt="댓글 수정" width="400"/> | <img src="https://github.com/user-attachments/assets/c20dece7-edb3-4cd6-8afa-abfbda806502" alt="댓글 삭제" width="400"/> |

`프로필 수정 / 비밀번호 수정 / 회원 탈퇴 / 로그아웃`
| 프로필 수정 | 비밀번호 수정 | 회원 탈퇴 | 로그아웃 |
| :---: | :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/95fbaca2-db64-47e7-9895-741233561c2a" alt="프로필 수정" width="400"/> | <img src="https://github.com/user-attachments/assets/074e2f5b-8707-4231-b8f6-493da0f60b0a" alt="비밀번호 수정" width="400"/> | <img src="https://github.com/user-attachments/assets/762518dc-377c-4790-ad78-39d87c80c901" alt="회원 탈퇴" width="400"/> | <img src="https://github.com/user-attachments/assets/ae03c980-e975-459c-91e2-34cee7cf0554" alt="로그 아웃" width="400"/> |

### 트러블 슈팅
#### 1. 페이지 새로고침 시 사용자 정보 손실 문제
<details>
<summary>문제</summary>
  
```
// 초기 구현 - 메모리만 사용
class AuthManager {
    constructor() {
        this.currentUser = null;  // 메모리에만 저장
    }
}

// 1. 로그인 성공 → 메모리에 사용자 정보 저장
// 2. 다른 페이지로 이동 (MPA 특성상 새로고침)
// 3. AuthManager 재생성 → currentUser가 null로 초기화
// 4. Access Token은 있지만 사용자 정보(닉네임, 프로필) 표시 안 됨
// 5. /api/users/me를 매번 호출해야 하는 비효율 발생
```
</details>

<details>
<summary>해결</summary>
세션스토리지에 사용자 정보 보관
  
```
class AuthManager {
  constructor() {
    // 페이지 로드 시 sessionStorage에서 복원
    this.currentUser = this.loadUserFromStorage();
    this.init();
  }

  loadUserFromStorage() {
    try {
      const raw = sessionStorage.getItem("user");
      if (!raw) return null;
      
      const user = JSON.parse(raw);
      
      // 필수 필드 검증
      if (!user.userId || !user.nickname) return null;
      
      return user;
    } catch (e) {
      console.error("저장된 사용자 정보 파싱 실패:", e);
      return null;
    }
  }

  saveUserToStorage(user) {
    try {
      // 필요한 정보만 저장 (보안)
      const safeUser = {
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
      };
      sessionStorage.setItem("user", JSON.stringify(safeUser));
    } catch (e) {
      console.error("사용자 정보 저장 실패:", e);
    }
  }

  setUser(user) {
    this.currentUser = user;              // 메모리
    this.saveUserToStorage(user);         // sessionStorage
    console.log("사용자 정보 저장:", user.nickname);
  }
}
```
</details>

<details>
<summary>배운 점</summary>
  
- MPA는 페이지마다 JavaScript 재실행되므로 상태 영속화가 필요하다.
- SessionStorage는 탭 단위로 격리되어 LocalStorage 보다는 안전하다.
- 민감한 정보(비밀번호 등)는 저장하지 않고 최소 정보만 세션스토리지에 보관하였다.
  
</details>

---

#### 2. Access Token 만료 시 사용자 경험 단절 문제
<details>
<summary>문제</summary>

```
async request(endpoint, options) {
    const response = await fetch(endpoint, options);
    
    if (response.status === 401) {
        // 즉시 로그인 페이지로 이동
        this.clearAuthState();
        window.location.href = '/login';
        throw new Error('인증이 필요합니다.');
    }
    
    return response;
}

// Before (자동 갱신 없음):
// 1. 게시글 작성 중 (20분)
// 2. Access Token 만료
// 3. "게시" 클릭
// 4. 즉시 로그아웃 되어버림
// 5. 작성 내용 손실
// 6. 사용자 경험 단절
```
</details>

<details>
<summary>해결</summary>
  리프레쉬 토큰으로 토큰 갱신 요청 자동 적용

```
async request(endpoint, options) {
    let response = await fetch(endpoint, options);
    
    // 401 에러 시 토큰 갱신 시도
    if (response.status === 401 && authManager) {
        console.log("🔄 토큰 만료 감지 - 갱신 시도");
        
        const refreshed = await authManager.refreshAccessToken();
        
        if (refreshed) {
            // 갱신 성공 → 원래 요청 재시도
            console.log("토큰 갱신 성공 - 요청 재시도");
            
            // 새 토큰으로 헤더 업데이트
            const newToken = authManager.getToken();
            options.headers['Authorization'] = `Bearer ${newToken}`;
            
            response = await fetch(endpoint, options);
        } else {
            // 갱신 실패 → Refresh Token도 만료
            console.log("Refresh Token 만료 - 재로그인 필요");
            authManager.clearAuthState();
            window.location.href = '/login';
        }
    }
    
    return response;
}
```

</details>

<details>
<summary>배운 점</summary>
  
- 클라이언트의 재요청을 위한 401 에러와 같은 명확한 확인이 필요하다.
- 쿠키의 특성상 Refresh Token은 브라우저가 자동으로 전송한다.
- Access Token은 짧게(30분), Refresh Token은 길게(14일) 설정하여 보안과 편의성 균형을 고려하였다.

</details>

### 프로젝트 후기
라이브러리, 프레임워크를 사용하지 않고 FE를 개발을 해보니 자바스크립트의 핵심적인 요소들을 더 이해할 수 있었습니다. 자연스럽게 MPA 구조로 프론트엔드가 구성되면서 SPA 와의 차이에 대해서도 명확히 이해할 수 있었습니다. 현재 프로젝트가 CSR(클라이언트 사이드 렌더링)로 구성되어있는데 SEO를 고려하면 SSR(서버 사이드 렌더링)이 더 좋으므로 추후에 고도화시 변경을 고려해봐야겠습니다. 시간을 온전히 쏟지 못한 아쉬움도 있었지만 각 핵심 요소들을 정확히 파악했던 시간이였습니다.
