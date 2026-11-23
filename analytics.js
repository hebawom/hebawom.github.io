(() => {
  "use strict";

  const measurementId = "G-SWJ9DHE2NK";
  const preferenceKey = "horizon.analyticsConsent";
  const sessionKey = "horizon.analyticsPromptAnswered";
  const deniedConsent = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  };
  const grantedConsent = {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  };
  let choice = readChoice();
  let googleStarted = false;
  let feedbackTimer = null;
  let interactionVersion = 0;

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
      return true;
    } catch {
      // The in-memory choice still applies until this page is left.
      return false;
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
    const status = document.createElement("p");
    status.className = "analytics-consent-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.hidden = true;
    copy.append(status);
    element.append(copy, actions);
    document.body.append(element);
    return { element, description, status, acceptButton, declineButton };
  }

  // Load Google's tag only after an explicit acceptance; config sends its normal page view.
  function startAnalytics() {
    if (choice !== "accepted") return;
    window["ga-disable-" + measurementId] = false;
    if (googleStarted) {
      window.gtag("consent", "update", grantedConsent);
      return;
    }
    googleStarted = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", deniedConsent);
    window.gtag("consent", "update", grantedConsent);
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

  // Remember that this tab has received a choice; a blocked session store only affects this page.
  function markAnsweredThisSession() {
    try {
      window.sessionStorage.setItem(sessionKey, "yes");
    } catch {
      // The current page still records the choice in memory.
    }
  }

  // Show the prior choice and clear any temporary button feedback when reopened.
  function showBanner() {
    interactionVersion += 1;
    if (feedbackTimer !== null) window.clearTimeout(feedbackTimer);
    feedbackTimer = null;
    [banner.acceptButton, banner.declineButton].forEach((button) => {
      button.disabled = false;
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });
    banner.status.hidden = true;
    const previous = choice === "accepted" ? "Your previous choice was to accept analytics. "
      : choice === "declined" ? "Your previous choice was to decline analytics. " : "";
    banner.description.textContent = previous
      + "Allow Google Analytics to collect technical visit, browser and device information? You can change this choice at any time.";
    banner.element.hidden = false;
    banner.acceptButton.focus();
  }

  // Apply the choice immediately, then keep its colour feedback visible before closing.
  function chooseAnalytics(nextChoice, selectedButton) {
    if (banner.acceptButton.disabled || banner.declineButton.disabled) return;
    const reloadAfterWithdrawal = nextChoice === "declined" && googleStarted;
    let saved = true;
    if (nextChoice === "accepted") {
      saved = saveChoice("accepted");
      startAnalytics();
    } else {
      const wasStarted = googleStarted;
      window["ga-disable-" + measurementId] = true;
      saved = saveChoice("declined");
      if (!saved) {
        try {
          window.localStorage.removeItem(preferenceKey);
        } catch {
          // Stay disabled on this page and avoid reloading a possibly stale acceptance.
        }
      }
      if (wasStarted && typeof window.gtag === "function") {
        window.gtag("consent", "update", deniedConsent);
      }
      clearAnalyticsCookies();
    }
    markAnsweredThisSession();
    const currentInteraction = ++interactionVersion;
    [banner.acceptButton, banner.declineButton].forEach((button) => {
      button.disabled = true;
      button.classList.toggle("is-selected", button === selectedButton);
      button.setAttribute("aria-pressed", button === selectedButton ? "true" : "false");
    });
    banner.status.textContent = nextChoice === "accepted" ? "Analytics accepted." : "Analytics declined.";
    banner.status.hidden = false;
    feedbackTimer = window.setTimeout(() => {
      if (currentInteraction !== interactionVersion) return;
      banner.element.hidden = true;
      if (reloadAfterWithdrawal && saved) window.location.reload();
    }, 900);
  }

  // The privacy page contains the only control for reopening the consent prompt.
  function addPrivacySettingsButton() {
    const button = document.querySelector("#analytics-settings");
    if (!button) return;
    button.addEventListener("click", showBanner);
  }

  const banner = createBanner();
  banner.acceptButton.addEventListener("click", () => chooseAnalytics("accepted", banner.acceptButton));
  banner.declineButton.addEventListener("click", () => chooseAnalytics("declined", banner.declineButton));
  addPrivacySettingsButton();

  if (choice === "accepted") startAnalytics();
  let answeredThisSession = false;
  try {
    answeredThisSession = window.sessionStorage.getItem(sessionKey) === "yes";
  } catch {
    // A blocked session store causes the prompt to appear again on the next page.
  }
  if (choice === null || !answeredThisSession) showBanner();
})();
