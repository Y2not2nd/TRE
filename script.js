// API Configuration
const API_ENDPOINT = 'https://prod-06.uksouth.logic.azure.com:443/workflows/ae95d8bc9250469b8f4da1d0927b4d60/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=zyop7N-T7b_0UwTtNA4ZIKs9AI7snbsP9PhTXPGV1L4';

// DOM Elements
const form = document.getElementById('treRequestForm');
const submitButton = form.querySelector('.btn-submit');
const resetButton = document.getElementById('resetButton');
const successMessage = document.getElementById('successMessage');
const infrastructureTemplate = document.getElementById('infrastructureTemplate');
const infrastructureOtherGroup = document.getElementById('infrastructureOtherGroup');
const infrastructureOther = document.getElementById('infrastructureOther');

// Show/hide "Other" text field for infrastructure
infrastructureTemplate.addEventListener('change', function () {
    if (this.value === 'Other') {
        infrastructureOtherGroup.classList.remove('hidden');
        infrastructureOther.required = true;
    } else {
        infrastructureOtherGroup.classList.add('hidden');
        infrastructureOther.required = false;
        infrastructureOther.value = '';
    }
});

// Reset button handler
resetButton.addEventListener('click', function () {
    if (confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
        form.reset();
        infrastructureOtherGroup.classList.add('hidden');
        infrastructureOther.required = false;

        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });

        successMessage.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Helper function to generate workspace name
function generateWorkspaceName() {
    const department = document.getElementById('department').value.trim();

    return ('tre-' + department)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}


// Form submission handler
form.addEventListener('submit', function (e) {
    e.preventDefault();

    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });
    successMessage.style.display = 'none';

    if (!form.checkValidity()) {
        const invalidFields = form.querySelectorAll(':invalid');
        invalidFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('error');
            }
        });

        const firstError = document.querySelector('.form-group.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Build complete payload (UNCHANGED)
    const payload = {
        workspaceName: generateWorkspaceName(),
        owner: document.getElementById('requesterName').value.trim(),
        requester: {
            name: document.getElementById('requesterName').value.trim(),
            email: document.getElementById('requesterEmail').value.trim(),
            role: document.getElementById('jobTitle').value.trim(),
            department: document.getElementById('department').value
                .toLowerCase()
                .replace(/\s+/g, '')
        },
        manager: {
            name: document.getElementById('managerName').value.trim(),
            email: document.getElementById('managerEmail').value.trim()
        },
        request: {
            type: document.getElementById('requestType').value.toLowerCase(),
            urgency: document.getElementById('urgency').value.toLowerCase(),
            expectedDuration: document.getElementById('expectedDuration').value.trim()
        },
        justification: {
            business: document.getElementById('businessJustification').value.trim(),
            research: document.getElementById('businessJustification').value.trim()
        },
        classification: {
            dataClassification: 'restricted'
        },
        infrastructure: {
            template: 'standard-research-workspace',
            options: {
                gpu: false,
                privateEndpoints: true,
                externalAccess: false
            }
        }
    };

    // === RESTORED BEHAVIOUR ===
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    // Fire-and-forget submission (do NOT block UI)
    fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(error => {
        console.error('Submission error:', error);
        console.error('Payload attempted:', payload);
    });

    // Immediate success UX (same as old working version)
    successMessage.style.display = 'block';
    form.reset();
    infrastructureOtherGroup.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    submitButton.disabled = false;
    submitButton.textContent = 'Submit Request';
});

// Real-time validation feedback
form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', function () {
        const formGroup = this.closest('.form-group');
        if (formGroup) {
            this.checkValidity()
                ? formGroup.classList.remove('error')
                : formGroup.classList.add('error');
        }
    });

    field.addEventListener('input', function () {
        const formGroup = this.closest('.form-group');
        if (formGroup && formGroup.classList.contains('error') && this.checkValidity()) {
            formGroup.classList.remove('error');
        }
    });
});

// Prevent accidental form submission on Enter key (except in textareas)
form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});
