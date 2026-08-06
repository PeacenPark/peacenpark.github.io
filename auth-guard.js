// ============================================================
// auth-guard.js
// 계산기 페이지 상단(<body> 바로 아래)에서 로드되어,
// 1) 로그인 여부, 2) 관리자 승인(approved) 여부를 확인합니다.
// 미인증/미승인 사용자는 login.html 로 리다이렉트됩니다.
// ============================================================
(function () {
  // 확인이 끝나기 전까지 화면을 가리는 오버레이
  var overlay = document.createElement("div");
  overlay.id = "auth-check-overlay";
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:999999;background:#0f2038;" +
    "display:flex;align-items:center;justify-content:center;" +
    "flex-direction:column;color:#fff;font-family:'Segoe UI','Noto Sans KR',sans-serif;";
  overlay.innerHTML =
    '<div style="width:36px;height:36px;border:4px solid rgba(255,255,255,.25);' +
    'border-top-color:#4a90e2;border-radius:50%;animation:auth-spin 0.8s linear infinite;"></div>' +
    '<div style="margin-top:14px;font-size:14px;opacity:.85;">인증 확인 중...</div>' +
    "<style>@keyframes auth-spin{to{transform:rotate(360deg);}}</style>";
  document.documentElement.appendChild(overlay);

  function goLogin(status) {
    var redirect = encodeURIComponent(location.pathname + location.search);
    var qs = "redirect=" + redirect + (status ? "&status=" + status : "");
    location.replace("login.html?" + qs);
  }

  if (!window.firebaseConfig) {
    console.error("firebase-config.js 가 로드되지 않았습니다.");
    goLogin();
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(window.firebaseConfig);
  }
  var auth = firebase.auth();
  var db = firebase.firestore();

  auth.onAuthStateChanged(function (user) {
    if (!user) {
      goLogin();
      return;
    }

    db.collection("users")
      .doc(user.uid)
      .get()
      .then(function (doc) {
        if (doc.exists && doc.data().approved === true) {
          // 통과: 오버레이 제거하고 페이지 표시
          overlay.remove();
        } else {
          goLogin("pending");
        }
      })
      .catch(function (err) {
        console.error("승인 상태 확인 실패:", err);
        goLogin();
      });
  });
})();
