/**
 * MANYA KUMAR PORTFOLIO — INTERACTIVE ENGINE
 * Features: Spotlight cursor, Theme Toggle, Interactive Terminal,
 * Concurrency Simulators, Form Handling, Live Bangalore Clock, Resume Modal.
 */

document.addEventListener("DOMContentLoaded", () => {
  initSpotlight();
  initTheme();
  initNav();
  initClock();
  initContactForm();
  initResumeModal();
});

/* ==========================================================================
   1. POINTER SPOTLIGHT EFFECT
   ========================================================================== */
function initSpotlight() {
  const spotlight = document.getElementById("spotlight");
  if (!spotlight) return;

  // Only track on fine pointer devices (desktops/laptops)
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (e) => {
      spotlight.style.left = `${e.clientX}px`;
      spotlight.style.top = `${e.clientY}px`;
    });
  } else {
    spotlight.style.display = "none";
  }
}

/* ==========================================================================
   2. THEME CONTROLLER (Onyx & Plum)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const currentTheme = localStorage.getItem("manya_theme") || "onyx";

  document.documentElement.setAttribute("data-theme", currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const activeTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = activeTheme === "onyx" ? "plum" : "onyx";
      setTheme(newTheme);
    });
  }
}

function setTheme(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);
  localStorage.setItem("manya_theme", themeName);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", themeName === "plum" ? "#0a050e" : "#060709");
  }
}

/* ==========================================================================
   3. NAVIGATION & SCROLL TRACKING
   ========================================================================== */
function initNav() {
  const header = document.getElementById("header");
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  // Sticky header blur effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Active link highlighting
    let currentSection = "";
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((sec) => {
      const secTop = sec.offsetTop - 140;
      if (window.scrollY >= secTop) {
        currentSection = sec.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  });

  // Mobile menu toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener("click", () => {
      mobileDrawer.classList.toggle("open");
    });

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileDrawer.classList.remove("open");
      });
    });
  }
}

/* ==========================================================================
   4. LIVE BANGALORE LOCAL TIME
   ========================================================================== */
function initClock() {
  const clockEl = document.getElementById("liveBangaloreTime");
  if (!clockEl) return;

  function update() {
    try {
      const now = new Date();
      const options = {
        timeZone: "Asia/Kolkata",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      const timeStr = now.toLocaleTimeString("en-GB", options);
      clockEl.textContent = `${timeStr} IST (UTC+5:30)`;
    } catch (e) {
      clockEl.textContent = "Bangalore, India (UTC+5:30)";
    }
  }

  update();
  setInterval(update, 1000);
}

// Stubs for backward-compatibility if any external callers exist
window.executeCmd = () => {};
window.runLoadTesterDemo = () => {};
window.runSandboxDemo = () => {};

/* ==========================================================================
   7. CONTACT FORM (Wired to Express /send endpoint)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const btnIcon = document.getElementById("btnIcon");
  const btnSpinner = document.getElementById("btnSpinner");
  const feedback = document.getElementById("formFeedback");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      showFeedback("Please complete all required fields.", "error");
      return;
    }

    // Set loading state
    submitBtn.disabled = true;
    btnText.textContent = "Transmitting...";
    if (btnIcon) btnIcon.style.display = "none";
    if (btnSpinner) btnSpinner.style.display = "inline-block";
    feedback.style.display = "none";

    try {
      const res = await fetch("/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        if (data && data.sentViaSmtp) {
          showFeedback("✔ Message transmitted successfully to manyakumar1205@gmail.com! I will reply to you shortly.", "success");
        } else if (data && data.mailtoUrl) {
          showFeedback("✔ Message recorded! Opening your email client to send directly to manyakumar1205@gmail.com...", "success");
          window.location.href = data.mailtoUrl;
        } else {
          showFeedback("✔ Message transmitted successfully! I will reply to you shortly.", "success");
        }
        form.reset();
      } else {
        const errorMsg = (data && data.error) || "Error sending message.";
        showFeedback(`${errorMsg} Please email directly to manyakumar1205@gmail.com`, "error");
      }
    } catch (err) {
      showFeedback("Error connecting to server. Please email directly to manyakumar1205@gmail.com", "error");
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = "Transmit Message";
      if (btnIcon) btnIcon.style.display = "inline-block";
      if (btnSpinner) btnSpinner.style.display = "none";
    }
  });

  function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className = `form-feedback ${type}`;
    feedback.style.display = "block";
  }
}

/* ==========================================================================
   8. RESUME MODAL HANDLER
   ========================================================================== */
function initResumeModal() {
  const modal = document.getElementById("resumeModal");
  const openBtns = [
    document.getElementById("openResumeBtn"),
    document.getElementById("heroResumeBtn"),
  ].filter(Boolean);
  const closeBtn = document.getElementById("closeResumeBtn");

  if (!modal) return;

  openBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      closeModal();
    }
  });

  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

/* ==========================================================================
   9. UTILITIES (Copy to Clipboard)
   ========================================================================== */
function copyToClipboard(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    const originalSvg = btnElement.innerHTML;
    btnElement.innerHTML = `<span style="font-size:0.75rem;color:var(--signal);font-family:var(--font-mono)">Copied!</span>`;
    setTimeout(() => {
      btnElement.innerHTML = originalSvg;
    }, 2000);
  }).catch(() => {
    alert("Copied: " + text);
  });
}
window.copyToClipboard = copyToClipboard;
