// Lightweight, zero-dependency GDPR Cookie Consent
(function() {
  const CONSENT_KEY = "fms_cookie_consent_status";

  // Check if consent has already been recorded
  if (localStorage.getItem(CONSENT_KEY)) return;

  // Build the consent modal element
  const banner = document.createElement("div");
  banner.id = "cookieConsentBanner";
  banner.innerHTML = `
    <div class="cookie-content">
      <div class="cookie-text">
        <strong>🍪 Cookie &amp; Privacy Notice:</strong> 
        We use essential cookies and anonymized analytics to maintain this tool and ensure hardware safety. No audio is ever recorded.
      </div>
      <div class="cookie-actions">
        <button id="acceptCookiesBtn" class="btn btn-small btn-primary">Accept All</button>
        <button id="rejectCookiesBtn" class="btn btn-small btn-secondary">Essential Only</button>
      </div>
    </div>
  `;

  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(banner);

    document.getElementById("acceptCookiesBtn").addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "accepted");
      banner.remove();
    });

    document.getElementById("rejectCookiesBtn").addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "rejected_non_essential");
      banner.remove();
    });
  });
})();