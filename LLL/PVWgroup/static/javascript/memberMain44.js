// PAGE NAVIGATION LAYOUT
$(document).ready(function () {
    $('.chevLeftDown, .chev').click(function (e) {
        e.stopPropagation(); 
        $(this).closest('li').find('.fa-chevron-right').toggleClass('chevDown');
        $(this).closest('li').find('.dropdown-content').slideToggle();

        // Highlight the clicked section in the navigation
        $('.nav .chevLeftDown').removeClass('active');
        $(this).closest('.chevLeftDown').addClass('active');
    });

    // ACCOUNTS PAGE SECTION 
    $(document).ready(function () {
        // Get the article parameter from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const accountParam = urlParams.get('accounts');

        // Show the corresponding article
        if (accountParam) {
            showAccount(accountParam);
        }

        // Function to show the specified article
        function showAccount(accountId) {
            // Hide all articles
            $('.memberPortal-accounts').removeClass('active');

            // Show the target article
            const targetAccount = $('#' + accountId);
            if (targetAccount.length) {
                targetAccount.addClass('active');
            } else {
                console.error('Account not found:', accountId);
            }
        }
    });

    // LOAN PAGE SECTION
    $(document).ready(function () {
        // Get the article parameter from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const loanParam = urlParams.get('loans');

        // Show the corresponding article
        if (loanParam) {
            showLoan(loanParam);
        }

        // Function to show the specified article
        function showLoan(loanId) {
            // Hide all articles
            $('.memberPortal-loans').removeClass('active');

            // Show the target article
            const targetLoan = $('#' + loanId);
            if (targetLoan.length) {
                targetLoan.addClass('active');
            } else {
                console.error('Loan not found:', loanId);
            }
        }
    });

});


// TOGGLE DOWN SECTIONS
document.addEventListener('DOMContentLoaded', function () {
    const myShowLoans = document.getElementById('showMyLoans');
    const myShowLoansContent = document.getElementById('dropdown-select-toggle');
   
    myShowLoans.addEventListener('click', function () {
        if (myShowLoansContent.style.display === 'none' || myShowLoansContent.style.display === '') {
            myShowLoansContent.style.display = 'block';
            myShowLoans.querySelector('i').className = 'fa fa-chevron-down';
        } else {
            myShowLoansContent.style.display = 'none';
            myShowLoans.querySelector('i').className = 'fa fa-chevron-right';
        }
    });

    myShowLoansContent.addEventListener('click', function(event) {
        const target = event.target.classList.value;
        const iconClicked = event.target.querySelector('i');

        let elementsToDisplay = null;

        if (target === 'toggle-advance') {
            elementsToDisplay = document.getElementsByClassName('my-accountl-adv'); 
        } else if (target === 'toggle-welfare') {
            elementsToDisplay = document.getElementsByClassName('my-accountl-wel'); 
        } else if (target === 'toggle-loan-summary') {
            elementsToDisplay = document.getElementsByClassName('my-accountl-sumy'); 
        } else {
           alert('An Error occured!')
        }

        // Convert HTMLCollection to array
        const elementsArray = Array.from(elementsToDisplay);

        // Toggle display of the selected elements
        elementsArray.forEach(element => {
            if (element.style.display === 'grid') {
                element.style.display = 'none';
                iconClicked.className = 'fa fa-chevron-right';
            } else {
                element.style.display = 'grid';
                iconClicked.className = 'fa fa-chevron-down';
            }
        });
    });  
});



