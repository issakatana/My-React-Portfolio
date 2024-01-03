// TOGGLE MOBILE MENU ICON 
document.addEventListener("DOMContentLoaded", function () {
    const mobileMenuIcon = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('.auth-header-nav-ul');
    mobileMenuIcon.addEventListener('click', function () {
        navMenu.classList.toggle('show');
        if (navMenu.classList.contains('show')) {
            mobileMenuIcon.innerHTML = "<i class='bx bx-x' style='font-size: 2.6rem; color: darkred; font-weight: bold; transition: 0.7s ease-in-out;'></i>";
        } else {
            mobileMenuIcon.innerHTML = "<i class='bx bx-menu-alt-right' style='transition: 0.7s ease-in-out;'></i>"; 
        }
    });
});

// LOGIN PASS SHOW AND HIDE
document.addEventListener('DOMContentLoaded', function() {
    const eyeIcon = document.getElementById('showPasswordIcon');
    const passwordInput = document.getElementById('logPassword');
    eyeIcon.addEventListener('click', function() {
        togglePasswordVisibility(passwordInput, eyeIcon);
    });
    function togglePasswordVisibility(input, icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
});

// CHANGE NAV COLOR ON MOUCEHOVER NAV
document.addEventListener("DOMContentLoaded", function() {
    const authHeader = document.querySelector('.auth-header');
    authHeader.addEventListener("mouseenter", handleMouseEnter);
    authHeader.addEventListener("mouseleave", handleMouseLeave);
    function handleMouseEnter() {
        const links = authHeader.querySelectorAll('a');
        links.forEach(link => {
            link.style.color = '#066638';
        });
    }
    function handleMouseLeave() {
        const links = authHeader.querySelectorAll('a');
        links.forEach(link => {
            link.style.color = '#fff'; 
        });
    }
});

// SELECT COUNTY, FILTER SUBCOUNTY AND WARD
$(document).ready(function() {
    var countySelect = $('#countySelect');
    var subcountySelect = $('#subcountySelect');
    var wardSelect = $('#wardSelect');
    $.get('/get_counties/', function(data) {
        var counties = data.data;
        for (var county of counties) {
            countySelect.append($('<option>', {
                value: county.name,
                text: county.name
            }));
        }
        countySelect.on('change', function() {
            var selectedCounty = $(this).val();
            subcountySelect.empty(); 
            wardSelect.empty(); 
            if (selectedCounty) {
                var selectedCountyData = counties.find(county => county.name === selectedCounty);
                subcountySelect.append($('<option>', {
                        text: 'Select your sub-county...'
                    }));
                for (var constituency of selectedCountyData.constituencies) {
                    subcountySelect.append($('<option>', {
                        value: constituency.name,
                        text: constituency.name
                    }));
                }
            }
        });
        subcountySelect.on('change', function() {
            var selectedSubcounty = $(this).val();
            wardSelect.empty(); 
            if (selectedSubcounty) {
                var selectedCountyData = counties.find(county => county.name === countySelect.val());
                var selectedConstituency = selectedCountyData.constituencies.find(constituency => constituency.name === selectedSubcounty);
                wardSelect.append($('<option>', {
                        text: 'Select your ward...'
                    }));
                for (var ward of selectedConstituency.wards) {
                    wardSelect.append($('<option>', {
                        value: ward,
                        text: ward
                    }));
                }
            }
        });
    });
});

// THE MULTISTAGE SIGNUP FORM
const prevBtns = document.querySelectorAll(".btn-prev");
const nextBtns = document.querySelectorAll(".btn-next");
const progress = document.getElementById("progress");
const formSteps = document.querySelectorAll(".form-step");
const progressSteps = document.querySelectorAll(".progress-step");
// initialize objects and steps
let formStepsNum = 0;
const formData = {
    personalDetails: {},
    contactDetails: {},
    nominees: [],
    nextofkin: []
};
// check input existence in database
const nextButton = document.getElementsByClassName('btn-next');
const idNumberInput = document.getElementById('idnumber');
const idNumberErrorElement = document.getElementById('idnumber-error');
idNumberInput.addEventListener('input', () => {
    const idNumber = idNumberInput.value;
    checkIdNumberAvailability(idNumber, idNumberErrorElement, nextButton);
  
});
const phoneNumberInput = document.getElementById('phoneno');
const phoneNumberErrorElement = document.getElementById('phoneno-error');
phoneNumberInput.addEventListener('input', function() {
    const inputValue = phoneNumberInput.value;
    checkPhoneNumberAvailability(inputValue, phoneNumberErrorElement, nextButton);
});
const emailInput = document.getElementById('email');
const emailErrorElement = document.getElementById('email-error');
emailInput.addEventListener('input', function() {
    const inputValue = emailInput.value;
    checkEmailAvailability(inputValue, emailErrorElement, nextButton);
});
// next button
nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (formStepsNum === 0) {
            const fieldMappings = {
                'surname': 'Surname',
                'fname': 'First Name',
                'username': 'Username',
                'gender': 'Gender',
                'idnumber': 'ID Number',
                'dob': 'Date of Birth',
                'position': 'Position',
                'password': 'Password',
                'confirmPassword': 'Confirm Password'
            };
            const requiredFields = Object.keys(fieldMappings);
            const emptyFields = requiredFields.filter(field => !document.getElementById(field).value.trim());
            if (emptyFields.length > 0) {
                emptyFields.forEach(emptyField => {
                    const errorElement = document.getElementById(`${emptyField}-error`);
                    const inputElement = document.getElementById(emptyField);
                    errorElement.textContent = `${fieldMappings[emptyField]} is required and must have a value.`;
                    errorElement.style.display = 'block';
                    inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    inputElement.focus();
                    inputElement.addEventListener('input', () => {
                        errorElement.textContent = '';
                        errorElement.style.display = 'none';
                    });
                });
                return; 
            }
            formData.personalDetails.surname = document.getElementById('surname').value;
            formData.personalDetails.fname = document.getElementById('fname').value;
            formData.personalDetails.onames = document.getElementById('onames').value;
            formData.personalDetails.username = document.getElementById('username').value;
            formData.personalDetails.gender = document.getElementById('gender').value;
            formData.personalDetails.idnumber = document.getElementById('idnumber').value;
            formData.personalDetails.dob = document.getElementById('dob').value;
            formData.personalDetails.position = document.getElementById('position').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const strengthIndicator = document.getElementById('password-error');
            checkPasswordStrength(password, strengthIndicator);
            const confirmError = document.getElementById('confirmPassword-error');
            checkPasswordMatch(password, confirmPassword, confirmError);
            formData.personalDetails.password = password;
            formData.personalDetails.confirmPassword = confirmPassword;
        } else if (formStepsNum === 1) {
            const fieldMappings = {
                'phoneno': 'Phone Number',
                'countySelect': 'County',
                'subcountySelect': 'Subcounty',
                'wardSelect': 'Ward',
                'sublocation': 'Sublocation',
                'residence' : 'Residence'
            };
            const requiredFields = Object.keys(fieldMappings);
            const emptyFields = requiredFields.filter(field => !document.getElementById(field).value.trim());
            if (emptyFields.length > 0) {
                emptyFields.forEach(emptyField => {
                    const errorElement = document.getElementById(`${emptyField}-error`);
                    const inputElement = document.getElementById(emptyField);
                    errorElement.textContent = `${fieldMappings[emptyField]} is required and must have a value.`;
                    errorElement.style.display = 'block';
                    inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    inputElement.focus();
                    inputElement.addEventListener('input', () => {
                        errorElement.textContent = '';
                        errorElement.style.display = 'none';
                    });
                });
                return; 
            }
            formData.contactDetails.phoneno = document.getElementById('phoneno').value;
            const ccheckPhoneL = document.getElementById('phoneno').value;
            if (ccheckPhoneL.length !== 10) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Please ensure that the phone number length is exactly 10 digits!",
                    footer: '<a href="#">Why do I have this issue?</a>'
                });
                return;
            }
            const emailInput = document.getElementById('email');
            const emailError = document.getElementById('email-error');
            const email = emailInput.value.trim();
            if (email) {
                    if (!isValidEmail(email)) {
                        emailError.textContent = 'Please enter a valid email address.';
                        emailError.style.display = 'block';
                        return;
                    } else {
                        emailError.textContent = '';
                        emailError.style.display = 'none';
                        formData.contactDetails.email = email;
                    }
            }
            formData.contactDetails.countySelect = document.getElementById('countySelect').value;
            formData.contactDetails.subcountySelect = document.getElementById('subcountySelect').value;
            formData.contactDetails.wardSelect = document.getElementById('wardSelect').value;
            formData.contactDetails.sublocation = document.getElementById('sublocation').value;
            formData.contactDetails.residence = document.getElementById('residence').value;
            function isValidEmail(email) {
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }
    } else if (formStepsNum === 2) {
        const nominee = {
            nameofdependant: document.getElementById('nameofdependant').value,
            dependantrelationship: document.getElementById('dependantrelationship').value,
            dependantidnumber: document.getElementById('dependantidnumber').value,
            dependantcontact: document.getElementById('dependantcontact').value
        };
        formData.nominees.push(nominee);
        document.getElementById('nameofdependant').value = '';
        document.getElementById('dependantrelationship').value = '';
        document.getElementById('dependantidnumber').value = '';
        document.getElementById('dependantcontact').value = '';
        formData.nominees = formData.nominees.filter(dependant =>
            dependant.nameofdependant && dependant.dependantrelationship &&
            dependant.dependantidnumber && dependant.dependantcontact
        );
        if (formData.nominees.length >= 0) {
            const errorDiv = document.getElementById('dependantsList-array-error');
            errorDiv.style.display = 'none';
        } else {
            const errorDiv = document.getElementById('dependantsList-array-error');
            errorDiv.textContent = `You can skip to the next step if you don't have dependants.`;
            errorDiv.style.display = 'block';
            return; 
        }
    } else if (formStepsNum === 3) {
        const  nextofkin = {
            nameofnextofkin: document.getElementById('nameofnextofkin').value,
            nextofkinrelationship: document.getElementById('nextofkinrelationship').value,
            nextofkinidnumber: document.getElementById('nextofkinidnumber').value,
            nextofkincontact: document.getElementById('nextofkincontact').value
        };
        formData.nextofkin.push(nextofkin);
        document.getElementById('nameofnextofkin').value = '';
        document.getElementById('nextofkinrelationship').value = '';
        document.getElementById('nextofkinidnumber').value = '';
        document.getElementById('nextofkincontact').value = '';
        formData.nextofkin  = formData.nextofkin.filter(nextkin =>
            nextkin.nameofnextofkin && nextkin.nextofkinrelationship &&
            nextkin.nextofkinidnumber && nextkin.nextofkincontact
        );
        if (formData.nextofkin.length >= 1) {
            const errorDiv = document.getElementById('next-of-kin-list-array-error');
            errorDiv.style.display = 'none';
        } else {
            const errorDiv = document.getElementById('next-of-kin-list-array-error');
            errorDiv.textContent = 'At least 1 next of kin entries are required to proceed to the next step.';
            errorDiv.style.display = 'block';
            return; 
        }
    } else if (formStepsNum === 4) { 
        renderFormDataInReview();
    }
        renderFormDataInReview();
        formStepsNum++;
        updateFormSteps();
        if (formStepsNum !== 5) {
            updateProgressBar();
        }
    });
});
// previous button
prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        formStepsNum--;
        updateFormSteps();
        updateProgressBar();
    })
})
// Add nominee/dependants
const addDependantBtn = document.getElementById('addDependant');
addDependantBtn.addEventListener('click', () => {
    const fieldMappings = {
        'nameofdependant': 'Name of dependant',
        'dependantrelationship': 'Dependant relationship',
        'dependantidnumber': 'Dependant ID Number/Birth Certificate Number is required',
        'dependantcontact': 'Dependant contact',
    };
    const requiredFields = Object.keys(fieldMappings);
    const emptyFields = requiredFields.filter(field => !document.getElementById(field).value.trim());
    if (emptyFields.length > 0) {
        emptyFields.forEach(emptyField => {
            const errorElement = document.getElementById(`${emptyField}-error`);
            const inputElement = document.getElementById(emptyField);
            errorElement.textContent = `${fieldMappings[emptyField]} is required and must have a value.`;
            errorElement.style.display = 'block';
            inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputElement.focus();
            inputElement.addEventListener('input', () => {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            });
        });
        return;
    }
    const nameofdependant = document.getElementById('nameofdependant').value.trim();
    const dependantrelationship = document.getElementById('dependantrelationship').value.trim();
    const dependantidnumber = document.getElementById('dependantidnumber').value.trim();
    const dependantcontact = document.getElementById('dependantcontact').value.trim();
    const isIdUnique = formData.nominees.every(entry => entry.dependantidnumber !== dependantidnumber);
    const isContactUnique = formData.nominees.every(entry => entry.dependantcontact !== dependantcontact);
    const duplicateErrorDiv = document.getElementById('dependant-duplicate-array-error');
    if (!isIdUnique || !isContactUnique) {
        duplicateErrorDiv.textContent = 'Error: Failed to add dependant details. Please ensure that both ID and Contact are unique.';
        duplicateErrorDiv.style.display = 'block';
        return; 
    } else {
        duplicateErrorDiv.textContent = '';
        duplicateErrorDiv.style.display = 'none';
    }
    const nominee = {
        nameofdependant: nameofdependant,
        dependantrelationship: dependantrelationship,
        dependantidnumber: dependantidnumber,
        dependantcontact: dependantcontact
    };
    formData.nominees.push(nominee);
    document.getElementById('nameofdependant').value = '';
    document.getElementById('dependantrelationship').value = '';
    document.getElementById('dependantidnumber').value = '';
    document.getElementById('dependantcontact').value = '';
    console.log(formData); 
    updateNomineeTable();
    const nomineesTable = document.getElementById('dependantsTable');
    const rowsInTable = nomineesTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr').length;
    if (rowsInTable > 2) {
        const errorDiv = document.getElementById('dependantsList-array-error');
        errorDiv.style.display = 'none';
    }
});
// Add next of kin 
const nextOfKinBtn = document.getElementById('nextOfKinBtn');
nextOfKinBtn.addEventListener('click', () => {
    const fieldMappings = {
        'nameofnextofkin': 'Name of next of kin',
        'nextofkinrelationship': 'Next of kin relationship',
        'nextofkinidnumber': 'Next of kin ID Number/Birth Certificate Number is required',
        'nextofkincontact': 'Next of kin contact',
    };
    const requiredFields = Object.keys(fieldMappings);
    const emptyFields = requiredFields.filter(field => !document.getElementById(field).value.trim());
    if (emptyFields.length > 0) {
        emptyFields.forEach(emptyField => {
            const errorElement = document.getElementById(`${emptyField}-error`);
            const inputElement = document.getElementById(emptyField);
            errorElement.textContent = `${fieldMappings[emptyField]} is required and must have a value.`;
            errorElement.style.display = 'block';
            inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputElement.focus();
            inputElement.addEventListener('input', () => {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            });
        });
        return; 
    }
    const nameofnextofkin = document.getElementById('nameofnextofkin').value.trim();
    const nextofkinrelationship = document.getElementById('nextofkinrelationship').value.trim();
    const nextofkinidnumber = document.getElementById('nextofkinidnumber').value.trim();
    const nextofkincontact = document.getElementById('nextofkincontact').value.trim();
    const isIdUnique = formData.nextofkin.every(entry => entry.nextofkinidnumber !== nextofkinidnumber);
    const isContactUnique = formData.nextofkin.every(entry => entry.nextofkincontact !== nextofkincontact);
    const duplicateErrorDiv = document.getElementById('next-of-kin-duplicate-array-error');
    if (!isIdUnique || !isContactUnique) {
        duplicateErrorDiv.textContent = 'Error: Failed to add next of kin details. Please ensure that both ID and Contact are unique.';
        duplicateErrorDiv.style.display = 'block';
        return; 
    } else {
        duplicateErrorDiv.textContent = '';
        duplicateErrorDiv.style.display = 'none';
    }
    const nextofkin = {
        nameofnextofkin:  nameofnextofkin,
        nextofkinrelationship:  nextofkinrelationship,
        nextofkinidnumber: nextofkinidnumber,
        nextofkincontact: nextofkincontact
    };
    formData.nextofkin.push(nextofkin);
    document.getElementById('nameofnextofkin').value = '';
    document.getElementById('nextofkinrelationship').value = '';
    document.getElementById('nextofkinidnumber').value = '';
    document.getElementById('nextofkincontact').value = '';
    console.log(formData); 
    updateNextOfKinTable();
    const nextofkinTable = document.getElementById('nextOfKinTable');
    const rowsInTable = nextofkinTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr').length;
    if (rowsInTable > 2) {
        const errorDiv = document.getElementById('next-of-kin-list-array-error');
        errorDiv.style.display = 'none';
    }
});
// major functions
function firstEmptyField(fields) {
    for (const field of fields) {
        const fieldValue = document.getElementById(field).value.trim();
        if (!fieldValue) {
            return field;
        }
    }
    return null; 
}
function areFieldsFilled(fields) {
    for (const field of fields) {
        const fieldValue = document.getElementById(field).value.trim();
        if (!fieldValue) {
            return false;
        }
    }
    return true;
}
function updateFormSteps() {
    const formSteps = document.querySelectorAll('.form-step');
    formSteps.forEach((formStep, idx) => {
        formStep.classList.remove('form-step-active');
    });
    formSteps[formStepsNum].classList.add('form-step-active');
}
function updateProgressBar() {
    const progress = document.querySelector('.progress');
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((progressStep, idx) => {
        if (idx < formStepsNum) {
            progressStep.classList.add('progress-step-active');
            progressStep.classList.add('active');
        } else {
            progressStep.classList.remove('progress-step-active');
            progressStep.classList.remove('active');
        }
    });
    const currentStep = progressSteps[formStepsNum - 1]; 
    if (currentStep) {
        currentStep.classList.add('progress-step-active');
    }
    const progressActive = document.querySelectorAll('.progress-step-active');
    const progressWidth = (progressActive.length / (progressSteps.length - 1)) * 100 + '%';
    progress.style.width = progressWidth;
}
function updateNomineeTable() {
    const tableBody = document.getElementById('dependantsList');
    tableBody.innerHTML = '';
    formData.nominees.forEach((nominee, index) => {
        const row = tableBody.insertRow();
        const cells = [
            { content: index + 1, label: 'Id' },
            { content: nominee.nameofdependant, label: "Dependant Name" },
            { content: nominee.dependantrelationship, label: 'Relationship' },
            { content: nominee.dependantidnumber, label: 'ID Number' },
            { content: nominee.dependantcontact, label: 'Contact' }
        ];
        cells.forEach((cell, cellIndex) => {
            const cellElement = row.insertCell(cellIndex);
            cellElement.textContent = cell.content;
            cellElement.setAttribute('data-lable', cell.label);
        });
        const editCell = row.insertCell(cells.length);
        editCell.setAttribute('data-lable', 'Edit');
        const editButton = document.createElement('button');
        editButton.className = 'btn_edit';
        editButton.innerHTML = '<i class="fa fa-pencil"></i>';
        editButton.setAttribute('data-lable', 'Edit'); 
        editButton.addEventListener('click', () => editNominee(index));
        editCell.appendChild(editButton);
        const deleteCell = row.insertCell(cells.length + 1);
        deleteCell.setAttribute('data-lable', 'Delete');
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn_trash';
        deleteButton.innerHTML = '<i class="fa fa-trash"></i>';
        deleteButton.setAttribute('data-lable', 'Delete'); 
        deleteButton.addEventListener('click', () => deleteNominee(index));
        deleteCell.appendChild(deleteButton);
    });
}
function deleteNominee(index) {
    formData.nominees.splice(index, 1);
    updateNomineeTable();
}
function editNominee(index) {
    const nominee = formData.nominees[index];
    document.getElementById('nameofdependant').value = nominee.nameofdependant;
    document.getElementById('dependantrelationship').value = nominee.dependantrelationship;
    document.getElementById('dependantidnumber').value = nominee.dependantidnumber;
    document.getElementById('dependantcontact').value = nominee.dependantcontact;
    formData.nominees.splice(index, 1);
    updateNomineeTable();
}
function updateNextOfKinTable() {
    const tableBody = document.getElementById('nextOfKinList');
    tableBody.innerHTML = '';
    formData.nextofkin.forEach((nextofkin, index) => {
        const row = tableBody.insertRow();
        const cells = [
            { content: index + 1, label: 'Id' },
            { content: nextofkin.nameofnextofkin, label: "Name of Next of Kin" },
            { content: nextofkin.nextofkinrelationship, label: 'Relationship' },
            { content: nextofkin.nextofkinidnumber, label: 'ID Number' },
            { content: nextofkin.nextofkincontact, label: 'Contact' }
        ];
        cells.forEach((cell, cellIndex) => {
            const cellElement = row.insertCell(cellIndex);
            cellElement.textContent = cell.content;
            cellElement.setAttribute('data-lable', cell.label);
        });
        const editCell = row.insertCell(cells.length);
        editCell.setAttribute('data-lable', 'Edit');
        const editButton = document.createElement('button');
        editButton.className = 'btn_edit';
        editButton.innerHTML = '<i class="fa fa-pencil"></i>';
        editButton.setAttribute('data-lable', 'Edit'); 
        editButton.addEventListener('click', () => editNominee(index));
        editCell.appendChild(editButton);
        const deleteCell = row.insertCell(cells.length + 1);
        deleteCell.setAttribute('data-lable', 'Delete');
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn_trash';
        deleteButton.innerHTML = '<i class="fa fa-trash"></i>';
        deleteButton.setAttribute('data-lable', 'Delete'); 
        deleteButton.addEventListener('click', () => deleteNominee(index));
        deleteCell.appendChild(deleteButton);
    });
}
function deleteNextOfKin(index) {
    formData.nextofkin.splice(index, 1);
    updateNextOfKinTable();
}
function editNextOfKin(index) {
    const nextofkin = formData.nextofkin[index];
    document.getElementById('nameofnextofkin').value = nextofkin.nameofnextofkin;
    document.getElementById('nextofkinrelationship').value = nextofkin.nextofkinrelationship;
    document.getElementById('nextofkinidnumber').value = nextofkin.nextofkinidnumber;
    document.getElementById('nextofkincontact').value = nextofkin.nextofkincontact;
    formData.nextofkin.splice(index, 1);
    updateNextOfKinTable();
}
function checkIdNumberAvailability(idNumber, errorElement, nextButton) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/check-idnumber/${idNumber}/`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.isTaken) {
                    errorElement.textContent = 'ID number is already taken.';
                    errorElement.style.display = 'block';
                    nextButton.disabled = true;
                    const rm = document.querySelector('.btn-next');
                    rm.classList.add('disabled-button');
                } else {
                    errorElement.textContent = '';
                    errorElement.style.display = 'none';
                    nextButton.disabled = false;
                    const rm = document.querySelector('.btn-next');
                    rm.classList.remove('disabled-button');
                }
            } else {
                console.error('Error checking ID number availability');
                nextButton.disabled = true;
            }
        }
    };
    xhr.send();
    return false;
}
const idInput = document.getElementById('idnumber'); 
idInput.addEventListener('input', function() {
    const inputValue = idInput.value;
    const errorElement = document.getElementById('error-message'); 
    const nextButton = document.querySelector('.btn-next');
    checkIdNumberAvailability(inputValue, errorElement, nextButton);
});
function checkPhoneNumberAvailability(phoneNumber, errorElement, nextButton) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/check-phonenumber/${phoneNumber}/`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.isTaken) {
                    errorElement.textContent = 'Phone number is already taken.';
                    errorElement.style.display = 'block';
                    nextButton.disabled = true;
                    const mailphone = document.getElementById('mailphone');
                    mailphone.classList.add('disabled-button');
                } else {
                    errorElement.textContent = '';
                    errorElement.style.display = 'none';
                    nextButton.disabled = false;
                    mailphone.classList.remove('disabled-button');
                }
            } else {
                console.error('Error checking phone number availability');
                nextButton.disabled = true;
            }
        }
    };
    xhr.send();
    return false;
}
function checkEmailAvailability(email, errorElement, nextButton) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/check-email/${email}/`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.isTaken) {
                    errorElement.textContent = 'Email is already taken.';
                    errorElement.style.display = 'block';
                    nextButton.disabled = true;
                    const mailphone = document.getElementById('mailphone');
                    mailphone.classList.add('disabled-button');
                } else {
                    errorElement.textContent = '';
                    errorElement.style.display = 'none';
                    nextButton.disabled = false;
                    mailphone.classList.remove('disabled-button');
                }
            } else {
                console.error('Error checking phone number availability');
                nextButton.disabled = true;
            }
        }
    };
    xhr.send();
    return false;
}

// REVIEW FORM DATA
function renderFormDataInReview() {
    const reviewSection = document.getElementById('reviewOfFormData');
    // Clear existing content
    reviewSection.innerHTML = '';
    // Review form head
    const formHeadDiv = document.createElement('div');
    formHeadDiv.innerHTML = `
        <h3 class="formHeader content-title">
            <p>PARKSIDE VILLA WELFARE GROUP MEMBERSHIP</p>
            <p>REGISTRATION FORM</p>
        </h3>
    `;
    reviewSection.appendChild(formHeadDiv);
    // a. personal details
    const personalDetailsDiv = document.createElement('div');
    personalDetailsDiv.classList.add('review-section');
    personalDetailsDiv.innerHTML = `
        <article class="personal-details-review-output">
            <h3 class="content-title">(A). PERSONAL DETAILS</h3>
            <div class="personal-details-review-output-contents">
                <div>
                    <p>FULL NAME: ${formData.personalDetails.surname} ${formData.personalDetails.fname} ${formData.personalDetails.onames}</p>
                    <p>ID NUMBER: ${formData.personalDetails.idnumber}</p>
                    <p>POSITION: ${formData.personalDetails.position}</p>
                </div>
                <div>
                    <p>GENDER: ${formData.personalDetails.gender}</p>
                    <p>USER NAME: ${formData.personalDetails.username}</p>
                    <p>Date Of Birth: ${formData.personalDetails.dob}</p>
                </div>
            </div>
        </article>
    `;
    reviewSection.appendChild(personalDetailsDiv);
    // b. contact details
    const contactDetailsDiv = document.createElement('div');
    contactDetailsDiv.classList.add('review-section');
    contactDetailsDiv.innerHTML = `
        <article class="contact-details-review-output">
            <h3 class="content-title">(B). CONTACT DETAILS</h3>
            <div class="contact-details-review-output-contents">
                <div>
                    <p>SUB LOCATION: ${formData.contactDetails.sublocation}</p>
                    <p>HOME COUNTY: ${formData.contactDetails.countySelect}</p>
                    <p>SUB COUNTY: ${formData.contactDetails.subcountySelect}</p>
                    <p>WARD: ${formData.contactDetails.wardSelect}</p>
                </div>
                <div>
                    <p>PHONE NO: ${formData.contactDetails.phoneno}</p>
                    <p>EMAIL: ${formData.contactDetails.email}</p>
                    <p>Residence: ${formData.contactDetails.residence}</p>
                </div>
            </div>
        </article>
    `;
    reviewSection.appendChild(contactDetailsDiv);
    // c. member nominees
    const nomineeTitleDiv = document.createElement('div');
    nomineeTitleDiv.classList.add('review-section');
    nomineeTitleDiv.innerHTML = `
        <article class="contact-details-review-output">
            <h3 class="content-title">(C). MEMBER NOMINEES</h3>
        </article>
    `;
    reviewSection.appendChild(nomineeTitleDiv);
    const nomineesTable = document.createElement('div');
    nomineesTable.innerHTML = `
        <table id="nextOfKinTable" class="tbl">
            <tbody id="dependantsList"></tbody>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Nominees/Dependants' Name</th>
                    <th>Relationship</th>
                    <th>ID Number</th>
                    <th>Contact</th>
                </tr>
            </thead>
        </table>
    `;
    nomineesTable.id = 'dependantsTable';
    formData.nominees.forEach((nominee, index) => {
        const row = nomineesTable.querySelector('tbody').insertRow();
        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = nominee.nameofdependant;
        row.insertCell(2).textContent = nominee.dependantrelationship;
        row.insertCell(3).textContent = nominee.dependantidnumber;
        row.insertCell(4).textContent = nominee.dependantcontact;
    });
    reviewSection.appendChild(nomineesTable);
    // d. next of kin details
    const nextofkinTitleDiv = document.createElement('div');
    nextofkinTitleDiv.classList.add('review-section');
    nextofkinTitleDiv.innerHTML = `
        <article class="contact-details-review-output">
            <h3 class="content-title">(D). NEXT OF KIN DETAILS</h3>
        </article>
    `;
    reviewSection.appendChild(nextofkinTitleDiv);
    const nextOfKinTable = document.createElement('table');
    nextOfKinTable.classList.add('tbl');
    nextOfKinTable.id = 'nextOfKinTable';
    nextOfKinTable.innerHTML = `
        <tbody id="nextOfKinList"></tbody>
        <thead>
            <tr>
                <th>Id</th>
                <th>Name of next of kin</th>
                <th>Relationship</th>
                <th>ID Number</th>
                <th>Contact</th>
            </tr>
        </thead>
    `;
    formData.nextofkin.forEach((nextofkin, index) => {
        const row = nextOfKinTable.querySelector('tbody').insertRow();
        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = nextofkin.nameofnextofkin;
        row.insertCell(2).textContent = nextofkin.nextofkinrelationship;
        row.insertCell(3).textContent = nextofkin.nextofkinidnumber;
        row.insertCell(4).textContent = nextofkin.nextofkincontact;
    });
    reviewSection.appendChild(nextOfKinTable);
    // e. declaration
    const declarationDiv = document.createElement('div');
    contactDetailsDiv.classList.add('review-section');
    declarationDiv.innerHTML = `
        <article class="declaration-details-review-output">
            <h3 class="content-title">(E). DECLARATIONY</h3>
            <div class="declaration-details-review-output-contents">
                <p>
                   I ............................................... OF ID NO ............................... DECLARE TO THE 
                   BEST OF MY KNOWLEDGE THAT THE INFORMATION PROVIDED ABOVE IS TRUE.
                </p>
            </div>
            <div class="official-details-review-output-contents">
                <P>SIGNATURE ............................. DATE ...............................</P>
            </div>
        </article>
    `;
    reviewSection.appendChild(declarationDiv);
    // f. for official use only
    const officialUseDiv = document.createElement('div');
    contactDetailsDiv.classList.add('review-section');
    officialUseDiv.innerHTML = `
        <article class="official-details-review-output">
            <h3 class="content-title">(F). FOR OFFICIAL USE ONLY</h3>
            <div class="official-details-review-output-contents">
                <p>
                    FORM RECEIVED BY .................................... DESIGNATION ..........................
                </p>
            </div>
            <div class="official-details-review-output-contents">
                <P>SIGNATURE ............................. DATE ...............................</P>
            </div>
        </article>
    `;
    reviewSection.appendChild(officialUseDiv);
}


// PASSWORDS MANAGEMENT AND VERIFICATIONS
const eyeIcon1 = document.getElementById('showPassword1');
eyeIcon1.addEventListener('click', () => togglePasswordVisibility('password', eyeIcon1));
const eyeIcon2 = document.getElementById('showPassword2');
eyeIcon2.addEventListener('click', () => togglePasswordVisibility('confirmPassword', eyeIcon2));
function togglePasswordVisibility(inputId, eyeIcon) {
    const passwordInput = document.getElementById(inputId);
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    }
}    
function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthMeter = document.getElementById('password-strength-meter');
    const strengthText = document.getElementById('password-strength-text');
    strengthMeter.value = 0;
    strengthText.textContent = '';
    if (password.length < 8) {
        strengthText.textContent = 'Weak password: Combine special characters, both uppercase and lowercase letters, and numbers for strong password';
        return; 
    }
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        strengthMeter.value += 50;
    } else {
        strengthText.textContent = 'Medium password';
    }
    if (/[\W_]/.test(password) && /\d/.test(password)) {
        strengthMeter.value += 50;
        strengthText.textContent = 'Strong password';
        strengthText.style.color = 'green';
    } else {
        if (strengthMeter.value === 50) {
            strengthText.textContent += ' Include special characters and numbers for a stronger password.';
        }
    }
}
function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmError = document.getElementById('confirmPassword-error');
    const passdisabled = document.getElementById('passdisabled');

    if (password !== confirmPassword) {
        confirmError.textContent = 'Passwords do not match.';
        confirmError.style.color = 'red';
        passdisabled.classList.add('disabled-button');
    } else {
        confirmError.textContent = 'Passwords match.';
        confirmError.style.color = 'green';
        checkPasswordStrength();
        confirmError.style.fontWeight = 'bold';
        passdisabled.classList.remove('disabled-button');
    }
}
const passwordField = document.getElementById('password');
const confirmPasswordField = document.getElementById('confirmPassword');
passwordField.addEventListener('input', checkPasswordMatch);
confirmPasswordField.addEventListener('input', checkPasswordMatch);


// LOGINS PASS SHOW


// SEND DATA TO DJANGO BACKEND WITH FETCH    




// HIDE SEARCH INPUT PLACEHOLDERS ON TYPING
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", function () {
    if (searchInput.value.trim() !== "") {
        const icons = document.querySelectorAll(".search i");
        icons.forEach((icon) => {
            icon.style.display = "none";
        });
    } else {
        const icons = document.querySelectorAll(".search i");
        icons.forEach((icon) => {
            icon.style.display = "inline";
        });
    }
});