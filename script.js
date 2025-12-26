document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("treForm");
  const templateSelect = document.getElementById("templateSelect");
  const otherBox = document.getElementById("otherBox");
  const statusMessage = document.getElementById("statusMessage");

  // CHANGE THIS
  const LOGIC_APP_URL = "https://YOUR-LA1-ENDPOINT-HERE";

  templateSelect.addEventListener("change", () => {
    if (templateSelect.value === "other") {
      otherBox.classList.remove("hidden");
    } else {
      otherBox.classList.add("hidden");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    statusMessage.className = "hidden";
    statusMessage.textContent = "";

    const f = e.target;

    // 🔒 CANONICAL PAYLOAD – DO NOT CHANGE WITHOUT LOGIC APP UPDATE
    const payload = {
      workspaceName: f.workspaceName.value,
      owner: f.requesterEmail.value
    };

    console.log("Submitting to Logic App:", payload);

    try {
      const response = await fetch(LOGIC_APP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Submission failed");
      }

      statusMessage.textContent =
        "Request submitted successfully. Approval email has been sent.";
      statusMessage.className = "success";

      form.reset();
      otherBox.classList.add("hidden");

    } catch (err) {
      console.error("Submission error:", err);

      statusMessage.textContent =
        "Failed to submit request. Please check the console or contact support.";
      statusMessage.className = "error";
    }
  });
});
