// ================= CUSTOM MODAL SYSTEM =================
// Ganti semua alert() dan confirm() bawaan browser

(function () {
  // Inject CSS
  const style = document.createElement("style");
  style.textContent = `
    #lf-modal-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(10, 5, 30, 0.65);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      opacity: 0; pointer-events: none;
      transition: opacity 0.22s ease;
    }
    #lf-modal-overlay.open {
      opacity: 1; pointer-events: all;
    }
    #lf-modal-box {
      background: #fff;
      border-radius: 24px;
      padding: 28px 28px 22px;
      max-width: 340px; width: 100%;
      box-shadow: 0 24px 60px rgba(0,0,0,0.22), 0 0 0 1.5px rgba(255,255,255,0.15);
      transform: scale(0.88) translateY(16px);
      transition: transform 0.26s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease;
      opacity: 0;
      position: relative;
      overflow: hidden;
    }
    #lf-modal-overlay.open #lf-modal-box {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
    #lf-modal-stripe {
      position: absolute; top: 0; left: 0; right: 0; height: 5px;
      border-radius: 24px 24px 0 0;
    }
    #lf-modal-icon {
      font-size: 2.6rem; line-height: 1;
      margin-bottom: 10px;
      display: block; text-align: center;
    }
    #lf-modal-title {
      font-family: 'Nunito', sans-serif;
      font-size: 1.15rem; font-weight: 800;
      color: #1a1033; text-align: center;
      margin: 0 0 6px;
      line-height: 1.3;
    }
    #lf-modal-msg {
      font-family: 'Nunito', sans-serif;
      font-size: 0.93rem; font-weight: 600;
      color: #4a4060; text-align: center;
      margin: 0 0 22px;
      line-height: 1.55;
    }
    #lf-modal-actions {
      display: flex; gap: 10px;
    }
    .lf-modal-btn {
      flex: 1; padding: 13px 10px;
      border: none; border-radius: 14px;
      font-family: 'Nunito', sans-serif;
      font-size: 0.97rem; font-weight: 800;
      cursor: pointer; transition: transform 0.12s ease, opacity 0.12s ease;
      letter-spacing: 0.02em;
    }
    .lf-modal-btn:active { transform: scale(0.96); opacity: 0.9; }
    .lf-modal-btn.primary {
      background: linear-gradient(135deg, #7c5cfc, #5b3cec);
      color: #fff;
      box-shadow: 0 4px 14px rgba(124,92,252,0.4);
    }
    .lf-modal-btn.danger {
      background: linear-gradient(135deg, #ff6b6b, #e74c3c);
      color: #fff;
      box-shadow: 0 4px 14px rgba(231,76,60,0.35);
    }
    .lf-modal-btn.success {
      background: linear-gradient(135deg, #43e97b, #38b2ac);
      color: #fff;
      box-shadow: 0 4px 14px rgba(67,233,123,0.35);
    }
    .lf-modal-btn.warning {
      background: linear-gradient(135deg, #f9ca24, #f0932b);
      color: #fff;
      box-shadow: 0 4px 14px rgba(249,202,36,0.35);
    }
    .lf-modal-btn.secondary {
      background: #f0edf8; color: #5b3cec;
      box-shadow: none;
    }
    .lf-modal-btn.secondary:hover { background: #e3ddf8; }

    /* Stripe warna per tipe */
    .stripe-success { background: linear-gradient(90deg,#43e97b,#38b2ac); }
    .stripe-error   { background: linear-gradient(90deg,#ff6b6b,#e74c3c); }
    .stripe-warning { background: linear-gradient(90deg,#f9ca24,#f0932b); }
    .stripe-info    { background: linear-gradient(90deg,#7c5cfc,#5b3cec); }
    .stripe-wrong   { background: linear-gradient(90deg,#ff6b6b,#f093fb); }
  `;
  document.head.appendChild(style);

  // Inject HTML
  const overlay = document.createElement("div");
  overlay.id = "lf-modal-overlay";
  overlay.innerHTML = `
    <div id="lf-modal-box">
      <div id="lf-modal-stripe"></div>
      <span id="lf-modal-icon"></span>
      <p id="lf-modal-title"></p>
      <p id="lf-modal-msg"></p>
      <div id="lf-modal-actions"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const overlayEl = document.getElementById("lf-modal-overlay");
  const stripeEl = document.getElementById("lf-modal-stripe");
  const iconEl = document.getElementById("lf-modal-icon");
  const titleEl = document.getElementById("lf-modal-title");
  const msgEl = document.getElementById("lf-modal-msg");
  const actionsEl = document.getElementById("lf-modal-actions");

  function openModal({ icon, title, msg, type = "info", buttons }) {
    return new Promise((resolve) => {
      iconEl.textContent = icon || "";
      titleEl.textContent = title || "";
      msgEl.textContent = msg || "";

      // Stripe
      stripeEl.className = `stripe-${type}`;

      actionsEl.innerHTML = "";
      buttons.forEach(({ label, style, value }) => {
        const btn = document.createElement("button");
        btn.className = `lf-modal-btn ${style || "primary"}`;
        btn.textContent = label;
        btn.onclick = () => {
          overlayEl.classList.remove("open");
          setTimeout(() => resolve(value), 220);
        };
        actionsEl.appendChild(btn);
      });

      // Tutup klik di luar
      overlayEl.onclick = (e) => {
        if (e.target === overlayEl) {
          overlayEl.classList.remove("open");
          setTimeout(() => resolve(null), 220);
        }
      };

      overlayEl.classList.add("open");
    });
  }

  // ================= PUBLIC API =================

  /**
   * showAlert(msg, type, icon, title)
   * type: 'success' | 'error' | 'warning' | 'info' | 'wrong'
   */
  window.showAlert = function (msg, type = "info", icon, title) {
    const defaults = {
      success: { icon: "🎉", title: "Yeay!" },
      error: { icon: "😵", title: "Oops!" },
      warning: { icon: "⚠️", title: "Perhatian" },
      info: { icon: "💡", title: "Info" },
      wrong: { icon: "❌", title: "Belum Tepat!" },
    };
    const d = defaults[type] || defaults.info;
    return openModal({
      icon: icon || d.icon,
      title: title || d.title,
      msg,
      type,
      buttons: [
        {
          label: "Oke!",
          style:
            type === "success"
              ? "success"
              : type === "error" || type === "wrong"
                ? "danger"
                : type === "warning"
                  ? "warning"
                  : "primary",
          value: true,
        },
      ],
    });
  };

  /**
   * showConfirm(msg, type, icon, title)
   * Returns Promise<true|false>
   */
  window.showConfirm = function (msg, type = "warning", icon, title) {
    const defaults = {
      warning: { icon: "⚠️", title: "Yakin?" },
      danger: { icon: "💔", title: "Yakin?" },
    };
    const d = defaults[type] || defaults.warning;
    return openModal({
      icon: icon || d.icon,
      title: title || d.title,
      msg,
      type,
      buttons: [
        { label: "Batal", style: "secondary", value: false },
        {
          label: "Ya, lanjut",
          style: type === "danger" ? "danger" : "warning",
          value: true,
        },
      ],
    });
  };

  /**
   * showXPAlert(msg, xp, type)
   * Khusus notif XP
   */
  window.showXPAlert = function (msg, xp, type = "success") {
    return openModal({
      icon: type === "success" ? "⭐" : "💸",
      title: type === "success" ? `+${xp} XP!` : `-${Math.abs(xp)} XP`,
      msg,
      type,
      buttons: [
        {
          label: "Lanjut! 🚀",
          style: type === "success" ? "success" : "warning",
          value: true,
        },
      ],
    });
  };

  /**
   * showHeartAlert(msg)
   * Khusus notif nyawa habis
   */
  window.showHeartAlert = function (msg) {
    return openModal({
      icon: "💔",
      title: "Nyawa Habis!",
      msg: msg || "Yah, nyawamu habis! Istirahat dulu ya.",
      type: "error",
      buttons: [{ label: "Kembali ke Menu", style: "danger", value: true }],
    });
  };

  /**
   * showWrongAlert(userSaid, correct)
   * Khusus jawaban salah di speaking/conversation
   */
  window.showWrongAlert = function (userSaid, correct) {
    return openModal({
      icon: "🎙️",
      title: "Hampir Benar!",
      msg: `Suaramu terbaca:\n"${userSaid}"\n\nJawaban yang benar:\n"${correct}"`,
      type: "wrong",
      buttons: [
        { label: "Dengar & Coba Lagi 🔊", style: "primary", value: true },
      ],
    });
  };
})();
