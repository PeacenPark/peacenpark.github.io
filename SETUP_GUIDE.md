# 로그인/승인 시스템 설정 가이드

전기(공사) 계산기에 Firebase 기반 로그인 + 관리자 승인 기능을 추가했습니다. 안드로이드 앱(TWA)과 웹이 같은 사이트를 보고 있으므로, 이 설정을 마치면 **기존 안드로이드 사용자도 다음 실행 시 로그인 화면을 보게 됩니다.**

## 추가/수정된 파일

- `firebase-config.js` — Firebase 프로젝트 키, 관리자 이메일 목록 (직접 채워야 함)
- `auth-guard.js` — 모든 계산기 페이지에서 로그인/승인 여부를 확인하는 공용 스크립트
- `login.html` — 로그인/회원가입(이메일, 구글) 페이지
- `admin.html` — 가입자 승인/차단 관리 페이지
- `firestore.rules` — Firestore 보안 규칙
- `index.html`, `cable.html`, `cable2.html`, `conduit-size.html`, `earth.html`, `moltal.html`, `voltage-drop.html`, `install.html` — `<body>` 바로 아래에 인증 스크립트 삽입
- `sw.js` — 캐시 버전 v8로 올리고, 인증 관련 파일은 네트워크 우선으로 가져오도록 수정
- `privacy-policy.html` — **의도적으로 그대로 둠** (스토어 심사 시 로그인 없이 접근 가능해야 하는 페이지라 게이트를 걸지 않았습니다)

## 1. Firebase 프로젝트 생성

1. https://console.firebase.google.com 접속 → "프로젝트 추가"
2. 프로젝트 이름 입력 (Google Analytics는 꺼도 무방)

## 2. 로그인 방식 활성화

콘솔 왼쪽 메뉴 **Authentication → 시작하기 → Sign-in method**

- **이메일/비밀번호**: 사용 설정
- **Google**: 사용 설정 (프로젝트 지원 이메일 지정)

## 3. Firestore 데이터베이스 생성

**Firestore Database → 데이터베이스 만들기 → 프로덕션 모드** (규칙은 4번에서 덮어씁니다)

## 4. 보안 규칙 배포

**Firestore Database → 규칙** 탭에서 이 저장소의 `firestore.rules` 내용을 그대로 붙여넣고 게시하세요. (Firebase CLI를 쓴다면 `firebase deploy --only firestore:rules`)

## 5. 웹 앱 등록 및 설정값 반영

1. 프로젝트 설정(톱니바퀴) → 일반 → "내 앱" → 웹 아이콘(`</>`) 클릭 → 앱 등록
2. 표시되는 `firebaseConfig` 값을 복사해 `firebase-config.js`의 `window.firebaseConfig`에 그대로 붙여넣기

## 6. 관리자 이메일 지정

`firebase-config.js`의 `window.ADMIN_EMAILS`와 `firestore.rules`의 `isAdmin()` 목록에 **동일한 이메일**을 넣으세요. 현재는 `jisa861@gmail.com`으로 채워뒀습니다. 관리자를 더 추가하려면 두 파일 모두에 이메일을 추가해야 합니다.

## 7. 승인된 도메인 추가 (구글 로그인 필수)

**Authentication → Settings → 승인된 도메인**에 실제 서비스 도메인을 추가해야 구글 로그인 팝업이 정상 작동합니다.

## 8. 배포

호스팅 방식(GCS 버킷 + `gsutil rsync`)은 그대로 사용하시면 됩니다. 빌드 결과물(`./build`)에 새로 추가된 파일들(`firebase-config.js`, `auth-guard.js`, `login.html`, `admin.html`)이 포함되도록만 확인해주세요.

## 9. 관리자 계정 최초 승인 (중요, 1회만)

가입 즉시 모든 계정은 `approved: false` 상태로 생성됩니다. **관리자 본인 계정도 예외가 아니므로**, 처음 한 번은 Firebase 콘솔에서 수동으로 승인해야 admin.html에 들어갈 수 있습니다.

1. 배포된 `login.html`에서 관리자 이메일로 회원가입
2. Firebase 콘솔 → Firestore Database → `users` 컬렉션 → 방금 만든 문서 찾기
3. `approved` 필드를 `false → true`로 수동 변경
4. 이후부터는 `admin.html`에서 다른 사용자를 승인/차단할 수 있습니다

## 사용 흐름 요약

- 신규/기존 사용자가 계산기 페이지(안드로이드 앱 포함) 접속 → 로그인 안 되어 있으면 `login.html`로 이동
- 이메일가입 또는 구글 로그인 → Firestore에 `approved: false`로 사용자 문서 생성 → "승인 대기중" 화면 표시
- 관리자가 `admin.html`에서 승인 → 사용자가 다시 접속하면 정상 이용 가능

## 참고: 기존 안드로이드 사용자에 대한 영향

안드로이드 TWA 앱이 이 사이트의 URL을 그대로 불러오는 구조이므로, 배포 후에는 기존 사용자도 앱을 열면 로그인 화면을 보게 됩니다. Play Store 재제출이나 설정 변경은 필요 없습니다(같은 도메인/파일을 서빙할 뿐이므로). 실제 사용자라면 문의를 통해 승인 요청이 들어올 것이라는 전제로 설계했습니다.
