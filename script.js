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

const jobTitle = document.getElementById('jobTitle');
const jobTitleOtherGroup = document.getElementById('jobTitleOtherGroup');
const jobTitleOther = document.getElementById('jobTitleOther');

const department = document.getElementById('department');
const departmentOtherGroup = document.getElementById('departmentOtherGroup');
const departmentOther = document.getElementById('departmentOther');

const requestType = document.getElementById('requestType');
const requestTypeOtherGroup = document.getElementById('requestTypeOtherGroup');
const requestTypeOther = document.getElementById('requestTypeOther');

function toggleOtherField(selectEl, otherGroupEl, otherInputEl) {
    if (selectEl.value === 'Other') {
        otherGroupEl.classList.remove('hidden');
        otherInputEl.required = true;
    } else {
        otherGroupEl.classList.add('hidden');
        otherInputEl.required = false;
        otherInputEl.value = '';
    }
}

infrastructureTemplate.addEventListener('change', () => toggleOtherField(infrastructureTemplate, infrastructureOtherGroup, infrastructureOther));
jobTitle.addEventListener('change', () => toggleOtherField(jobTitle, jobTitleOtherGroup, jobTitleOther));
department.addEventListener('change', () => toggleOtherField(department, departmentOtherGroup, departmentOther));
requestType.addEventListener('change', () => toggleOtherField(requestType, requestTypeOtherGroup, requestTypeOther));

function slugify(input, maxLen) {
    const s = (input || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .replace(/^_+|_+$/g, '');

    if (!maxLen) return s;
    return s.slice(0, maxLen);
}

function codeFromInfrastructureTemplate(value) {
    const v = (value || '').toLowerCase();
    if (v.includes('shared')) return 'sh';
    if (v.includes('dedicated')) return 'dc';
    if (v.includes('connect')) return 'cn';
    if (v.includes('data-only')) return 'do';
    return 'ot';
}

function codeFromUrgency(value) {
    return (value === 'Urgent') ? 'u' : 'n';
}

function codeFromRequestType(value) {
    const v = (value || '').toLowerCase();
    if (v === 'standard') return 'std';
    if (v === 'emergency') return 'emg';
    if (v === 'temporary') return 'tmp';
    if (v === 'data pool') return 'dp';
    return 'oth';
}

function todayYYYYMMDD() {
    const d = new Date();
    const yyyy = d.getFullYear().toString();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
}

function randomSuffix(len) {
    return Math.random().toString(36).slice(2, 2 + len);
}

function buildWorkspaceName({ departmentValue, requestTypeValue, infraTemplateValue, urgencyValue }) {
    const deptCode = slugify(departmentValue, 8) || 'dept';
    const rtCode = codeFromRequestType(requestTypeValue);
    const infraCode = codeFromInfrastructureTemplate(infraTemplateValue);
    const urgCode = codeFromUrgency(urgencyValue);
    const dateCode = todayYYYYMMDD();
    const suffix = randomSuffix(4);

    // Deterministic enough, short, and safe for downstream toLower usage
    // Example: trews-datascien-std-dc-u-20251226-a1b2
    return `trews-${deptCode}-${rtCode}-${infraCode}-${urgCode}-${dateCode}-${suffix}`;
}

function getDepartmentFinal() {
    return (department.value === 'Other') ? departmentOther.value.trim() : department.value.trim();
}

function getJobTitleFinal() {
    return (jobTitle.value === 'Other') ? jobTitleOther.value.trim() : jobTitle.value.trim();
}

function getRequestTypeFinal() {
    return (requestType.value === 'Other') ? requestTypeOther.value.trim() : requestType.value.trim();
}

// Reset button handler
resetButton.addEventListener('click', function () {
    if (confirm('Are you sure you want to clear all form data?')) {
        form.reset();

        infrastructureOtherGroup.classList.add('hidden');
        infrastructureOther.required = false;

        jobTitleOtherGroup.classList.add('hidden');
        jobTitleOther.required = false;

        departmentOtherGroup.classList.add('hidden');
        departmentOther.required = false;

        requestTypeOtherGroup.classList.add('hidden');
        requestTypeOther.required = false;

        document.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
        successMessage.style.display = 'none';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Form submission handler
form.addEventListener('submit', async function (e) {
    e.preventDefault();

    document.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
    successMessage.style.display = 'none';

    if (!form.checkValidity()) {
        const invalidFields = form.querySelectorAll(':invalid');
        invalidFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            if (formGroup) formGroup.classList.add('error');
        });

        const firstError = document.querySelector('.form-group.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const requesterName = document.getElementById('requesterName').value.trim();
    const requesterEmail = document.getElementById('requesterEmail').value.trim();
    const managerName = document.getElementById('managerName').value.trim();
    const managerEmail = document.getElementById('managerEmail').value.trim();

    const departmentFinal = getDepartmentFinal();
    const jobTitleFinal = getJobTitleFinal();
    const requestTypeFinal = getRequestTypeFinal();

    const urgencyValue = document.getElementById('urgency').value;
    const expectedDuration = document.getElementById('expectedDuration').value;
    const businessJustification = document.getElementById('businessJustification').value.trim();

    const infraTemplateValue = infrastructureTemplate.value;
    const infraOtherValue = (infrastructureTemplate.value === 'Other') ? infrastructureOther.value.trim() : null;

    const workspaceName = buildWorkspaceName({
        departmentValue: departmentFinal,
        requestTypeValue: requestTypeFinal,
        infraTemplateValue,
        urgencyValue
    });

    // LA-1 contract requires top level workspaceName + owner
    // owner is used only for "Requested by" in the approval email
    const payload = {
        workspaceName,
        owner: requesterEmail,
        request: {
            requester: {
                name: requesterName,
                email: requesterEmail,
                jobTitle: jobTitleFinal,
                department: departmentFinal
            },
            lineManager: {
                name: managerName,
                email: managerEmail
            },
            classification: {
                requestType: requestTypeFinal,
                urgency: urgencyValue,
                expectedDuration,
                businessJustification
            },
            infrastructure: {
                template: infraTemplateValue,
                otherDetails: infraOtherValue
            },
            systemFields: {
                submissionTimestamp: new Date().toISOString(),
                formVersion: 'tre-request-form-v3.0',
                submittedFrom: window.location.href
            }
        }
    };

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
        }

        successMessage.style.display = 'block';
        form.reset();

        infrastructureOtherGroup.classList.add('hidden');
        infrastructureOther.required = false;

        jobTitleOtherGroup.classList.add('hidden');
        jobTitleOther.required = false;

        departmentOtherGroup.classList.add('hidden');
        departmentOther.required = false;

        requestTypeOtherGroup.classList.add('hidden');
        requestTypeOther.required = false;

        window.scrollTo({ top: 0, behavior: 'smooth' });

        console.log('Submitted payload:', payload);
    } catch (error) {
        alert('Submission failed: ' + error.message + '\n\nPlease try again or contact support.');
        console.error('Submission error:', error);
        console.error('Payload attempted:', payload);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Request';
    }
});

// Real-time validation feedback
form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', function () {
        const formGroup = this.closest('.form-group');
        if (!formGroup) return;

        if (this.checkValidity()) formGroup.classList.remove('error');
        else formGroup.classList.add('error');
    });

    field.addEventListener('input', function () {
        const formGroup = this.closest('.form-group');
        if (!formGroup) return;

        if (formGroup.classList.contains('error') && this.checkValidity()) {
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
