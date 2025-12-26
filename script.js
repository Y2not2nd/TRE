document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("treForm");
  const statusMessage = document.getElementById("statusMessage");

  // YOUR LOGIC APP HTTP TRIGGER URL
  const LOGIC_APP_URL = "PASTE_YOUR_HTTP_TRIGGER_URL_HERE";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    statusMessage.className = "hidden";
    statusMessage.textContent = "";

    const f = e.target;

    const payload = {
      workspaceName: f.workspaceName.value,
      requesterName: f.requesterName.value,
      requesterEmail: f.requesterEmail.value,
      managerEmail: f.managerEmail.value,
      template: f.template.value,
      urgency: f.urgency.value,
      submittedAt: new Date().toISOString()
    };

    console.log("Submitting payload:", payload);

    try {
      const response = await fetch(LOGIC_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // Accept 200, 202, 204
      if (![200, 202, 204].includes(response.status)) {
        const text = await response.text();
        throw new Error(text || "Submission failed");
      }

      statusMessage.textContent = "Request submitted successfully.";
      statusMessage.className = "success";

      form.reset();

    } catch (err) {
      console.error(err);
      statusMessage.textContent =
        "Failed to submit request. Check console.";
      statusMessage.className = "error";
    }
  });
});
