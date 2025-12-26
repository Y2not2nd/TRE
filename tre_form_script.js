document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("treForm");
  const statusMessage = document.getElementById("statusMessage");

  // ========================================
  // CONFIGURATION
  // ========================================
  // Replace this URL with your Logic App LA1 HTTP endpoint
  const LOGIC_APP_URL = "https://prod-06.uksouth.logic.azure.com:443/workflows/ae95d8bc9250469b8f4da1d0927b4d60/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=zyop7N-T7b_0UwTtNA4ZIKs9AI7snbsP9PhTXPGV1L4";

  // ========================================
  // FORM SUBMISSION HANDLER
  // ========================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous status messages
    statusMessage.className = "";
    statusMessage.textContent = "";
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    const formData = new FormData(form);

    // ========================================
    // CRITICAL: LA1 PAYLOAD
    // ========================================
    // Only these two fields are sent to Logic App LA1
    // DO NOT modify this payload structure without updating LA1
    const payload = {
      workspaceName: formData.get("workspaceName"),
      owner: formData.get("owner")
    };

    console.log("=== TRE Workspace Request ===");
    console.log("Submitting to Logic App:", payload);
    console.log("Additional context (not sent to LA1):", {
      requesterName: formData.get("requesterName"),
      department: formData.get("department"),
      managerEmail: formData.get("managerEmail"),
      purpose: formData.get("purpose"),
      justification: formData.get("justification"),
      requestType: formData.get("requestType"),
      urgency: formData.get("urgency"),
      workspaceType: formData.get("workspaceType"),
      additionalNotes: formData.get("additionalNotes")
    });

    try {
      // ========================================
      // POST TO LOGIC APP LA1
      // ========================================
      const response = await fetch(LOGIC_APP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.message || JSON.stringify(errorData);
        } catch {
          errorText = await response.text();
        }
        throw new Error(errorText || `HTTP ${response.status}: Submission failed`);
      }

      // ========================================
      // SUCCESS HANDLING
      // ========================================
      const result = await response.json();
      console.log("Success response:", result);

      statusMessage.textContent = 
        `✓ Request submitted successfully!\n\n` +
        `Workspace Name: ${payload.workspaceName}\n` +
        `Owner: ${payload.owner}\n\n` +
        `An approval email has been sent. You will be notified of the outcome.`;
      statusMessage.className = "success show";

      // Reset form
      form.reset();

      // Scroll to status message
      statusMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });

    } catch (err) {
      // ========================================
      // ERROR HANDLING
      // ========================================
      console.error("Submission error:", err);

      statusMessage.textContent = 
        `✗ Failed to submit request.\n\n` +
        `Error: ${err.message}\n\n` +
        `Please check the console for details or contact TRE support.`;
      statusMessage.className = "error show";

      // Scroll to status message
      statusMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });

    } finally {
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = "Submit Request";
    }
  });

  // ========================================
  // CLIENT-SIDE VALIDATION HELPERS
  // ========================================
  
  // Real-time workspace name validation
  const workspaceNameInput = form.querySelector('input[name="workspaceName"]');
  workspaceNameInput.addEventListener("input", (e) => {
    const value = e.target.value;
    const pattern = /^[a-z0-9-]{3,}$/;
    
    if (value && !pattern.test(value)) {
      e.target.setCustomValidity("Use only lowercase letters, numbers, and hyphens (min 3 characters)");
    } else {
      e.target.setCustomValidity("");
    }
  });

  // Email validation helper
  const emailInputs = form.querySelectorAll('input[type="email"]');
  emailInputs.forEach(input => {
    input.addEventListener("blur", (e) => {
      if (e.target.value && !e.target.validity.valid) {
        e.target.setCustomValidity("Please enter a valid email address");
      } else {
        e.target.setCustomValidity("");
      }
    });
  });

  console.log("TRE Workspace Request Form initialized");
  console.log("LA1 Endpoint:", LOGIC_APP_URL);
  console.log("Remember: Only 'workspaceName' and 'owner' are sent to LA1");
});