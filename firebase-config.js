// ============================================================
// Firebase 프로젝트 설정 파일
// ------------------------------------------------------------
// Firebase 콘솔(https://console.firebase.google.com) > 프로젝트 설정
// > 일반 탭 > "내 앱" 섹션의 웹 앱(</>) 등록 후 나오는 firebaseConfig
// 값을 아래에 그대로 붙여넣으세요.
//
// 이 파일은 공개되어도 안전합니다 (Firebase 웹 API 키는 공개 키이며
// 실제 접근 제어는 Firestore 보안 규칙(firestore.rules)이 담당합니다).
// ============================================================
window.firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 관리자로 지정할 이메일 목록 (admin.html 접근 및 승인 권한)
// 반드시 firestore.rules 의 isAdmin() 목록과 동일하게 맞춰주세요.
window.ADMIN_EMAILS = ["jisa861@gmail.com"];
