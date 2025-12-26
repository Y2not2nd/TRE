<script>
const templateSelect = document.getElementById("templateSelect");
const otherBox = document.getElementById("otherBox");

templateSelect.addEventListener("change", () => {
  otherBox.classList.toggle("hidden", templateSelect.value !== "other");
});

document.getElementById("treForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const f = e.target;

  const payload = {
    requester: {
      fullName: f.requesterName.value,
      email: f.requesterEmail.value,
      department: f.department.value,
      role: f.role.value
    },
    lineManager: {
      fullName: f.managerName.value,
      email: f.managerEmail.value
    },
    workspace: {
      name: f.workspaceName.value,
      purpose: f.purpose.value,
      justification: f.justification.value
    },
    classification: {
      requestType: f.requestType.value,
      expectedDuration: f.duration.value,
      urgency: f.urgency.value
    },
    infrastructure: {
      template: f.template.value,
      otherDetails: f.otherDetails?.value || null
    },
    audit: {
      submittedAt: new Date().toISOString(),
      source: "tre-request-portal",
      version: "1.0"
    }
  };

  await fetch("https://YOUR-LA1-ENDPOINT-HERE", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  alert("Request submitted for approval");
});
</script>
