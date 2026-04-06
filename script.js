const steps = {
  auth: document.getElementById("step-auth"),
  details: document.getElementById("step-details"),
  consent: document.getElementById("step-consent"),
  certificate: document.getElementById("step-certificate"),
};

const mobileForm = document.getElementById("mobile-form");
const otpForm = document.getElementById("otp-form");
const detailsForm = document.getElementById("details-form");
const consentForm = document.getElementById("consent-form");

const mobileInput = document.getElementById("mobile");
const otpInput = document.getElementById("otp");
const authMessage = document.getElementById("auth-message");
const certificatePreview = document.getElementById("certificate-preview");

const downloadBtn = document.getElementById("download-certificate");
const restartBtn = document.getElementById("restart-flow");

const state = {
  otpSent: false,
  generatedOtp: "",
  mobile: "",
  fullName: "",
  email: "",
  region: "",
  city: "",
};

function showStep(stepKey) {
  Object.values(steps).forEach((section) => section.classList.remove("active"));
  steps[stepKey].classList.add("active");
}

function getTodayDateString() {
  const today = new Date();
  return today.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sanitizeText(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCertificate() {
  const certificateHtml = `
    <div class="certificate-card">
      <h3>Election Commission</h3>
      <p class="certificate-title">Certificate of Appreciation</p>
      <p>This certifies that</p>
      <p class="certificate-name">${sanitizeText(state.fullName)}</p>
      <p>
        from ${sanitizeText(state.city)}, ${sanitizeText(state.region)} has taken
        the voter pledge to cast their vote responsibly.
      </p>
      <p class="certificate-date">Date: ${sanitizeText(getTodayDateString())}</p>
    </div>
  `;

  certificatePreview.innerHTML = certificateHtml;
}

function buildCertificateText() {
  return [
    "Election Commission - Certificate of Appreciation",
    "------------------------------------------------",
    `Name      : ${state.fullName}`,
    `Mobile    : ${state.mobile}`,
    `Email     : ${state.email}`,
    `Region    : ${state.region}`,
    `City      : ${state.city}`,
    `Date      : ${getTodayDateString()}`,
    "",
    "This certifies that the participant has pledged to cast their vote responsibly.",
  ].join("\n");
}

function downloadCertificate() {
  const certificateContent = buildCertificateText();
  const blob = new Blob([certificateContent], { type: "text/plain" });
  const downloadUrl = URL.createObjectURL(blob);

  const tempLink = document.createElement("a");
  const fileSafeName = state.fullName.trim().toLowerCase().replace(/\s+/g, "-");
  tempLink.href = downloadUrl;
  tempLink.download = `voter-pledge-certificate-${fileSafeName || "participant"}.txt`;

  document.body.appendChild(tempLink);
  tempLink.click();
  tempLink.remove();

  URL.revokeObjectURL(downloadUrl);
}

mobileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!mobileInput.checkValidity()) {
    mobileInput.reportValidity();
    return;
  }

  state.mobile = mobileInput.value.trim();
  state.generatedOtp = generateOtp();
  state.otpSent = true;

  otpForm.classList.remove("hidden");
  authMessage.textContent = `OTP sent via SMS to +91 ${state.mobile}. Demo OTP: ${state.generatedOtp}`;
  authMessage.className = "message success";
  otpInput.focus();
});

otpForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!state.otpSent) {
    authMessage.textContent = "Please request OTP first.";
    authMessage.className = "message error";
    return;
  }

  const enteredOtp = otpInput.value.trim();

  if (!/^\d{6}$/.test(enteredOtp)) {
    authMessage.textContent = "Enter a valid 6-digit OTP.";
    authMessage.className = "message error";
    return;
  }

  if (enteredOtp !== state.generatedOtp) {
    authMessage.textContent = "Incorrect OTP. Please try again.";
    authMessage.className = "message error";
    return;
  }

  authMessage.textContent = "OTP verified successfully.";
  authMessage.className = "message success";
  showStep("details");
});

detailsForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(detailsForm);
  state.fullName = String(formData.get("fullName") || "").trim();
  state.email = String(formData.get("email") || "").trim();
  state.region = String(formData.get("region") || "").trim();
  state.city = String(formData.get("city") || "").trim();

  if (!detailsForm.checkValidity()) {
    detailsForm.reportValidity();
    return;
  }

  showStep("consent");
});

consentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!consentForm.checkValidity()) {
    consentForm.reportValidity();
    return;
  }

  renderCertificate();
  showStep("certificate");
});

downloadBtn.addEventListener("click", downloadCertificate);

restartBtn.addEventListener("click", () => {
  state.otpSent = false;
  state.generatedOtp = "";
  state.mobile = "";
  state.fullName = "";
  state.email = "";
  state.region = "";
  state.city = "";

  mobileForm.reset();
  otpForm.reset();
  detailsForm.reset();
  consentForm.reset();
  otpForm.classList.add("hidden");
  authMessage.textContent = "";
  authMessage.className = "message";
  certificatePreview.innerHTML = "";
  showStep("auth");
});
