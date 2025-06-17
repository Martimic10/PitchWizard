const generateBtn = document.getElementById("generate-btn");
const outputSection = document.getElementById("output-section");
const upgradeSection = document.getElementById("upgrade-section");
const proposalText = document.getElementById("proposal-text");
const copyBtn = document.getElementById("copy-btn");
const resetBtn = document.getElementById("reset-btn");
const jobInput = document.getElementById("job");
const toneSelect = document.getElementById("tone");
const generationCountText = document.getElementById("generationCountText");

const DAILY_LIMIT = 3;
const STORAGE_KEY = "pitchWizardUsage";

document.addEventListener("DOMContentLoaded", () => {
  resetDailyCountIfNeeded();
  updateUI();
});

generateBtn.addEventListener("click", async () => {
  const usage = getUsageData();

  if (usage.count >= DAILY_LIMIT) {
    outputSection.style.display = "none";
    upgradeSection.style.display = "block";
    return;
  }

  const job = jobInput.value.trim();
  const tone = toneSelect.value;

  if (!job || !tone) {
    alert("Please fill out both the job description and tone.");
    return;
  }

  proposalText.textContent = "Generating your proposal... ⏳";
  outputSection.style.display = "block";
  upgradeSection.style.display = "none";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ job, tone }),
    });

    const data = await response.json();

    if (data.text) {
      proposalText.textContent = data.text;
      usage.count++;
      saveUsageData(usage);
      updateUI();
    } else {
      proposalText.textContent = "Something went wrong. Please try again.";
    }
  } catch (err) {
    proposalText.textContent = "Error generating proposal.";
    console.error(err);
  }
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(proposalText.textContent)
    .then(() => {
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = "Copy";
      }, 1500);
    })
    .catch(err => alert("Failed to copy: " + err));
});

resetBtn.addEventListener("click", () => {
  proposalText.textContent = "Your AI-generated proposal will appear here.";
  outputSection.style.display = "none";
});


function getUsageData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : { date: todayString(), count: 0 };
}

function saveUsageData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

function resetDailyCountIfNeeded() {
  const usage = getUsageData();
  if (usage.date !== todayString()) {
    saveUsageData({ date: todayString(), count: 0 });
  }
}

function updateUI() {
  const usage = getUsageData();
  const remaining = Math.max(DAILY_LIMIT - usage.count, 0);
  generationCountText.textContent = `${remaining} free generation${remaining !== 1 ? "s" : ""} remaining`;

  if (remaining === 0) {
    upgradeSection.style.display = "block";
    outputSection.style.display = "none";
  } else {
    upgradeSection.style.display = "none";
  }
}