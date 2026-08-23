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
      "#acct-feedback{background:#fff4e5;color:#a35b00;font-weight:600;margin-bottom:7px;}",
      "#acct-feedback:hover{background:#ffe9cc;}",
      "#acct-logout{background:#f2f2f2;color:#555;font-weight:600;}",
      "#acct-logout:hover{background:#e6e6e6;}",

      /* 개선 요청 모달 */
      "#fb-back{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.45);",
      "display:none;align-items:center;justify-content:center;padding:16px;",
      "font-family:'Segoe UI','Noto Sans KR',sans-serif;}",
      "#fb-back.open{display:flex;}",
      "#fb-box{background:#fff;border-radius:14px;width:100%;max-width:420px;max-height:90vh;",
      "overflow-y:auto;padding:22px;box-shadow:0 10px 40px rgba(0,0,0,.3);}",
      "#fb-box h3{margin:0 0 4px;font-size:17px;color:#1e3a5f;}",
      "#fb-box .fb-sub{margin:0 0 16px;font-size:12px;color:#888;line-height:1.5;}",
      "#fb-box label{display:block;font-size:12px;font-weight:600;color:#555;margin:12px 0 5px;}",
      "#fb-box select,#fb-box textarea{width:100%;box-sizing:border-box;padding:10px 12px;",
      "border:1px solid #ddd;border-radius:8px;font-size:14px;font-family:inherit;}",
      "#fb-box textarea{min-height:120px;resize:vertical;line-height:1.5;}",
      "#fb-box select:focus,#fb-box textarea:focus{outline:none;border-color:#4a90e2;}",
      "#fb-msg{font-size:12.5px;min-height:18px;margin-top:10px;}",
      "#fb-msg.ok{color:#1e7e34;} #fb-msg.err{color:#d9534f;}",
      "#fb-actions{display:flex;gap:8px;margin-top:14px;}",
      "#fb-actions button{flex:1;padding:11px;border:none;border-radius:8px;font-size:14px;",
      "font-weight:600;cursor:pointer;font-family:inherit;}",
      "#fb-send{background:#2b5596;color:#fff;} #fb-send:hover{background:#22467d;}",
      "#fb-send:disabled{background:#9db3d4;cursor:default;}",
      "#fb-cancel{background:#eee;color:#555;}"
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
      '<button id="acct-feedback" type="button">💬 앱 개선 요청</button>' +
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

    // 개선 요청 모달 연결
    buildFeedbackModal(user);
    document.getElementById("acct-feedback").addEventListener("click", function () {
      panel.classList.remove("open");
      openFeedback();
    });
  }

  // ---------- 앱 개선 요청 모달 ----------
  var CALC_PAGES = [
    ["", "선택 안 함 / 전체"],
    ["cable2.html", "케이블 계산기"],
    ["conduit-size.html", "전선관 굵기"],
    ["voltage-drop.html", "전압 강하"],
    ["moltal.html", "몰탈/기타"],
    ["earth.html", "접지 계산기"],
    ["기타", "기타 / 해당 없음"]
  ];

  function openFeedback() {
    var back = document.getElementById("fb-back");
    if (back) back.classList.add("open");
  }

  function buildFeedbackModal(user) {
    var back = document.createElement("div");
    back.id = "fb-back";

    // 현재 페이지를 기본 선택값으로
    var here = location.pathname.split("/").pop() || "";
    var options = CALC_PAGES.map(function (p) {
      var sel = (p[0] && p[0] === here) ? " selected" : "";
      return '<option value="' + p[0] + '"' + sel + ">" + p[1] + "</option>";
    }).join("");

    back.innerHTML =
      '<div id="fb-box">' +
      "<h3>앱 개선 요청</h3>" +
      '<p class="fb-sub">오류 제보나 필요한 기능을 남겨주시면 검토 후 반영하겠습니다.<br>보내주신 의견은 큰 도움이 됩니다. 감사합니다!</p>' +
      '<label for="fb-type">유형</label>' +
      '<select id="fb-type">' +
      '<option value="오류">🐞 오류 / 계산 결과 이상</option>' +
      '<option value="기능제안">💡 기능 제안</option>' +
      '<option value="기타">💬 기타 의견</option>' +
      "</select>" +
      '<label for="fb-page">관련 계산기</label>' +
      '<select id="fb-page">' + options + "</select>" +
      '<label for="fb-text">내용 <span style="color:#d9534f;">*</span></label>' +
      '<textarea id="fb-text" placeholder="어떤 상황에서 어떤 문제가 있었는지, 입력값과 함께 적어주시면 확인이 빠릅니다."></textarea>' +
      '<div id="fb-msg"></div>' +
      '<div id="fb-actions">' +
      '<button id="fb-cancel" type="button">닫기</button>' +
      '<button id="fb-send" type="button">보내기</button>' +
      "</div>" +
      "</div>";

    document.body.appendChild(back);

    function close() {
      back.classList.remove("open");
      document.getElementById("fb-msg").textContent = "";
      document.getElementById("fb-msg").className = "";
    }

    back.addEventListener("click", function (e) {
      if (e.target === back) close();
    });
    document.getElementById("fb-cancel").addEventListener("click", close);

    document.getElementById("fb-send").addEventListener("click", function () {
      var msg = document.getElementById("fb-msg");
      var textEl = document.getElementById("fb-text");
      var text = textEl.value.trim();
      var sendBtn = this;

      if (!text) {
        msg.textContent = "내용을 입력해주세요.";
        msg.className = "err";
        textEl.focus();
        return;
      }

      sendBtn.disabled = true;
      msg.textContent = "전송 중...";
      msg.className = "";

      db.collection("feedback").add({
        uid: user.uid,
        email: user.email || "",
        type: document.getElementById("fb-type").value,
        page: document.getElementById("fb-page").value,
        text: text,
        status: "접수",
        userAgent: navigator.userAgent,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function () {
        msg.textContent = "소중한 의견 감사합니다. 검토 후 반영하겠습니다.";
        msg.className = "ok";
        textEl.value = "";
        sendBtn.disabled = false;
        setTimeout(close, 1800);
      }).catch(function (err) {
        msg.textContent = "전송 실패: " + err.message;
        msg.className = "err";
        sendBtn.disabled = false;
      });
    });
  }
})();
