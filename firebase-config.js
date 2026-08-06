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
  apiKey: "AIzaSyDQ9jeG9PdrKpwZiyJOyFCeWmGmE7D_YKw",
  authDomain: "eleccalc-909a7.firebaseapp.com",
  projectId: "eleccalc-909a7",
  storageBucket: "eleccalc-909a7.firebasestorage.app",
  messagingSenderId: "861602277525",
  appId: "1:861602277525:web:f54fe35128b50daed8939c",
  measurementId: "G-VL5YCH478H"
};

// 관리자로 지정할 이메일 목록 (admin.html 접근 및 승인 권한)
// 반드시 firestore.rules 의 isAdmin() 목록과 동일하게 맞춰주세요.
window.ADMIN_EMAILS = ["jisa861@gmail.com"];
