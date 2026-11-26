const menuButton = document.querySelector(".bar-menu button");
const dropdown = document.querySelector(".dropdown-menu");
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = themeToggle?.querySelector("i");
const scrollTopButton = document.querySelector(".scroll-top");

const setTheme = (isLight) => {
  document.body.classList.toggle("light-theme", isLight);
  themeIcon?.classList.toggle("fa-moon", isLight);
  themeIcon?.classList.toggle("fa-sun", !isLight);
  themeToggle?.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
};

setTheme(localStorage.getItem("portfolio-theme") === "light");
themeToggle?.addEventListener("click", () => setTheme(!document.body.classList.contains("light-theme")));

menuButton?.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  dropdown.classList.toggle("show", !expanded);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".bar-menu")) {
    dropdown?.classList.remove("show");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

window.addEventListener("scroll", () => {
  scrollTopButton?.classList.toggle("show", window.scrollY > 350);
});

scrollTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const navigationLinks = document.querySelectorAll(".header .menu a, .dropdown-menu a");
const pageSections = ["Home", "about", "education", "services", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const updateActiveNavigation = () => {
  const marker = window.scrollY + (window.innerHeight * 0.35);
  let activeId = pageSections[0]?.id;

  pageSections.forEach((section) => {
    if (section.offsetTop <= marker) {
      activeId = section.id;
    }
  });

  navigationLinks.forEach((link) => {
    const isActive = link.hash === `#${activeId}`;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

window.addEventListener("scroll", updateActiveNavigation, { passive: true });
window.addEventListener("resize", updateActiveNavigation);
updateActiveNavigation();

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    dropdown?.classList.remove("show");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const animatedText = document.querySelector(".text-animation span");
const textList = [
  "Frontend Developer",
  "Web Designer",
  "Website Creator",
  "Web Developer",
  "Software Tester"
];

if (animatedText && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let textIndex = 0;
  let characterIndex = textList[0].length;
  animatedText.textContent = textList[0];

  const wait = (milliseconds) =>
    new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  const runTextAnimation = async () => {
    while (true) {
      await wait(1400);

      const currentText = textList[textIndex];
      while (characterIndex > 0) {
        characterIndex -= 1;
        animatedText.textContent = currentText.slice(0, characterIndex);
        await wait(55);
      }

      await wait(250);
      textIndex = (textIndex + 1) % textList.length;

      const nextText = textList[textIndex];
      characterIndex = 0;
      while (characterIndex < nextText.length) {
        characterIndex += 1;
        animatedText.textContent = nextText.slice(0, characterIndex);
        await wait(70);
      }
    }
  };

  runTextAnimation();
} else if (animatedText) {
  animatedText.textContent = textList[0];
}

const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("#contact-status");
const contactSubmitButton = contactForm?.querySelector('button[type="submit"]');

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  contactStatus.textContent = "Sending your message...";
  contactStatus.className = "contact-status loading";
  contactSubmitButton.disabled = true;
  contactSubmitButton.textContent = "Sending...";

  fetch("./send-contact.php", {
    method: "POST",
    body: new FormData(contactForm)
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Unable to send message.");
      }
      contactStatus.textContent = data.message;
      contactStatus.className = "contact-status success";
      contactForm.reset();
    })
    .catch((error) => {
      contactStatus.textContent = error.message || "Unable to send message.";
      contactStatus.className = "contact-status error";
    })
    .finally(() => {
      contactSubmitButton.disabled = false;
      contactSubmitButton.textContent = "Send Message";
    });
});
