// API Configuration
const API_ENDPOINT = 'https://prod-03.uksouth.logic.azure.com:443/workflows/1a5d35392a594f2ea8e53d12accc8231/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=LvnpxYV1cySZ_m0D63rwEedqDT3mtUHRZnme_w5kbkI';

// DOM Elements
const form = document.getElementById('treRequestForm');
const submitButton = form.querySelector('.btn-submit');
const resetButton = document.getElementById('resetButton');
const successMessage = document.getElementById('successMessage');
const infrastructureTemplate = document.getElementById('infrastructureTemplate');
const infrastructureOtherGroup = document.getElementById('infrastructureOtherGroup');
const infrastructureOther = document.getElementById('infrastructureOther');

// Show/hide "Other" text field for infrastructure
infrastructureTemplate.addEventListener('change', function() {
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
resetButton.addEventListener('click', function() {
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
    const department = document.getElementById('department').value;
    const requestType = document.getElementById('requestType').value;
    const timestamp = Date.now().toString().slice(-6);
    
    // Create a clean workspace name: dept-type-timestamp
    const deptCode = department.toLowerCase().replace(/\s+/g, '-').substring(0, 10);
    const typeCode = requestType.toLowerCase().replace(/\s+/g, '-').substring(0, 8);
    
    return `ws-${deptCode}-${typeCode}-${timestamp}`;
}

// Form submission handler
form.addEventListener('submit', async function(e) {
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

    // Build payload with intake data + essential fields
    const payload = {
        // Essential fields for LA1 -> LA2 flow
        workspaceName: generateWorkspaceName(),
        owner: document.getElementById('requesterEmail').value,
        
        // Rich intake data for governance and auditing
        intakeData: {
            requesterDetails: {
                name: document.getElementById('requesterName').value,
                email: document.getElementById('requesterEmail').value,
                jobTitle: document.getElementById('jobTitle').value,
                department: document.getElementById('department').value
            },
            lineManagerApproval: {
                name: document.getElementById('managerName').value,
                email: document.getElementById('managerEmail').value
            },
            requestClassification: {
                requestType: document.getElementById('requestType').value,
                urgency: document.getElementById('urgency').value,
                expectedDuration: document.getElementById('expectedDuration').value,
                businessJustification: document.getElementById('businessJustification').value
            },
            infrastructureRequirement: {
                template: document.getElementById('infrastructureTemplate').value,
                otherDetails: infrastructureTemplate.value === 'Other' ? infrastructureOther.value : null
            },
            systemFields: {
                submissionTimestamp: new Date().toISOString(),
                formVersion: "tre-request-form-v2.1",
                submittedFrom: window.location.href
            }
        }
    };

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            successMessage.style.display = 'block';
            form.reset();
            infrastructureOtherGroup.classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log('Form submitted successfully:', payload);
        } else {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
        }
    } catch (error) {
        alert('Submission failed: ' + error.message + '\n\nPlease try again or contact support if the problem persists.');
        console.error('Submission error:', error);
        console.error('Payload attempted:', payload);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Request';
    }
});

// Real-time validation feedback
form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', function() {
        const formGroup = this.closest('.form-group');
        if (formGroup) {
            if (this.checkValidity()) {
                formGroup.classList.remove('error');
            } else {
                formGroup.classList.add('error');
            }
        }
    });
    
    field.addEventListener('input', function() {
        const formGroup = this.closest('.form-group');
        if (formGroup && formGroup.classList.contains('error')) {
            if (this.checkValidity()) {
                formGroup.classList.remove('error');
            }
        }
    });
});

// Prevent accidental form submission on Enter key
form.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});