// HANDLE BENEVOLENT APPLICATION PROCESS
document.addEventListener('DOMContentLoaded', function () { 
    const deceasedInformationPopupContent = document.getElementById('deceasedInformationPopupContent');
    const overlaydi = document.getElementById('overlaydi');
    const deceasedInformationList = document.getElementById('deceasedInformationList');   

    // Function to clear the entire local storage
    function clearLocalStorage() {
        localStorage.clear();
    }

    // Function to get data from local storage or use default values
    function getFromLocalStorage(key, defaultValue) {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    }

    // Function to save data to local storage
    function saveToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Function to delete data from local storage
    function deleteFromLocalStorage(key) {
        localStorage.removeItem(key);
    } 

    
    // Benevolent formdata object
    const benevolentFormData = getFromLocalStorage('benevolentFormData', getDefaultBenevolentFormData());

    // Function to set default values for benevolent form data
    function getDefaultBenevolentFormData() {
        return {
            memberDetails: {
                full_name: '{{ full_name }}',
                position: '{{ member_position }}',
                id_number: '{{ member_idno }}',
                phone_number: '{{ phone_number }}',
                residence: '{{ residence }}'
            },
            deceasedInformation: {
                deceasedChecked: [] 
            },
            bankDetails: {},
            memberDeclaration: false
        };
    }
   
    function updateBenevolentFormData() {
        saveToLocalStorage('benevolentFormData', benevolentFormData);
    }
    
    // Function to delete benevolent form data from local storage
    function deleteBenevolentFormData() {
        deleteFromLocalStorage('benevolentFormData');
    }

    // Function to reset the form and clear form fields
    function resetForm() {
        // Assuming you have a form with the ID "benevolentApplicationForm"
        const benevolentApplicationForm = document.getElementById("benevolentApplicationForm");
        benevolentApplicationForm.reset(); // Reset the form

        // You may also want to clear the benevolentFormData object
        benevolentFormData.memberDetails = {};
        benevolentFormData.deceasedInformation = {};
        benevolentFormData.bankDetails = [];
        benevolentFormData.memberDeclaration = false;
        
        // Update and save the cleared form data to local storage
        updateBenevolentFormData();
    }

    if (getDefaultBenevolentFormData) {
        // // Parse the stored data and update the formData
        // formData.deceasedInformation.deceasedChecked = JSON.parse(storedData);

        // Add rows to the deceasedInformationList
        benevolentFormData.deceasedInformation.deceasedChecked.forEach(rowData => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${rowData.nameofdependant}</td>
                <td>${rowData.dependantrelationship}</td>
                <td class="idnumber">${rowData.dependantidnumber}</td>
                <td>${rowData.dateofbirth}</td>
                <td>${rowData.dateofdeath}</td>
            `;

            // Check for duplicate ID numbers
            let newIdNumber = rowData.dependantidnumber;
            let isDuplicate = Array.from(deceasedInformationList.querySelectorAll('.idnumber')).some(existingIdNumber => {
                return existingIdNumber.textContent === newIdNumber;
            });

            if (!isDuplicate) {
                // If not a duplicate, add the new row
                deceasedInformationList.appendChild(newRow);
            }
        });
    }

    function showSection(index) {
        sectionsdi.forEach((sectiondi, i) => {
            if (i === index) {
                sectiondi.classList.add('active');
            } else {
                sectiondi.classList.remove('active');
            }
        });
    }

    function isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateString);
    }

    // Get CSRF token from cookie
    function getCSRFToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            .split('=')[1];

        return cookieValue;
    }

    // custom csrf
    function getCookie(name) {
        const cookieName = name + "=";
        const decodedCookies = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookies.split(';');

        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i].trim();
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length);
            }
        }
        return null;
    }

    // Function to format field name for better user experience
    function formatFieldName(fieldName) {
        // Example: Convert 'account_name' to 'Account Name'
        return fieldName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function handleSubmission() {
        event.preventDefault();

        // Check if the clicked element has the correct ID
        if (event.target.id === 'benevolentClaimSubmitButton') {

            // Check if at least one dependant is selected
            if (benevolentFormData.deceasedInformation.deceasedChecked.length === 0) {
                Swal.fire({
                    title: 'Deceased Information Required',
                    text: 'Please select at least one dependant.',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                });
                return; // Stop the form submission
            }

            // Populate the form data object with  member details values
            benevolentFormData.memberDetails = {
                full_name: document.getElementById('full_name').value,
                id_number: document.getElementById('id_number').value,
                phone_number: document.getElementById('phone_number').value,
                position: document.getElementById('position').value,
                residence: document.getElementById('residence').value,
            };

            // Check for empty member details
            const emptyMemberDetailKey = Object.keys(benevolentFormData.memberDetails).find(key => benevolentFormData.memberDetails[key].trim() === '');
            if (emptyMemberDetailKey) {
                Swal.fire({
                    title: 'Error',
                    text: `${formatFieldName(emptyMemberDetailKey)} field cannot be empty`,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
                return;
            }

            // Populate the form data object with  bank details values
            benevolentFormData.bankDetails = {
                account_name: document.getElementById('account_name').value,
                account_number: document.getElementById('account_number').value,
                bank: document.getElementById('bank').value,
                branch: document.getElementById('branch').value,
            };

            // Check for empty bank details
            const emptyBankDetailKey = Object.keys(benevolentFormData.bankDetails).find(key => benevolentFormData.bankDetails[key].trim() === '');
            if (emptyBankDetailKey) {
                Swal.fire({
                    title: 'Error',
                    text: `${formatFieldName(emptyBankDetailKey)} field cannot be empty`,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
                return;
            }
            
            benevolentFormData.memberDeclaration = {
                agreement: document.querySelector('input[name="agreement"]:checked') ? true : false,
            };
                // Check if the agreement is not checked
            if (!benevolentFormData.memberDeclaration.agreement) {
                Swal.fire({
                    title: 'Error',
                    text: 'You must agree to the terms before submitting',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
                return;
            }

        
            // Ask user for confirmation
            Swal.fire({
                title: 'Confirmation',
                text: `Are you sure you want to submit Benevolent claim application for ${getDependantNames()}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, submit',
                cancelButtonText: 'Cancel',
            }).then((result) => {
                if (result.isConfirmed) {
                
                    // Send the form data to the Django view using AJAX
                    fetch('benevolent_claim_view', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken'),
                        },
                        body: JSON.stringify(benevolentFormData),
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Handle the response from the server, if needed
                      
                        if (data.success) {
                            // Clear the form input fields excluding member details
                            document.getElementById('account_name').value = '';
                            document.getElementById('account_number').value = '';
                            document.getElementById('bank').value = '';
                            document.getElementById('branch').value = '';
                            // Uncheck the checkbox
                            document.querySelector('input[name="agreement"]').checked = false;
                            // Clear any other fields as needed

                            // Clear the deceased information table
                            document.getElementById('deceasedInformationList').innerHTML = '';

                            // After successful submission, reset the form and remove data from local storage
                            deleteBenevolentFormData();

                            // Optionally, clear the entire local storage
                            // clearLocalStorage();
        
                            // Show a SweetAlert
                            Swal.fire({
                                title: 'Success!',
                                text: 'Benevolent Claim submitted successfully and is in review.',
                                icon: 'success',
                                confirmButtonText: 'OK',
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            // Show an error SweetAlert
                            Swal.fire({
                                title: 'Error',
                                text: 'An error occurred while submitting the Benevolent Claim.',
                                icon: 'error',
                                confirmButtonText: 'OK',
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error sending form data:', error);
                        // Handle the error, if needed
                    });

                }
            });
            
        } else {
            alert('Submit Application Button Not Clicked')
        }
    }

    function getDependantNames() {
        const dependantNames = benevolentFormData.deceasedInformation.deceasedChecked.map(deceased => deceased.nameofdependant);
        
        if (dependantNames.length === 0) {
            return '';
        } else if (dependantNames.length === 1) {
            return dependantNames[0];
        } else {
            const lastDependant = dependantNames.pop(); 
            return dependantNames.join(', ') + ' and ' + lastDependant;
        }
    }


    // Get deceased Information from dependants model
    document.getElementById('deceasedInformationBtn').addEventListener('click', function (event) {
        event.preventDefault();

        // Check if the clicked element has the correct ID
        if (event.target.id === 'deceasedInformationBtn') {
            // Make a GET request 
            fetch('get_deceased_information_details')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.error && data.error === 'Nominee Information not found') {
                        Swal.fire({
                            title: 'Deceased Information Not Found',
                            text: 'You don\'t have dependants.',
                            icon: 'info',
                            confirmButtonText: 'OK',
                        });
                    } else {
                        // add deceased data in html
                        deceasedInformationPopupContent.innerHTML = `
                            <div class="pending-approvaldi">
                                <table class="tbl">
                                    <thead>
                                        <tr>
                                            <th>Name of Dependant</th>
                                            <th>Dependant Relationship</th>
                                            <th>Dependant ID Number</th>
                                            <th>Dependant Contact</th>
                                            <th>Tick Deceased</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${data.deceasedInformationData.map(deceasedData => `
                                            <tr>
                                                <td>${deceasedData.nameofdependant}</td>
                                                <td>${deceasedData.dependantrelationship}</td>
                                                <td>${deceasedData.dependantidnumber}</td>
                                                <td>${deceasedData.dependantcontact}</td>
                                                <td><input type="checkbox" class="deceasedCheckbox" data-deceased-id="${deceasedData.dependantidnumber}" ${deceasedData.is_deceased ? 'checked' : ''}></td>
                                                </tr>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `;

                        currentSectiondi = 0;
                        sectionsdi = document.querySelectorAll('.pending-approvaldi');
                        showSection(currentSectiondi);
                        overlaydi.style.display = 'flex';

                        // Add event listener for checkbox change event
                        const deceasedCheckboxes = document.querySelectorAll('.deceasedCheckbox');

                        deceasedCheckboxes.forEach(checkbox => {
                            checkbox.addEventListener('change', function () {
                                const isChecked = this.checked;
                                const deceasedId = this.getAttribute('data-deceased-id');
                                const deceasedRowData = data.deceasedInformationData.find(item => item.dependantidnumber === deceasedId);

                                // code to execute when the checkbox state changes
                                if (checkbox.checked) {
                                    let dateOfBirth, dateOfDeath;

                                    // Prompt the user for date of birth (validate the format)
                                    do {
                                        dateOfBirth = prompt('Enter Date of Birth (YYYY-MM-DD):');
                                    } while (!isValidDate(dateOfBirth));

                                    // Prompt the user for date of death (validate the format)
                                    do {
                                        dateOfDeath = prompt('Enter Date of Death (YYYY-MM-DD):');
                                    } while (!isValidDate(dateOfDeath));

                                    // AJAX request to update is_deceased field
                                    $.ajax({
                                        url: `update_is_deceased/${deceasedId}/`,
                                        type: 'POST',
                                        headers: { 'X-CSRFToken': getCSRFToken() },
                                        data: {
                                            'is_deceased': this.checked === true,
                                        },
                                        success: function (data) {
                                            console.log('Update successful');
                                            // Update local storage in real-time
                                            updateBenevolentFormData();
                                            // updateLocalStorage();
                                        },
                                        error: function () {
                                            console.log('Update failed');
                                        }
                                    });

                                    benevolentFormData.deceasedInformation.deceasedChecked.push({
                                        isChecked,
                                        deceasedId,
                                        dateofbirth: dateOfBirth,
                                        dateofdeath: dateOfDeath,
                                        ...deceasedRowData
                                    });
                                } else {
                                    // Checkbox is unchecked, remove data from selectedDeceasedRows
                                    const index = benevolentFormData.deceasedInformation.deceasedChecked.findIndex(item => item.dependantidnumber === deceasedId);
                                    if (index !== -1) {
                                        benevolentFormData.deceasedInformation.deceasedChecked.splice(index, 1);
                                    }

                                    // AJAX request to revert is_deceased field
                                    $.ajax({
                                        url: `revert_is_deceased/${deceasedId}/`,
                                        type: 'POST',
                                        headers: { 'X-CSRFToken': getCSRFToken() },
                                        data: {
                                            'is_deceased': this.checked === false,
                                        },
                                        success: function (data) {
                                            console.log('Revert successful');
                                            // Update local storage in real-time
                                            // updateLocalStorage();
                                        },
                                        error: function () {
                                            console.log('Revert failed');
                                        }
                                    });
                                }
                            });
                        });

                        // // Function to update local storage
                        updateBenevolentFormData();
                        // function updateLocalStorage() {
                        //     localStorage.setItem('deceasedChecked', JSON.stringify(benevolentFormData.deceasedInformation.deceasedChecked));
                        // }
                    }
                })
                .catch(error => {
                    // Display an error message to the user
                    Swal.fire({
                        title: 'Error',
                        text: 'An error occurred while fetching deceased information.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                });
        }
    });



    document.getElementById('nextLink').addEventListener('click', function (event) {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Check if the clicked element has the correct ID
        if (event.target.id === 'nextLink') {
            // Clear the existing rows in deceasedInformationList
            deceasedInformationList.innerHTML = '';

            // Filter out unchecked rows and add selected rows to the deceasedInformationTable
            benevolentFormData.deceasedInformation.deceasedChecked = benevolentFormData.deceasedInformation.deceasedChecked.filter(rowData => {
                const isChecked = document.querySelector(`.deceasedCheckbox[data-deceased-id="${rowData.dependantidnumber}"]`).checked;

                // Add the row only if it is checked
                if (isChecked) {
                    // Check for duplicate ID numbers
                    let newIdNumber = rowData.dependantidnumber;

                    // Check if a row with the same ID number already exists
                    let isDuplicate = Array.from(deceasedInformationList.querySelectorAll('.deceasedRow')).some(existingRow => {
                        return existingRow.dataset.idnumber === newIdNumber;
                    });

                    if (isDuplicate) {
                        // Show a SweetAlert for duplicate ID number
                        Swal.fire({
                            title: 'Error',
                            text: 'Dependant already added.',
                            icon: 'error',
                            confirmButtonText: 'OK',
                        });
                    } else {
                        // If not a duplicate, add the new row
                        const newRow = document.createElement('tr');
                        newRow.classList.add('deceasedRow');
                        newRow.dataset.idnumber = newIdNumber;
                        newRow.innerHTML = `
                            <td>${rowData.nameofdependant}</td>
                            <td>${rowData.dependantrelationship}</td>
                            <td class="idnumber">${rowData.dependantidnumber}</td>
                            <td>${rowData.dateofbirth}</td>
                            <td>${rowData.dateofdeath}</td>
                        `;
                        deceasedInformationList.appendChild(newRow);
                    }

                    return true; // Keep the checked row in the array
                } 


                // If unchecked, remove from local storage
                const index = benevolentFormData.deceasedInformation.deceasedChecked.findIndex(item => item.dependantidnumber === rowData.dependantidnumber);
                if (index !== -1) {
                    benevolentFormData.deceasedInformation.deceasedChecked.splice(index, 1);
                }

                // AJAX request to revert is_deceased field
                $.ajax({
                    url: `revert_is_deceased/${rowData.dependantidnumber}/`,
                    type: 'POST',
                    headers: { 'X-CSRFToken': getCSRFToken() },
                    data: {
                        'is_deceased': false,
                    },
                    success: function (data) {
                        console.log('Revert successful');
                    },
                    error: function () {
                        console.log('Revert failed');
                    }
                });

                return false; // Remove the unchecked row from the array
            });

            // Store the array in local storage
            // localStorage.setItem('deceasedChecked', JSON.stringify(formData.deceasedInformation.deceasedChecked));
            updateBenevolentFormData();

            // Hide the overlay
            overlaydi.style.display = 'none';
        } else {
            console.log(event.target.id);
        }
    });


    document.getElementById('benevolentClaimSubmitButton').addEventListener('click', function(event) {
        handleSubmission();
    });

    document.addEventListener('keypress', function(event) {
        // Check if the pressed key is Enter (keyCode 13)
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmission();
        }
    });

    // Close pop up deceased information in real time
    document.getElementById('popupCloseButtondi').addEventListener('click', function () {
        overlaydi.style.display = 'none';
        window.location.reload();
    });
    document.getElementById('popupCloseButtondi2').addEventListener('click', function () {
        overlaydi.style.display = 'none';
        window.location.reload();
    });
    
    // Update benevolent details in real-time
    document.querySelector('.bankDetailsContents').addEventListener('input', function (event) {
        const input = event.target;
        benevolentFormData.bankDetails[input.name] = input.value;
        updateBenevolentFormData();
    });
    // Populate benevolent details on page load
    populateBenevolentBankDetails();

    // Update member declaration in real-time
    document.querySelector('.declarationDeclarationContents input[name="agreement"]').addEventListener('input', function (event) {
        benevolentFormData.memberDeclaration = event.target.checked;
        updateBenevolentFormData();
    });

    // Set member declaration based on local storage value on page refresh
    document.querySelector('.declarationDeclarationContents input[name="agreement"]').checked = benevolentFormData.memberDeclaration;

    // Function to populate benevolent details from local storage
    function populateBenevolentBankDetails() {
        Object.keys(benevolentFormData.bankDetails).forEach(key => {
            const inputElement = document.querySelector(`.bankDetailsContents input[name="${key}"]`);
            if (inputElement) {
                inputElement.value = benevolentFormData.bankDetails[key];
            }
        });
    }


});



// SHARE TRANSFER
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('submitShareTransfer').addEventListener('click', function (event) {
        event.preventDefault();

        if (event.target.id === "submitShareTransfer") {
            Swal.fire({
                title: 'Enter your pin',
                input: 'password',
                inputAttributes: {
                    autocapitalize: 'off',
                    autocorrect: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Submit',
                cancelButtonText: 'Cancel',
                preConfirm: async (pin) => {
                    const formData = new FormData();
                    formData.append('membernumberst', document.getElementById('membernumberst').value);
                    formData.append('shareAmountToTransfer', document.getElementById('shareAmountToTransfer').value);
                    formData.append('transferReason', document.getElementById('transferReason').value);
                    formData.append('pin', pin);

                    try {
                        const response = await fetch('/membersPortal/checkPinForShareTransfer', {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': getCookie('csrftoken'),
                            },
                            body: formData,
                        });

                        const data = await response.json();

                        if (data.correct) {
                            return data.confirmation_message;
                        } else {
                            // Handle incorrect PIN or recipient user does not exist
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: data.error
                            });
                            return false; // Prevent further execution
                        }
                    } catch (error) {
                        // Handle fetch errors
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'An error occurred while processing your request. Please try again.'
                        });
                        return false; // Prevent further execution
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // PIN is correct, ask for final confirmation
                    Swal.fire({
                        title: 'Confirmation',
                        html: `${result.value}`,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, submit',
                        cancelButtonText: 'Cancel',
                    }).then((confirmationResult) => {
                        if (confirmationResult.isConfirmed) {
                            // Submit the form data
                            const formData = new FormData();
                            formData.append('membernumberst', document.getElementById('membernumberst').value);
                            formData.append('shareAmountToTransfer', document.getElementById('shareAmountToTransfer').value);
                            formData.append('transferReason', document.getElementById('transferReason').value);

                            fetch('/membersPortal/transfer_shares', {
                                method: 'POST',
                                headers: {
                                    'X-CSRFToken': getCookie('csrftoken')
                                },
                                body: formData,
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if ('success' in data) {
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Success',
                                            text: data.success,
                                            showConfirmButton: false,
                                            timer: 2000
                                        }).then(() => {
                                            location.reload();
                                        });
                                    } else if ('error' in data) {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error',
                                            text: data.error
                                        });
                                    }
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                });
                        }
                    });
                }
            });
        } else {
            alert("Submit Transfer Share Button Not clicked");
        }
    });

    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    }

});



// ADJUST MONTHLY SHARE CONTRIBUTIONS
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submitShareAdjustment").addEventListener("click", function (event) {
        event.preventDefault();

        // Get values from form fields
        const memberNumbersa = document.getElementById("memberNumbersa").value.trim();
        const adjustContributions_amount = document.getElementById("adjustContributions_amount").value.trim();

        // Check if either field is empty
        if (memberNumbersa === '' || adjustContributions_amount === '') {
            Swal.fire({
                icon: "error",
                title: "Failed!",
                text: "Member Number or Adjusted Amount cannot be empty and must have a value."
            });
            return;
        }

        // Create an object to store the form data
        const adjustedShareAmountForm = {
            memberNumbersa: memberNumbersa,
            adjustContributions_amount: adjustContributions_amount
        };

        if (event.target.id === "submitShareAdjustment") {
            Swal.fire({
                title: 'Enter your pin',
                input: 'password',
                inputAttributes: {
                    autocapitalize: 'off',
                    autocorrect: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Submit',
                cancelButtonText: 'Cancel',
                preConfirm: async (pin) => {
                    const formData = new FormData();
                    formData.append('memberNumbersa', memberNumbersa);
                    formData.append('adjustContributions_amount', adjustContributions_amount);
                    formData.append('pin', pin);

                    try {
                        const response = await fetch('/membersPortal/checkPinForShareAdjustment', {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': getCookie('csrftoken'),
                            },
                            body: formData,
                        });

                        const data = await response.json();

                        if (data.correct) {
                            // PIN is correct, continue with final confirmation
                            return data.confirmation_message;
                        } else {
                            // Handle incorrect PIN immediately
                            Swal.fire({
                                icon: 'error',
                                title: 'Incorrect PIN',
                                text: 'The entered PIN is incorrect. Please try again.'
                            });
                            return false; // Prevent further execution
                        }
                    } catch (error) {
                        // Handle fetch errors
                        return false;
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // PIN is correct, ask for final confirmation
                    Swal.fire({
                        title: 'Confirmation',
                        html: `${result.value}`,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, submit',
                        cancelButtonText: 'Cancel',
                    }).then((confirmationResult) => {
                        if (confirmationResult.isConfirmed) {
                            // Submit the form data
                            const formData = new FormData();
                            formData.append('memberNumbersa', document.getElementById('memberNumbersa').value);
                            formData.append('adjustContributions_amount', document.getElementById('adjustContributions_amount').value);

                            //submit form data to django backend
                            fetch(`/membersPortal/Submit-Share-Adjustment`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRFToken': getCookie('csrftoken'),
                                },
                                body: JSON.stringify({
                                    adjustedShareAmountForm
                                }),
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.status === 'success') {
                                        const oldAmount = data.old_amount;
                                        const newAmount = data.new_amount;  

                                        Swal.fire({
                                            icon: "success",
                                            title: "Request Sent Successfully!",
                                            html: `Your request to change monthly share contributions from ${oldAmount} to ${newAmount} has been submitted successfully.`
                                        });
                                    } else {
                                        Swal.fire({
                                            icon: "error",
                                            title: "Oops...",
                                            text: "Error saving form data!",
                                            footer: '<a href="#">Why do I have this issue?</a>'
                                        });
                                    }
                                })
                                .catch(error => {
                                    Swal.fire({
                                        icon: "error",
                                        title: "Oops...",
                                        text: "Error saving form data!",
                                        footer: '<a href="#">Why do I have this issue?</a>'
                                    });
                                });

                        }
                    });
                }
            });

            //clear form fields
            document.getElementById('adjustContributions_amount').value = '';
        } else {
            alert('Submit Share Adjustment Button Not Clicked')
        }

        // custom csrf
        function getCookie(name) {
            const cookieName = name + "=";
            const decodedCookies = decodeURIComponent(document.cookie);
            const cookieArray = decodedCookies.split(';');

            for (let i = 0; i < cookieArray.length; i++) {
                let cookie = cookieArray[i].trim();
                if (cookie.indexOf(cookieName) === 0) {
                    return cookie.substring(cookieName.length);
                }
            }
            return null;
        }

    });

});





// HANDLE LOAN APPLICATION PROCESS
document.addEventListener('DOMContentLoaded', function () {

    // Function to clear the entire local storage
    function clearLocalStorage() {
        localStorage.clear();
    }

    // Function to get data from local storage or use default values
    function getFromLocalStorage(key, defaultValue) {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    }

    // Function to save data to local storage
    function saveToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Function to delete data from local storage
    function deleteFromLocalStorage(key) {
        localStorage.removeItem(key);
    }

    // Loan formdata object
    const loanFormData = getFromLocalStorage('loanFormData', getDefaultLoanFormData());

    // Function to set default values for loan form data
    function getDefaultLoanFormData() {
        return {
            personalDetails: {
                full_name: '{{ full_name }}',
                position: '{{ member_position }}',
                id_number: '{{ member_idno }}',
                phone_number: '{{ phone_number }}',
                residence: '{{ residence }}'
            },
            loanDetails: {
                loan_amount: "",
                loanType: {
                    advanceLoan: false,
                    normalLoan: false
                },
                repayment_period: "",
                monthly_installment: "",
                loan_purpose: ""
            },
            guarantors: [],
            declaration: false,
            support_documents: []
        };
    }
    
    // Function to update local storage and loan form data
    function updateLoanFormData() {
        saveToLocalStorage('loanFormData', loanFormData);
    }

    // Function to delete loan form data from local storage
    function deleteLoanFormData() {
        deleteFromLocalStorage('loanFormData');
    }

    // Function to reset the form and clear form fields
    function resetForm() {
        // Assuming you have a form with the ID "loanApplicationForm"
        const loanApplicationForm = document.getElementById("loanApplicationFormData");
        loanApplicationForm.reset(); // Reset the form

        // You may also want to clear the loanFormData object
        loanFormData.personalDetails = {};
        loanFormData.loanDetails = {};
        loanFormData.guarantors = [];
        loanFormData.declaration = false;
        loanFormData.support_documents = [];
        
        // Update and save the cleared form data to local storage
        updateLoanFormData();
    }


    // -------------Loan Details Start------------

    // event listerner for checking and unchecking advance loan 
    document.getElementById('advanceLoan').addEventListener('change', function () {
        uncheckOther(this);
        loanFormData.loanDetails.loanType.advanceLoan = this.checked;
        if (this.checked) {
            loanFormData.loanDetails.loanType.normalLoan = false;
            document.getElementById('normalLoan').checked = false;
        }
    });

    // event listerner for checking and unchecking normal loan 
    document.getElementById('normalLoan').addEventListener('change', function () {
        uncheckOther(this);
        loanFormData.loanDetails.loanType.normalLoan = this.checked;
        if (this.checked) {
            loanFormData.loanDetails.loanType.advanceLoan = false;
            document.getElementById('advanceLoan').checked = false;
        }
    });

    // Event listener for amount and repayment period fields
    document.getElementById('amount').addEventListener('input', calculateMonthlyInstallment);
    document.getElementById('repaymentPeriod').addEventListener('input', calculateMonthlyInstallment);

    // Attach event listeners to relevant form elements for real-time updates of loan details
    document.getElementById('amount').addEventListener('input', updateLoanDetails);
    
    document.getElementById('advanceLoan').addEventListener('change', updateLoanDetails);
    document.getElementById('normalLoan').addEventListener('change', updateLoanDetails);
    document.getElementById('repaymentPeriod').addEventListener('input', updateLoanDetails);
    document.getElementById('monthlyInstallment').addEventListener('input', updateLoanDetails);
    document.getElementById('loanPurpose').addEventListener('input', updateLoanDetails);

    // Update loan details based on local storage value on page refresh
    updateLoanDetailsFromLocalStorage()

    // -------------Loan Details End------------


    // --------------Guarantor Details Start---------------

    // Event listener for adding guarantors
    document.getElementById('addGuarantor').addEventListener('click', function (event) {
        event.preventDefault();

        if (event.target.id === "addGuarantor" ) {

            const memberNumber = document.getElementById('guarantorMemberNumber').value.trim();

            if (memberNumber) {
                // Check if the complete row already exists
                const isDuplicate = Array.from(document.querySelectorAll('#loanGuarantorsList tr')).some(row => {
                    const idNumberCell = row.cells[2].textContent.trim();
                    return idNumberCell === memberNumber;
                });

                if (isDuplicate) {
                    document.getElementById('guarantorMemberNumber').value = '';
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "You have already selected this member as a guarantor!",
                        footer: '<a href="#">Why do I have this issue?</a>'
                    });
                    return;
                } else {

                    const xhr = new XMLHttpRequest();
                    const loanAmountAppliedFor = document.getElementById("amount").value.trim();
                    
                    xhr.open('GET', `get_guarantor_info/${memberNumber}/?loan_amount=${loanAmountAppliedFor}`, true);
                    xhr.onload = function () {

                        if (xhr.status === 200) {
                            const data = JSON.parse(xhr.responseText);

                            console.log(data)
                    
                            document.getElementById('guarantorMemberNumber').value = '';
                            const tableBody = document.getElementById('loanGuarantorsList');
                    
                            // Check if the guarantor is already in the table
                            const isGuarantorInTable = Array.from(tableBody.rows).some(row => {
                                const idNumberCell = row.cells[2].textContent.trim();
                                return idNumberCell === data.id_number;
                            });
                    
                            if (data.status == "maximum limit") {
                                Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "The provided guarantor has reached the maximum limit of guaranteeing two loans. Please choose another guarantor.",
                                    footer: '<a href="#" id="errorExplanationMaxLimit">Why do I see this?</a>'
                                });
                                // Event delegation to handle the click outside the Swal.fire callback
                                document.body.addEventListener('click', function (e) {
                                    if (e.target && e.target.id === 'errorExplanationMaxLimit') {
                                        e.preventDefault();
                                        Swal.fire({
                                            title: 'Error Explanation',
                                            text: 'A member can guarantee a maximum of two other members.',
                                            icon: 'info'
                                        });
                                    }
                                });
                                return;
                            }
                    
                            if (data.status == "not self guarantorship") {
                                Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "You do not qualify for self guarantorship. Please consider using other members as your guarantors.",
                                    footer: '<a href="#" id="errorExplanationNotSelfGuarantorship">Why do I see this?</a>'
                                });
                                // Event delegation to handle the click outside the Swal.fire callback
                                document.body.addEventListener('click', function (e) {
                                    if (e.target && e.target.id === 'errorExplanationNotSelfGuarantorship') {
                                        e.preventDefault();
                                        Swal.fire({
                                            title: 'Error Explanation',
                                            text: 'If a member intends to borrow an amount equal to 90% of their saved shares, they can act as their own guarantor. For example, if a member has shares worth KES 10,000 and wishes to borrow KES 90,000, they can guarantee themselves.',
                                            icon: 'info'
                                        });
                                    }
                                });
                                return;
                            }
                            
                            if (!isGuarantorInTable) {
                                // Add the new guarantor to the table only if not already present
                                const newRow = tableBody.insertRow();
                                newRow.innerHTML = `
                                    <td>${tableBody.rows.length}</td>
                                    <td>${data.full_name}</td>
                                    <td>${data.member_number}</td>
                                    <td>${data.id_number}</td>
                                    <td>${data.phone_number}</td>
                                    <td>${data.is_self_guarantorship}</td>
                                    <td class="pending-acceptance">Pending Acceptance</td>
                                    <td><i class="fa fa-trash delete-button"></i></td>
                                `;
                    
                                // Add event listener to the delete button in the new row
                                var deleteButton = newRow.querySelector('.delete-button');
                                deleteButton.addEventListener('click', function () {
                                    deleteRow(newRow.rowIndex);
                                });
                    
                                // Extract data from newRow and push it as an object to guarantors array
                                const newRowData = {
                                    full_name: data.full_name,
                                    member_number: data.member_number,
                                    id_number: data.id_number,
                                    phone_number: data.phone_number,
                                    is_self_guarantorship: data.is_self_guarantorship,
                                    status: "Pending Acceptance"
                                };
                    
                                loanFormData.guarantors.push(newRowData);
                    
                                // Update the guarantors table based on the current guarantors array
                                updateGuarantorsTable();
                    
                                // Update local storage and loan form data
                                updateLoanFormData();
                    
                                Swal.fire({
                                    title: "Member Number found!",
                                    text: "A request has been sent to the guarantor, and it is pending their acceptance.",
                                    icon: "success"
                                });
                                
                            } else {
                                document.getElementById('guarantorMemberNumber').value = '';
                                Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "You have already selected this member as a guarantor!"
                                });
                                return;
                            }

                        } else {
                            document.getElementById('guarantorMemberNumber').value = '';
                            Swal.fire({
                                icon: "error",
                                title: "Oops...",
                                text: "Member number not found!",
                                footer: '<a href="#" id="errorExplanationMemberNotFound">Why do I have this issue?</a>'
                            }).then((result) => {
                                // Handle the click event on the link
                                if (result.isConfirmed) {
                                    Swal.fire({
                                        title: 'Error Explanation',
                                        html: 'This error occurs because the entered member number is either not approved or does not exist. It could also be due to the associated account being blocked. Please refer to the guarantor eligibility section for more information.',
                                        icon: 'info'
                                    });
                                }
                            });
                            // Event delegation to handle the click outside the Swal.fire callback
                            document.body.addEventListener('click', function (e) {
                                if (e.target && e.target.id === 'errorExplanationMemberNotFound') {
                                    e.preventDefault();
                                    Swal.fire({
                                        title: 'Error Explanation',
                                        html: '<div style="text-align: justify;">You are encountering this error because the entered member number is either not approved or does not exist. It could also be due to the associated account being blocked. Please refer to the guarantor eligibility section for more information.</div>',
                                        icon: 'info'
                                    });
                                }
                            });
                        }
                    };
                    
                    xhr.onerror = function () {
                        console.error('Network error');
                    };
                    
                    xhr.send();
                    
                }
            }

        }

    });

    // Call the updateGuarantorsTable function to initialize the table with existing guarantors
    updateGuarantorsTable();

    // --------------Guarantor Details End ----------------


    // --------------Loan Declaration Start ----------------

    // Call the function on relevant events (e.g., change)
    document.querySelector('input[name="loan_agreement"]').addEventListener('change', function () {
        loanFormData.declaration = this.checked;
        updateLoanFormData();
    });

    // Set loan declaration based on local storage value on page refresh
    document.querySelector('input[name="loan_agreement"]').checked = loanFormData.declaration;

    // --------------Loan Declaration End ----------------


    // ------------------  Loan Submission Start ------------------

    // Event listener for loan Application Submit Button
    document.getElementById("loanApplicationSubmitButton").addEventListener('click', function (event) {
        event.preventDefault();

        if (event.target.id === "loanApplicationSubmitButton") {
          
            // Validate the form before submission
            if (validateFormSubmission()) {

                // Update and save the loanFormData to local storage
                updateLoanFormData();

                // Call the function to submit the loan application data to the server
                submitLoanApplication(loanFormData);

            } 
            
        }
    });

    // ------------------  Loan Submission End ------------------


    // initialize objects and steps
    let formStepsNum = 0;
            
    // next button
    document.querySelectorAll(".btn-next").forEach(btn => {
        
        btn.addEventListener('click', () => {

            if (formStepsNum === 0) {
                // Populate the form data object with member details values, applying trim
                loanFormData.personalDetails = {
                    full_name: document.getElementById('full_name_la').value.trim(),
                    id_number: document.getElementById('id_number_la').value.trim(),
                    phone_number: document.getElementById('phone_number_la').value.trim(),
                    position: document.getElementById('position_la').value.trim(),
                    residence: document.getElementById('residence_la').value.trim(),
                };

                // Update and save personal details to local storage
                updateLoanFormData();

            } else if (formStepsNum === 1) {

                const fieldMappings = {
                    'advanceLoan': 'Advance Loan',
                    'normalLoan': 'Normal Loan',
                    'amount': 'Amount',
                    'repaymentPeriod': 'Repayment Period',
                    'loanPurpose': 'Loan Purpose',
                };
                
                const advanceLoanCheckbox = document.getElementById('advanceLoan');
                const normalLoanCheckbox = document.getElementById('normalLoan');
                const requiredFields = Object.keys(fieldMappings);
                const emptyFields = requiredFields.filter(field => {
                    const element = document.getElementById(field);
                    return !element.value.trim() && (normalLoanCheckbox.checked || field !== 'repaymentPeriod' && field !== 'monthlyInstallment');
                });
                
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
                } else if (!advanceLoanCheckbox.checked && !normalLoanCheckbox.checked) {
                    // If neither loan type is checked, show SweetAlert
                    Swal.fire({
                        title: 'Please select the loan type',
                        text: 'You must select the loan type you are applying for before proceeding.',
                        icon: 'warning',
                        confirmButtonText: 'OK',
                    });
                    return;
                }
                
                // Update and save the loan details to local storage
                updateLoanFormData();

            } else if (formStepsNum === 2 ) {

                // Check for guarantor requirements, considering self-guarantorship
                if (
                    loanFormData.guarantors.length < 2 &&
                    !loanFormData.guarantors.some(
                    (guarantor) => guarantor.is_self_guarantorship
                    )
                ) {
                    Swal.fire({
                    title: 'Guarantors Information is Required',
                    text: 'Please add at least two guarantors.',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                    });
                    return false;
                }
  
                // Update guarantors to local storage
                updateLoanFormData();

            } else if (formStepsNum === 3 ) {
                
                // Check if the agreement is not checked
                if (!loanFormData.declaration) {
                    Swal.fire({
                        title: 'Error',
                        text: 'You must agree to the loan declaration before submitting the loan application',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                    return false;
                }

            }

            formStepsNum++;
            updateFormSteps();

        });

    });

    // previous button
    document.querySelectorAll(".btn-prev").forEach(btn => {
        btn.addEventListener('click', () => {

            formStepsNum--;
            updateFormSteps();

            console.log("Processing BACK...")

        })
    })

    function updateFormSteps() {
        const formSteps = document.querySelectorAll('.form-step');
        formSteps.forEach((formStep, idx) => {
            formStep.classList.remove('form-step-active');
        });
        formSteps[formStepsNum].classList.add('form-step-active');

        // Update the step count in the HTML
        const dynamicSectionStepCount = document.getElementById('dynamic-section-step-count');
        dynamicSectionStepCount.textContent = `Step ${formStepsNum + 1} of 4`; 

        // Update the step head in the HTML
        const dynamicSectionHead = document.getElementById('dynamic-section-head');
        switch (formStepsNum) {
            case 0:
                dynamicSectionHead.textContent = "Loan Application Form (Applicant's Details):";
                break;
            case 1:
                dynamicSectionHead.textContent = "Loan Application Form (Loan Details):";
                break;
            case 2:
                dynamicSectionHead.textContent = "Loan Application Form (Guarantors):";
                break;
            case 3:
                dynamicSectionHead.textContent = "Loan Application Form (Declaration and Submission):";
                break;
        }
    }

    // Update checkboxes in real time
    function uncheckOther(currentCheckbox) {
        const advanceChecked = document.getElementById('advanceLoan');
        const normalChecked = document.getElementById('normalLoan');
        const checkboxes = [advanceChecked, normalChecked];

        checkboxes.forEach(function (checkbox) {
            if (checkbox !== currentCheckbox) {
                checkbox.checked = false;
                loanFormData.loanDetails.loanType[checkbox.id] = false;
            } else {
                loanFormData.loanDetails.loanType[checkbox.id] = true;
            }
        });

        const showInputs = document.getElementsByClassName('showIfNormalLoan');
        const repaymentPeriodInput = document.getElementById('repaymentPeriod');
        const monthlyInstallmentInput = document.getElementById('monthlyInstallment');

        if (normalChecked.checked) {
            if (showInputs.length > 0) {
                showInputs[0].style.display = 'block';
                showInputs[1].style.display = 'block';
                showInputs[2].style.display = 'block';
            }
            // If normalLoan is checked, display monthly installment and repayment period
            repaymentPeriodInput.style.display = 'block';
            monthlyInstallmentInput.style.display = 'block';
        } else {
            if (showInputs.length > 0) {
                showInputs[0].style.display = 'none';
                showInputs[1].style.display = 'none';
                showInputs[2].style.display = 'none';
            }
            // If advanceLoan is checked, hide monthly installment and repayment period
            repaymentPeriodInput.style.display = 'none';
            monthlyInstallmentInput.style.display = 'none';
        }
    }

    //calculate monthly installment and update input in real time
    function calculateMonthlyInstallment() {
        const amount = parseFloat(document.getElementById('amount').value);
        const repaymentPeriod = parseInt(document.getElementById('repaymentPeriod').value);
        const monthlyInstallmentInput = document.getElementById('monthlyInstallment');

        if (!isNaN(amount) && !isNaN(repaymentPeriod) && repaymentPeriod > 0) {
            const monthlyInstallment = amount / repaymentPeriod;
            monthlyInstallmentInput.value = monthlyInstallment.toFixed(2);
        } else {
            monthlyInstallmentInput.value = '';
        }
    }

    // Function to update loan details on page refresh
    function updateLoanDetailsFromLocalStorage() {
        document.getElementById('amount').value = loanFormData.loanDetails.loan_amount;
        document.getElementById('advanceLoan').checked = loanFormData.loanDetails.loanType.advanceLoan;
        document.getElementById('normalLoan').checked = loanFormData.loanDetails.loanType.normalLoan;
        document.getElementById('repaymentPeriod').value = loanFormData.loanDetails.repayment_period;
        document.getElementById('monthlyInstallment').value = loanFormData.loanDetails.monthly_installment;
        document.getElementById('loanPurpose').value = loanFormData.loanDetails.loan_purpose;

        // Check if advanceLoan is true, then hide the showIfNormalLoan div
        const showIfNormalLoanDivs = document.querySelectorAll('.showIfNormalLoan');

        showIfNormalLoanDivs.forEach(function (showIfNormalLoanDiv) {
            if (loanFormData.loanDetails.loanType.advanceLoan) {
                showIfNormalLoanDiv.style.display = 'none';
            } else {
                showIfNormalLoanDiv.style.display = 'block';
            }
        });
    }

    // Function to update loanDetails in real-time
    function updateLoanDetails() {
        // Get the loan amount from the input field
        const loanAmount = document.getElementById('amount').value.trim();
    
        // Get the "Save and Continue" button element
        const saveButton = document.getElementById('dissableIfLoanAmountNotLegible');
    
        // Make a GET request to check if the loan amount exceeds the maximum allowable
        fetch(`check_LoanAmountMax/${loanAmount}`)
            .then(response => response.json())
            .then(data => {
                if ('error' in data) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: data.error,
                        footer: '<a href="#" id="explanationLink">Why do I see this?</a>'
                    }).then((result) => {
                        // Handle the click event on the link
                        if (result.isConfirmed) {
                            Swal.fire({
                                title: 'Explanation',
                                html: 'The maximum loan amount is four times the value of the shares saved. For instance, if a member has shares worth KES 10,000, they can borrow up to KES 40,000. It\'s important to note that this amount may vary based on other factors; however, it cannot exceed four times the shares saved.',
                                icon: 'info'
                            });
                        }
                    });
                    // Event delegation to handle the click outside the Swal callback
                    document.body.addEventListener('click', function(e) {
                        if (e.target && e.target.id === 'explanationLink') {
                            e.preventDefault();
                            Swal.fire({
                                title: 'Explanation',
                                html: 'The maximum loan amount is four times the value of the shares saved. For instance, if a member has shares worth KES 10,000, they can borrow up to KES 40,000. It\'s important to note that this amount may vary based on other factors; however, it cannot exceed four times the shares saved.',
                                icon: 'info'
                            });
                        }
                    });
                    
                    // Disable the "Save and Continue" button and apply custom styles
                    saveButton.disabled = true;
                    saveButton.style.pointerEvents = "none";
                    saveButton.style.opacity = "0.2";
                    saveButton.style.color = "#ddd";
                } else {
                    // Update loanFormData only if the loan amount is within the allowable range
                    loanFormData.loanDetails = {
                        loan_amount: loanAmount,
                        loanType: {
                            advanceLoan: document.getElementById('advanceLoan').checked,
                            normalLoan: document.getElementById('normalLoan').checked
                        },
                        repayment_period: document.getElementById('repaymentPeriod').value.trim(),
                        monthly_installment: document.getElementById('monthlyInstallment').value.trim(),
                        loan_purpose: document.getElementById('loanPurpose').value.trim()
                    };
    
                    // Update local storage and loan form data
                    updateLoanFormData();
    
                    // Enable the "Save and Continue" button and reset styles
                    saveButton.disabled = false;
                    saveButton.style.pointerEvents = "auto";
                    saveButton.style.opacity = "1";
                    saveButton.style.color = ""; 
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    
    // Function to update guarantors table based on the current guarantors array
    function updateGuarantorsTable() {
        const tableBody = document.getElementById('loanGuarantorsList');

        // Clear existing rows
        tableBody.innerHTML = '';

        // Populate table with current guarantors array
        loanFormData.guarantors.map((guarantor, index) => {
            const newRow = tableBody.insertRow();

            if (guarantor.is_self_guarantorship) {
                // If the guarantor is self-guarantor, set the verification status to "All set"
                newRow.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${guarantor.full_name}</td>
                    <td>${guarantor.member_number}</td>
                    <td>${guarantor.id_number}</td>
                    <td>${guarantor.phone_number}</td>
                    <td style="color:darkgreen;font-weight:bold;">Self Guaranteed</td>
                    <td><i class="fa fa-trash delete-button"></i></td>
                `;
            } else {
                const verificationStatus = guarantor.verified ? 'Verified' : 'Pending Acceptance';
                newRow.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${guarantor.full_name}</td>
                    <td>${guarantor.member_number}</td>
                    <td>${guarantor.id_number}</td>
                    <td>${guarantor.phone_number}</td>
                    <td class="pending-acceptance">
                        <p>${verificationStatus}${guarantor.verified ? ' <i class="fa fa-check-square" aria-hidden="true"></i>' : ''}</p>
                        ${!guarantor.verified ? `<strong data-guarantor-id="${guarantor.id_number}" id="verificationButton" data-guarantor-status="guarantor-verification" class="guarantor-acceptance">Verify <i class="fa fa-check-square" aria-hidden="true"></i></strong>` : ''}
                    </td>
                    <td><i class="fa fa-trash delete-button"></i></td>
                `;

                // Add event listener to the verification button in the new row
                if (!guarantor.verified) {
                    var verificationButton = newRow.querySelector('#verificationButton');
                    verificationButton.addEventListener('click', function () {
                        
                        // Retrieve the data attribute value
                        const guarantorIdNumber = verificationButton.dataset.guarantorId;

                        // Make an AJAX request to generate the verification code
                        fetch('generate_guarantorship_verification_code/', {
                            method: 'POST',  
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken'),  
                            },
                            body: JSON.stringify({
                                guarantorIdNumber: guarantorIdNumber,  
                            }),
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'success') {
                                // Pass the generated verification code to the showVerificationInput function
                                showVerificationInput(guarantor.email, newRow, index, data.verification_code);
                            } else {
                                console.error('Error generating verification code');
                            }
                        });
                        

                    });
                }
            }

            // Add event listener to the delete button in the new row
            var deleteButton = newRow.querySelector('.delete-button');
            deleteButton.addEventListener('click', function () {
                deleteRow(newRow.rowIndex);
            });
        });
    }

    // Function to show SweetAlert input for verification code
    function showVerificationInput(guarantorEmail, row, index) {
        Swal.fire({
            title: 'Enter Verification Code',
            input: 'text',
            inputPlaceholder: 'Enter the 6-digit code sent to your guarantor\'s email',
            showCancelButton: true,
            confirmButtonText: 'Verify',
            cancelButtonText: 'Cancel',
            preConfirm: (code) => {
                // Handle the entered code (you can add verification logic here)
                if (code && code.length === 6) {
                    
                    // Send Ajax request to Django backend for verification
                    $.ajax({
                        url: 'verify_mail_sms_code/', // Update the URL to match your Django view
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken'),
                        },
                        data: JSON.stringify({
                            code: code,
                        }),
                        contentType: 'application/json',
                        success: function (data) {
                            console.log('Received data:', data);
                        
                            if (data.status === 'success' && data.is_valid) {
                                if (data.is_picked) {
                                    // Code has already been picked
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Code Already Used',
                                        text: 'The verification code has already been used. Please try sending another one.',
                                    });
                                } else if (!data.is_expired) {
                                    // Code is valid and not expired
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Verification Successful',
                                        text: 'The guarantor has been successfully verified!',
                                    });
                        
                                    // Update the guarantor status to verified
                                    loanFormData.guarantors[index].verified = true;
                                    // Update the guarantor status to "Guaranteed Accepted"
                                    loanFormData.guarantors[index].status = "Guaranteed Accepted";
                        
                                    // Update the table cell content
                                    const statusCell = row.querySelector('.pending-acceptance');
                                    statusCell.innerHTML = `
                                        <p class="guarantor-accepted">Verified <i class="fa fa-check-square" aria-hidden="true"></i></p>
                                    `;
                        
                                    // Update local storage and loan form data
                                    updateLoanFormData();
                                } else {
                                    // Code is expired
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Expired Code',
                                        text: 'The verification code has expired. Please try sending another one.',
                                    });
                                }
                            } else {
                                // Code is invalid
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Invalid Code',
                                    text: 'Please enter a valid 6-digit code.',
                                });
                            }
                        },
                        
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid Code',
                        text: 'Please enter a valid 6-digit code.',
                    });
                }
            },
        });
    }

    // ////////**delete row index
    function deleteRow(rowIndex) {
        var table = document.getElementById("guarantersTable");

        // Remove the guarantor from the array
        const deletedGuarantor = loanFormData.guarantors.splice(rowIndex - 1, 1)[0];

        // Delete the row from the table
        table.deleteRow(rowIndex);

        // Update the index in the remaining data rows
        for (var i = rowIndex - 1; i < table.rows.length; i++) {
            if (table.rows[i].cells[0]) { // Check if the cell exists (for data rows)
                table.rows[i].cells[0].innerHTML = i + 1;
            }

        }

        // Update the guarantors table based on the current guarantors array
        updateGuarantorsTable();

        // Update local storage and loan form data
        updateLoanFormData();
    }

    // Function to validate form submission
    function validateFormSubmission() {
        const loanDetailsKeys = Object.keys(loanFormData.loanDetails);

        for (const key of loanDetailsKeys) {
            const value = loanFormData.loanDetails[key];
            if (value && typeof value === 'string') {
                loanFormData.loanDetails[key] = value.trim();
            }
            // Add any other validation logic as needed
        }

        // Check if the agreement is not checked
        if (!loanFormData.declaration) {
            Swal.fire({
                title: 'Error',
                text: 'You must agree to the loan declaration before submitting the loan application',
                icon: 'error',
                confirmButtonText: 'OK',
            });
            return false;
        } 

        // All validations passed
        return true;

    };  
    
    // Add a variable to track submission status
    let isSubmissionInProgress = false;

    // Function to submit loan application data to the server
    function submitLoanApplication(formData) {
        // Check if submission is already in progress
        if (isSubmissionInProgress) {
            return;
        }

        // Set submission in progress
        isSubmissionInProgress = true;

        // Use SweetAlert for confirmation
        Swal.fire({
            title: 'Confirm Loan Submission',
            text: 'Are you sure you want to submit the loan application?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, submit it!'
        })
        .then((result) => {
            if (result.isConfirmed) {
                // Assuming you have a Django server endpoint to handle loan applications
                fetch('handle_loan_submission', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: JSON.stringify(formData),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Server response:', data);

                    if (data.error) {
                        // Handle specific error conditions
                        if (data.error === "User already has a pending loan application. Please wait for approval.") {
                            // Show Swal alert for a specific error condition
                            Swal.fire({
                                icon: "error",
                                title: "Loan Submission Failed!",
                                text: "You already have a pending loan application. Please wait for approval. If there is a delay, you may contact the administrator for assistance.",
                            });
                        } else if (data.error === "User already has a disbursed loan. Cannot submit a new loan.") {
                            // Show Swal alert for another specific error condition
                            Swal.fire({
                                icon: "error",
                                title: "Loan Submission Failed!",
                                text: "You already have a disbursed loan. Cannot submit a new loan. Please repay your existing loan before applying for a new one.",
                            });
                        } else {
                            // Generic error message
                            Swal.fire({
                                icon: "error",
                                title: "Loan Submission Failed!",
                                text: "There was an error while submitting the loan application. Please try again.",
                            });
                        }
                    } else {
                        // After successful submission, reset the form and remove data from local storage
                        deleteLoanFormData();

                        // Optionally, clear the entire local storage
                        clearLocalStorage();

                        // Show SweetAlert notification on successful submission
                        Swal.fire({
                            title: 'Loan Application Submitted!',
                            text: 'Your loan application has been submitted successfully.',
                            icon: 'success',
                        })
                        .then(() => {
                            // Move the location.reload() inside this .then() block
                            window.location.reload();
                        });
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Loan Submission Failed!",
                        text: "There was an error while submitting the loan application. Please try again.",
                    });
                })
                .finally(() => {
                    // Reset submission status
                    isSubmissionInProgress = false;
                });
            } else {
                // Reset submission status if the user cancels
                isSubmissionInProgress = false;
            }
        });
    }

    // custom csrf
    function getCookie(name) {
        const cookieName = name + "=";
        const decodedCookies = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookies.split(';');

        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i].trim();
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length);
            }
        }
        return null;
    }  


});    



// HANDLE ADVANCE LOAN REPAYMENT PROCESS
document.addEventListener('DOMContentLoaded', function () {
    // Select all elements with the class "loan_repay"
    const repayNowButtons = document.querySelectorAll('.loan_repay');

    // Click event listener to each "Repay Now" button
    repayNowButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            // Prevent default link behavior
            event.preventDefault();

            // Get the IDs and data attribute values
            const loanId = this.dataset.loanId;
            const borrowedAmount = parseFloat(document.getElementById(`borrowedAmount_${loanId}`).innerText);
            const interestRate = 0.05;
            const amountToBePaid = parseFloat(document.getElementById(`amountToRepay_${loanId}`).innerText);

            // Function to prompt user for partial repayment amount
            function promptForPartialRepayment() {
                Swal.fire({
                    title: `Enter Partial Repayment Amount`,
                    input: 'number',
                    inputAttributes: {
                        step: '0.01',
                        min: '0.01',
                        max: borrowedAmount 
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Repay',
                    cancelButtonText: 'Cancel',
                    icon: 'question',
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'swal-button-partial-repay',
                        cancelButton: 'swal-button-cancel'
                    }
                }).then((partialResult) => {
                    if (partialResult.isConfirmed) {
                        const partialAmount = parseFloat(partialResult.value);
                        if (partialAmount > 0 && partialAmount <= amountToBePaid) {
                            Swal.fire({
                                title: `Confirm Partial Repayment`,
                                html: `Are you sure you want to partially repay advance loan <strong>${loanId}</strong> with amount <strong>${partialAmount}</strong>?<br>Outstanding Loan Principal: <strong>${borrowedAmount - (partialAmount  - (borrowedAmount * interestRate))}</strong><br>.Outstanding Loan Interest: <strong>${(borrowedAmount - (partialAmount  - (borrowedAmount * interestRate))) * 0.05}</strong><br>Outstanding Amount To Repay: <strong>${(borrowedAmount - (partialAmount  - (borrowedAmount * interestRate))) + ((borrowedAmount - (partialAmount  - (borrowedAmount * interestRate))) * 0.05)}</strong>`,
                                icon: 'question',
                                showCancelButton: true,
                                confirmButtonText: 'Yes',
                                cancelButtonText: 'No',
                                buttonsStyling: false,
                                customClass: {
                                    confirmButton: 'swal-button-partial-repay',
                                    cancelButton: 'swal-button-cancel'
                                }
                            }).then((confirmResult) => {
                                if (confirmResult.isConfirmed) {

                                    // Inside the success callback of Swal.fire for full repayment
                                    fetch('advanceLoan_repayment/', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'X-CSRFToken': getCookie('csrftoken'), 
                                        },
                                        body: JSON.stringify({
                                            loan_id: loanId,
                                            full_amount: partialAmount,
                                        }),
                                    })
                                    .then(response => response.json())
                                    .then(data => {

                                        if (data.status === 'success') {

                                            showOverlay();
                                            Swal.fire({
                                                title: 'Request Submitted',
                                                text: 'A request to partially repay your advance loan has been successfully submitted and is in review.',
                                                icon: 'success',
                                                buttonsStyling: false,
                                                customClass: {
                                                    confirmButton: 'swal-button-partial-repay',
                                                }
                                            }).then(() => {
                                                hideOverlay();
                                                location.reload()
                                            });

                                        } else if (data.status === 'Loan not found') {

                                            // Handle loan not found error
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Loan Not Found',
                                                text: 'The loan ID provided does not exist. Please check the loan ID and try again.'
                                            });
                                            return false;

                                        } else {
                                            // Handle fetch errors
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Error',
                                                text: 'An error occurred while processing your request. Please try again.'
                                            });
                                            return false;
                                        }

                                    })
                                    .catch(error => {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error',
                                            text: 'An error occurred while processing your request. Please try again.'
                                        });
                                        return false;
                                    });

                                }
                            });
                        } else {
                            // If the entered partial amount is not within the valid range, prompt again
                            Swal.fire({
                                title: 'Invalid Amount',
                                text: `Please enter a valid partial repayment amount between 0.01 and ${borrowedAmount}.`,
                                icon: 'error',
                                buttonsStyling: false,
                                customClass: {
                                    confirmButton: 'swal-button-partial-repay',
                                }
                            }).then(() => {
                                promptForPartialRepayment(); // Prompt again
                            });
                        }
                    }
                });
            }

            // Function to show overlay
            function showOverlay() {
                const overlay = document.createElement('div');
                overlay.classList.add('overlay');
                document.body.appendChild(overlay);
            }

            // Function to hide overlay
            function hideOverlay() {
                const overlay = document.querySelector('.overlay');
                if (overlay) {
                    document.body.removeChild(overlay);
                }
            }

            // Show SweetAlert prompt for full or partial repayment
            Swal.fire({
                title: 'Repayment Options',
                text: 'Do you want to fully repay or partially repay the loan?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Fully Repay',
                cancelButtonText: 'Partially Repay',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'swal-button-full-repay',
                    cancelButton: 'swal-button-partial-repay'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Fully repay the loan
                    Swal.fire({
                        title: `Confirm Full Repayment`,
                        html: `Are you sure you want to fully repay advance loan <strong>${loanId}</strong> with amount <strong>${amountToBePaid}</strong> ?`,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No',
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'swal-button-partial-repay',
                            cancelButton: 'swal-button-cancel'
                        }
                    }).then((confirmResult) => {
                        if (confirmResult.isConfirmed) {

                            // Inside the success callback of Swal.fire for full repayment
                            fetch('advanceLoan_repayment/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRFToken': getCookie('csrftoken'), 
                                },
                                body: JSON.stringify({
                                    loan_id: loanId,
                                    full_amount: amountToBePaid,
                                }),
                            })
                            .then(response => response.json())
                            .then(data => {

                                if (data.status === 'success') {

                                    showOverlay();
                                    Swal.fire({
                                        title: 'Request Submitted',
                                        text: 'A request to fully repay your advance loan has been successfully submitted and is in review.',
                                        icon: 'success',
                                        buttonsStyling: false,
                                        customClass: {
                                            confirmButton: 'swal-button-partial-repay',
                                        }
                                    }).then(() => {
                                        hideOverlay();
                                        location.reload()
                                    });

                                } else if (data.status === 'Loan not found') {

                                    // Handle loan not found error
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Loan Not Found',
                                        text: 'The loan ID provided does not exist. Please check the loan ID and try again.'
                                    });
                                    return false;

                                } else {
                                    // Handle fetch errors
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error',
                                        text: 'An error occurred while processing your request. Please try again.'
                                    });
                                    return false;
                                }

                            })
                            .catch(error => {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'An error occurred while processing your request. Please try again.'
                                });
                                return false;
                            });

                        }
                    });
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    // Partially repay the loan
                    promptForPartialRepayment(); // Initial prompt for partial repayment
                }
            });
        });
    });

    // custom csrf
    function getCookie(name) {
        const cookieName = name + "=";
        const decodedCookies = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookies.split(';');

        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i].trim();
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length);
            }
        }
        return null;
    }  

});


    
// WELFARE LOAN REPAYMENT
document.addEventListener('DOMContentLoaded', function () {



});


