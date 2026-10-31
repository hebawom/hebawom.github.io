(() => {
  "use strict";

  const measurementId = "G-SWJ9DHE2NK";
  const preferenceKey = "horizon.analyticsConsent";
  const deniedConsent = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  };
  let choice = readChoice();
  let googleStarted = false;

  // A failed storage read leaves the preference unknown for this page only.
  function readChoice() {
    try {
      const saved = window.localStorage.getItem(preferenceKey);
      return saved === "accepted" || saved === "declined" ? saved : null;
    } catch {
      return null;
    }
  }

  // Keep the current-page choice even when browser storage is unavailable.
  function saveChoice(nextChoice) {
    choice = nextChoice;
    try {
      window.localStorage.setItem(preferenceKey, nextChoice);
    } catch {
      // The in-memory choice still applies until this page is left.
    }
  }

  // Build a small nonmodal notice with labelled controls and a policy link.
  function createBanner() {
    const element = document.createElement("section");
    element.className = "analytics-consent";
    element.hidden = true;
    element.setAttribute("role", "region");
    element.setAttribute("aria-labelledby", "analytics-consent-title");
    element.setAttribute("aria-describedby", "analytics-consent-description");

    const copy = document.createElement("div");
    const title = document.createElement("h2");
    title.id = "analytics-consent-title";
    title.textContent = "Help improve this website";
    const description = document.createElement("p");
    description.id = "analytics-consent-description";
    description.textContent = "Allow Google Analytics to collect technical visit, browser and device information? You can change this choice at any time.";
    const privacyLink = document.createElement("a");
    privacyLink.href = "privacy.html";
    privacyLink.textContent = "Read the privacy policy";
    copy.append(title, description, privacyLink);

    const actions = document.createElement("div");
    actions.className = "analytics-consent-actions";
    const acceptButton = document.createElement("button");
    acceptButton.type = "button";
    acceptButton.textContent = "Accept analytics";
    acceptButton.setAttribute("aria-label", "Accept website analytics");
    const declineButton = document.createElement("button");
    declineButton.type = "button";
    declineButton.textContent = "Decline analytics";
    declineButton.setAttribute("aria-label", "Decline website analytics");
    actions.append(acceptButton, declineButton);
    element.append(copy, actions);
    document.body.append(element);
    return { element, acceptButton, declineButton };
  }

  // Load Google's tag only after an explicit acceptance; config sends its normal page view.
  function startAnalytics() {
    if (choice !== "accepted" || googleStarted) return;
    googleStarted = true;
    window["ga-disable-" + measurementId] = false;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", deniedConsent);
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const googleScript = document.createElement("script");
    googleScript.async = true;
    googleScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    document.head.append(googleScript);
  }

  // Remove GA cookies on host-only and domain-scoped root paths when consent is declined.
  function clearAnalyticsCookies() {
    const names = document.cookie.split(";").map((item) => item.trim().split("=")[0]);
    const gaNames = names.filter((name) => name === "_ga" || name.startsWith("_ga_")
      || name === "_gid" || name === "_gat" || name.startsWith("_gat_") || name.startsWith("_gac_"));
    const hostname = window.location.hostname;
    const rootHost = hostname.replace(/^www\./i, "");
    const domains = new Set(["", hostname, "." + hostname, rootHost, "." + rootHost]);
    if (rootHost !== hostname) domains.add("www." + rootHost).add(".www." + rootHost);

    gaNames.forEach((name) => {
      domains.forEach((domain) => {
        const domainAttribute = domain ? "; Domain=" + domain : "";
        document.cookie = name + "=; Max-Age=0; Path=/" + domainAttribute + "; SameSite=Lax";
      });
    });
  }

  // Persist decline, revoke analytics consent, clear cookies, then reload an active tag.
  function declineAnalytics() {
    const reloadAfterWithdrawal = googleStarted;
    window["ga-disable-" + measurementId] = true;
    saveChoice("declined");
    banner.element.hidden = true;
    if (googleStarted && typeof window.gtag === "function") {
      window.gtag("consent", "update", deniedConsent);
    }
    clearAnalyticsCookies();
    if (reloadAfterWithdrawal) window.location.reload();
  }

  // The footer control reopens the choice without interrupting page interaction.
  function addSettingsButton() {
    const footer = document.querySelector(".site-footer");
    if (!footer) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "analytics-settings";
    button.textContent = "Analytics settings";
    button.setAttribute("aria-label", "Open analytics consent settings");
    button.addEventListener("click", () => {
      banner.element.hidden = false;
      banner.acceptButton.focus();
    });
    footer.append(button);
  }

  const banner = createBanner();
  banner.acceptButton.addEventListener("click", () => {
    saveChoice("accepted");
    banner.element.hidden = true;
    startAnalytics();
  });
  banner.declineButton.addEventListener("click", declineAnalytics);
  addSettingsButton();

  if (choice === "accepted") startAnalytics();
  else if (choice === null) banner.element.hidden = false;
})();
