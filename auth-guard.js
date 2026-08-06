// ============================================================
// auth-guard.js
// 계산기 페이지 상단(<body> 바로 아래)에서 로드되어,
//  1) 로그인 여부, 2) 관리자 승인(approved) 여부를 확인합니다.
// 미인증/미승인 사용자는 login.html 로 리다이렉트됩니다.
// 인증 통과 시 우측 하단에 계정 버튼(이메일/로그아웃/관리자 링크)을 표시합니다.
// ============================================================
(function () {
  // ---------- 인증 확인 중 화면을 가리는 오버레이 ----------
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
          overlay.remove();
          buildAccountWidget(user);
        } else {
          goLogin("pending");
        }
      })
      .catch(function (err) {
        console.error("승인 상태 확인 실패:", err);
        goLogin();
      });
  });

  // ---------- 우측 하단 계정 위젯 ----------
  function buildAccountWidget(user) {
    var admins = window.ADMIN_EMAILS || [];
    var isAdmin = admins.indexOf(user.email) !== -1;

    var style = document.createElement("style");
    style.textContent = [
      "#acct-fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));",
      "z-index:99998;width:46px;height:46px;border-radius:50%;border:none;cursor:pointer;",
      "background:#2b5596;color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.28);",
      "display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;",
      "font-family:'Segoe UI','Noto Sans KR',sans-serif;transition:transform .15s;}",
      "#acct-fab:hover{transform:scale(1.06);}",
      "#acct-panel{position:fixed;right:16px;bottom:calc(72px + env(safe-area-inset-bottom,0px));",
      "z-index:99998;width:238px;background:#fff;border-radius:12px;padding:14px;",
      "box-shadow:0 6px 24px rgba(0,0,0,.2);display:none;",
      "font-family:'Segoe UI','Noto Sans KR',sans-serif;}",
      "#acct-panel.open{display:block;}",
      "#acct-panel .who{font-size:11px;color:#999;margin-bottom:3px;}",
      "#acct-panel .mail{font-size:13px;color:#1e3a5f;font-weight:600;word-break:break-all;",
      "margin-bottom:12px;line-height:1.35;}",
      "#acct-panel a,#acct-panel button{display:block;width:100%;box-sizing:border-box;",
      "padding:9px 10px;border-radius:7px;font-size:13px;text-align:center;cursor:pointer;",
      "text-decoration:none;border:none;font-family:inherit;}",
      "#acct-admin{background:#eaf2fd;color:#2b5596;font-weight:600;margin-bottom:7px;}",
      "#acct-admin:hover{background:#dbe9fb;}",
      "#acct-logout{background:#f2f2f2;color:#555;font-weight:600;}",
      "#acct-logout:hover{background:#e6e6e6;}"
    ].join("");
    document.head.appendChild(style);

    var fab = document.createElement("button");
    fab.id = "acct-fab";
    fab.type = "button";
    fab.title = user.email;
    fab.setAttribute("aria-label", "계정 메뉴");
    fab.textContent = (user.email || "?").charAt(0).toUpperCase();

    var panel = document.createElement("div");
    panel.id = "acct-panel";
    panel.innerHTML =
      '<div class="who">로그인 계정</div>' +
      '<div class="mail"></div>' +
      (isAdmin ? '<a id="acct-admin" href="admin.html">사용자 승인 관리</a>' : "") +
      '<button id="acct-logout" type="button">로그아웃</button>';
    // 이메일은 textContent로 넣어 HTML 주입 방지
    panel.querySelector(".mail").textContent = user.email || "";

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    fab.addEventListener("click", function (e) {
      e.stopPropagation();
      panel.classList.toggle("open");
    });
    panel.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    document.addEventListener("click", function () {
      panel.classList.remove("open");
    });

    document.getElementById("acct-logout").addEventListener("click", function () {
      auth.signOut().then(function () {
        location.replace("login.html");
      });
    });
  }
})();
