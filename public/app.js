const nav = document.getElementById("site-nav");
const toggle = document.querySelector(".nav-toggle");
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const yearEl = document.getElementById("year");

yearEl.textContent = new Date().getFullYear();

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
});

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `form-status ${type || ""}`.trim();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Sending...", "");

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    company: form.company.value.trim(),
    message: form.message.value.trim()
  };

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      const details = Array.isArray(data.details) ? data.details.join(" ") : data.error;
      setStatus(details || "Please check the form and try again.", "error");
      return;
    }

    form.reset();
    setStatus(data.message, "success");
  } catch (error) {
    setStatus("Network error. Please try again.", "error");
  }
});
