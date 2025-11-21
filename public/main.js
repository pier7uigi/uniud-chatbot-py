const chat = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("question");
const deptSelect = document.getElementById("department");
const modeButtons = document.querySelectorAll(".mode-btn");
const deptSelectWrapper = document.getElementById("dept-select-wrapper");
const newChatBtn = document.getElementById("new-chat-btn");
const qaContainer = document.getElementById("qa-chips");

const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const settingsClose = document.getElementById("settings-close");
const langButtons = document.querySelectorAll(".lang-btn");

let currentMode = "ATENEO"; // ATENEO | DEPARTMENT
let currentLanguage = "IT"; // IT | EN
let typingNode = null;

// Mappatura URL dipartimenti
const deptUrls = {
  ATENEO: "https://www.uniud.it/it",
  DIES: "https://dies.uniud.it/it",
  DI4A: "https://di4a.uniud.it/it",
  DMED: "https://dmed.uniud.it/it",
  DILL: "https://dill.uniud.it/it",
  DISG: "https://disg.uniud.it/it",
  DMIF: "https://dmif.uniud.it/it",
  DIUM: "https://www.uniud.it/it/ateneo-uniud/ateneo-uniud-organizzazione/dipartimenti/dium",
  DPIA: "https://dpia.uniud.it/",
};

// i18n semplice
const i18n = {
  IT: {
    title: "UniUd ChatBot",
    subtitle: "Risposte smart per studenti UniUd",
    newChat: "Nuova conversazione",
    modeAteneo: "Info generiche Ateneo",
    modeDept: "Info per dipartimento",
    deptLabel: "Dipartimento",
    shortcuts: "Scorciatoie rapide",
    inputPlaceholder:
      "Fai una domanda su UniUd (tasse, corsi, bandi, dipartimenti...)",
    send: "Invia",
    settingsTitle: "Impostazioni",
    language: "Lingua",
  },
  EN: {
    title: "UniUd ChatBot",
    subtitle: "Smart answers for UniUd students",
    newChat: "New conversation",
    modeAteneo: "General UniUd info",
    modeDept: "Department info",
    deptLabel: "Department",
    shortcuts: "Quick shortcuts",
    inputPlaceholder:
      "Ask something about UniUd (fees, programmes, calls, departments...)",
    send: "Send",
    settingsTitle: "Settings",
    language: "Language",
  },
};

// Scorciatoie per contesto
function getQuickActions(context, dept) {
  if (context === "ATENEO") {
    return [
      {
        type: "link",
        labelIT: "Vai al sito di Ateneo",
        labelEN: "Go to UniUd website",
        icon: "fa-solid fa-globe",
        url: deptUrls.ATENEO,
        primary: true,
      },
      {
        type: "question",
        labelIT: "Immatricolarsi",
        labelEN: "Enrollment",
        icon: "fa-solid fa-id-card",
        questionIT: "Come mi immatricolo all'Università di Udine?",
        questionEN: "How can I enroll at the University of Udine?",
      },
      {
        type: "question",
        labelIT: "Tasse e contributi",
        labelEN: "Tuition fees",
        icon: "fa-solid fa-coins",
        questionIT: "Come funzionano le tasse universitarie a UniUd?",
        questionEN: "How do tuition fees work at UniUd?",
      },
      {
        type: "question",
        labelIT: "Piano di studi",
        labelEN: "Study plan",
        icon: "fa-solid fa-table-list",
        questionIT:
          "Come posso vedere o modificare il mio piano di studi a UniUd?",
        questionEN: "How can I view or edit my study plan at UniUd?",
      },
      {
        type: "question",
        labelIT: "Orari lezioni",
        labelEN: "Class timetables",
        icon: "fa-solid fa-clock",
        questionIT: "Dove trovo gli orari delle lezioni a UniUd?",
        questionEN: "Where can I find class timetables at UniUd?",
      },
    ];
  }

  if (context === "DEPARTMENT" && dept === "DIES") {
    return [
      {
        type: "link",
        labelIT: "Vai al DIES",
        labelEN: "Go to DIES website",
        icon: "fa-solid fa-globe",
        url: deptUrls.DIES,
        primary: true,
      },
      {
        type: "question",
        labelIT: "Corsi di laurea DIES",
        labelEN: "DIES degree programmes",
        icon: "fa-solid fa-graduation-cap",
        questionIT:
          "Quali corsi di laurea offre il Dipartimento DIES di UniUd?",
        questionEN:
          "Which degree programmes does the DIES department at UniUd offer?",
      },
      {
        type: "question",
        labelIT: "Orari lezioni DIES",
        labelEN: "DIES class timetables",
        icon: "fa-solid fa-clock",
        questionIT: "Dove trovo gli orari delle lezioni dei corsi del DIES?",
        questionEN:
          "Where can I find the class timetables for DIES programmes?",
      },
      {
        type: "question",
        labelIT: "Piano di studi DIES",
        labelEN: "DIES study plan",
        icon: "fa-solid fa-table-list",
        questionIT:
          "Come funziona il piano di studi per i corsi di economia del DIES?",
        questionEN:
          "How does the study plan work for economics programmes at DIES?",
      },
    ];
  }

  if (context === "DEPARTMENT" && dept === "DI4A") {
    return [
      {
        type: "link",
        labelIT: "Vai al DI4A",
        labelEN: "Go to DI4A website",
        icon: "fa-solid fa-globe",
        url: deptUrls.DI4A,
        primary: true,
      },
      {
        type: "question",
        labelIT: "Corsi di laurea DI4A",
        labelEN: "DI4A degree programmes",
        icon: "fa-solid fa-seedling",
        questionIT:
          "Quali corsi di laurea offre il Dipartimento DI4A di UniUd?",
        questionEN:
          "Which degree programmes does the DI4A department at UniUd offer?",
      },
      {
        type: "question",
        labelIT: "Laboratori e ricerca DI4A",
        labelEN: "DI4A labs and research",
        icon: "fa-solid fa-flask",
        questionIT:
          "Quali sono le principali aree di ricerca e i laboratori del DI4A?",
        questionEN:
          "What are the main research areas and labs at the DI4A department?",
      },
    ];
  }

  // Default dipartimenti non specifici
  if (context === "DEPARTMENT" && dept) {
    const url = deptUrls[dept] || deptUrls.ATENEO;
    return [
      {
        type: "link",
        labelIT: "Vai al sito del dipartimento",
        labelEN: "Go to department website",
        icon: "fa-solid fa-globe",
        url,
        primary: true,
      },
      {
        type: "question",
        labelIT: "Corsi di laurea del dipartimento",
        labelEN: "Department degree programmes",
        icon: "fa-solid fa-graduation-cap",
        questionIT: `Quali corsi di laurea offre il dipartimento ${dept} dell'Università di Udine?`,
        questionEN: `Which degree programmes does the ${dept} department at UniUd offer?`,
      },
    ];
  }

  return [];
}

// Render scorciatoie
function renderQuickActions() {
  qaContainer.innerHTML = "";

  let context = "ATENEO";
  let dept = "";

  if (currentMode === "DEPARTMENT") {
    context = "DEPARTMENT";
    dept = deptSelect.value || "";
  }

  const actions = getQuickActions(context, dept);
  actions.forEach((act) => {
    const btn = document.createElement("button");
    btn.className = "qa-chip";
    if (act.primary) btn.classList.add("primary-chip");

    const icon = document.createElement("i");
    icon.className = act.icon;
    btn.appendChild(icon);

    const labelSpan = document.createElement("span");
    labelSpan.textContent =
      currentLanguage === "IT" ? act.labelIT : act.labelEN;
    btn.appendChild(labelSpan);

    if (act.type === "link") {
      btn.addEventListener("click", () => {
        window.open(act.url, "_blank", "noopener");
      });
    } else if (act.type === "question") {
      btn.addEventListener("click", () => {
        const q =
          currentLanguage === "IT" ? act.questionIT : act.questionEN;
        sendQuestion(q);
      });
    }

    qaContainer.appendChild(btn);
  });
}

// Helpers UI
function addMessage(text, who = "user") {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.innerHTML = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function showTyping() {
  if (typingNode) return;

  const wrapper = document.createElement("div");
  wrapper.className = "typing-indicator-wrapper";

  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";

  const robot = document.createElement("div");
  robot.className = "typing-robot";

  const eyes = document.createElement("div");
  eyes.className = "eyes";
  eyes.innerHTML = "<span></span><span></span>";

  const mouth = document.createElement("div");
  mouth.className = "mouth";

  robot.appendChild(eyes);
  robot.appendChild(mouth);

  const dots = document.createElement("div");
  dots.className = "typing-dots";
  dots.innerHTML = "<span></span><span></span><span></span>";

  indicator.appendChild(robot);
  indicator.appendChild(dots);

  wrapper.appendChild(indicator);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;

  typingNode = wrapper;
}

function hideTyping() {
  if (typingNode && typingNode.parentNode) {
    typingNode.parentNode.removeChild(typingNode);
  }
  typingNode = null;
}

// Tema dipartimenti (TUTTI i dipartimenti)
function updateThemeForDepartment(dept) {
  const body = document.body;
  body.classList.remove(
    "theme-default",
    "theme-dies",
    "theme-di4a",
    "theme-dmed",
    "theme-dill",
    "theme-disg",
    "theme-dmif",
    "theme-dium",
    "theme-dpia"
  );

  switch (dept) {
    case "DIES":
      body.classList.add("theme-dies");
      break;
    case "DI4A":
      body.classList.add("theme-di4a");
      break;
    case "DMED":
      body.classList.add("theme-dmed");
      break;
    case "DILL":
      body.classList.add("theme-dill");
      break;
    case "DISG":
      body.classList.add("theme-disg");
      break;
    case "DMIF":
      body.classList.add("theme-dmif");
      break;
    case "DIUM":
      body.classList.add("theme-dium");
      break;
    case "DPIA":
      body.classList.add("theme-dpia");
      break;
    default:
      body.classList.add("theme-default");
  }
}

// Modalità Ateneo / Dipartimento
modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    if (mode === currentMode) return;

    modeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = mode;

    if (currentMode === "ATENEO") {
      deptSelectWrapper.classList.add("hidden");
      deptSelect.value = "";
      updateThemeForDepartment("");
    } else {
      deptSelectWrapper.classList.remove("hidden");
      updateThemeForDepartment(deptSelect.value || "");
    }

    renderQuickActions();
  });
});

// Cambio dipartimento
deptSelect.addEventListener("change", () => {
  const dept = deptSelect.value;
  updateThemeForDepartment(dept || "");
  renderQuickActions();
});

// Nuova conversazione
newChatBtn.addEventListener("click", () => {
  chat.innerHTML = "";
  input.value = "";
  hideTyping();

  currentMode = "ATENEO";
  deptSelect.value = "";
  deptSelectWrapper.classList.add("hidden");
  modeButtons.forEach((b) =>
    b.dataset.mode === "ATENEO"
      ? b.classList.add("active")
      : b.classList.remove("active")
  );
  updateThemeForDepartment("");

  renderQuickActions();
});

// Funzione comune invio domanda
async function sendQuestion(questionText) {
  const q = questionText.trim();
  if (!q) return;

  let departmentToSend = "ATENEO";
  if (currentMode === "DEPARTMENT") {
    const selected = deptSelect.value;
    if (!selected) {
      const msg =
        currentLanguage === "IT"
          ? "Seleziona prima un dipartimento per continuare 🙂"
          : "Please select a department first 🙂";
      addMessage(msg, "bot");
      return;
    }
    departmentToSend = selected;
  }

  addMessage(q, "user");
  input.value = "";

  showTyping();

  try {
    const res = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: q,
        department: departmentToSend,
        language: currentLanguage,
      }),
    });

    const data = await res.json();
    hideTyping();

    if (data.error) {
      addMessage("Errore: " + data.error, "bot");
      return;
    }

    // \n -> <br> e Markdown link -> <a>
    let formatted = (data.answer || "").replace(/\n/g, "<br>");
    formatted = formatted.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    addMessage(formatted, "bot");
  } catch (err) {
    hideTyping();
    const msg =
      currentLanguage === "IT"
        ? "Errore di connessione al server."
        : "Connection error with the server.";
    addMessage(msg, "bot");
  }
}

// Submit form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  sendQuestion(input.value);
});

// Popup impostazioni
settingsBtn.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
});

settingsClose.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
});

settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add("hidden");
  }
});

// Cambio lingua
function applyLanguage() {
  const dict = i18n[currentLanguage];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  const inputEl = document.querySelector("[data-i18n-placeholder]");
  if (inputEl) {
    const key = inputEl.getAttribute("data-i18n-placeholder");
    if (dict[key]) inputEl.placeholder = dict[key];
  }

  renderQuickActions();
}

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    if (lang === currentLanguage) return;
    currentLanguage = lang;

    langButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    applyLanguage();
  });
});

// Stato iniziale
applyLanguage();
renderQuickActions();
