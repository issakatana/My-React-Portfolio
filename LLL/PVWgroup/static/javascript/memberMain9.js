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



// SUBMIT BENEVOLENT CLAIM DATA
document.addEventListener('DOMContentLoaded', function () {
    const deceasedInformationPopupContent = document.getElementById('deceasedInformationPopupContent');
    const overlaydi = document.getElementById('overlaydi');
    const deceasedInformationList = document.getElementById('deceasedInformationList');


    let currentSectiondi = 0;
    let sectionsdi = [];
   
    // Form data object
    const formData = {
        memberDetails: {},
        deceasedInformation: {
            deceasedChecked: [] 
        },
        bankDetails: {},
        memberDeclaration: {}
    };

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

    document.getElementById('popupCloseButtondi').addEventListener('click', function () {
        overlaydi.style.display = 'none';
        window.location.reload();
    });

    document.getElementById('popupCloseButtondi2').addEventListener('click', function () {
        overlaydi.style.display = 'none';
        window.location.reload();
    });

     // Check for existing data in localStorage
     const storedData = localStorage.getItem('deceasedChecked');
     if (storedData) {
         // Parse the stored data and update the formData
         formData.deceasedInformation.deceasedChecked = JSON.parse(storedData);
 
         // Add rows to the deceasedInformationList
         formData.deceasedInformation.deceasedChecked.forEach(rowData => {
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
                                            updateLocalStorage();
                                        },
                                        error: function () {
                                            console.log('Update failed');
                                        }
                                    });

                                    formData.deceasedInformation.deceasedChecked.push({
                                        isChecked,
                                        deceasedId,
                                        dateofbirth: dateOfBirth,
                                        dateofdeath: dateOfDeath,
                                        ...deceasedRowData
                                    });
                                } else {
                                    // Checkbox is unchecked, remove data from selectedDeceasedRows
                                    const index = formData.deceasedInformation.deceasedChecked.findIndex(item => item.dependantidnumber === deceasedId);
                                    if (index !== -1) {
                                        formData.deceasedInformation.deceasedChecked.splice(index, 1);
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
                                            updateLocalStorage();
                                        },
                                        error: function () {
                                            console.log('Revert failed');
                                        }
                                    });
                                }
                            });
                        });

                        // Function to update local storage
                        function updateLocalStorage() {
                            localStorage.setItem('deceasedChecked', JSON.stringify(formData.deceasedInformation.deceasedChecked));
                        }
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
            formData.deceasedInformation.deceasedChecked = formData.deceasedInformation.deceasedChecked.filter(rowData => {
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
                const index = formData.deceasedInformation.deceasedChecked.findIndex(item => item.dependantidnumber === rowData.dependantidnumber);
                if (index !== -1) {
                    formData.deceasedInformation.deceasedChecked.splice(index, 1);
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
            localStorage.setItem('deceasedChecked', JSON.stringify(formData.deceasedInformation.deceasedChecked));
    
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
    
    function handleSubmission() {
        event.preventDefault();
    
        // Check if the clicked element has the correct ID
        if (event.target.id === 'benevolentClaimSubmitButton') {
    
            // Check if at least one dependant is selected
            if (formData.deceasedInformation.deceasedChecked.length === 0) {
                Swal.fire({
                    title: 'Deceased Information Required',
                    text: 'Please select at least one dependant.',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                });
                return; // Stop the form submission
            }
    
            // Populate the form data object with  member details values
            formData.memberDetails = {
                full_name: document.getElementById('full_name').value,
                id_number: document.getElementById('id_number').value,
                phone_number: document.getElementById('phone_number').value,
                position: document.getElementById('position').value,
                residence: document.getElementById('residence').value,
            };
    
            // Check for empty member details
            const emptyMemberDetailKey = Object.keys(formData.memberDetails).find(key => formData.memberDetails[key].trim() === '');
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
            formData.bankDetails = {
                account_name: document.getElementById('account_name').value,
                account_number: document.getElementById('account_number').value,
                bank: document.getElementById('bank').value,
                branch: document.getElementById('branch').value,
            };
    
            // Check for empty bank details
            const emptyBankDetailKey = Object.keys(formData.bankDetails).find(key => formData.bankDetails[key].trim() === '');
            if (emptyBankDetailKey) {
                Swal.fire({
                    title: 'Error',
                    text: `${formatFieldName(emptyBankDetailKey)} field cannot be empty`,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
                return;
            }
            
            formData.memberDeclaration = {
                agreement: document.querySelector('input[name="agreement"]:checked') ? true : false,
            };
    
            // Check if the agreement is not checked
            if (!formData.memberDeclaration.agreement) {
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
                        body: JSON.stringify(formData),
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Handle the response from the server, if needed
                        console.log('Server Response:', data);
                        if (data.success) {
                            // Clear the form input fields excluding member details
                            document.getElementById('account_name').value = '';
                            document.getElementById('account_number').value = '';
                            document.getElementById('bank').value = '';
                            document.getElementById('branch').value = '';
                            document.querySelector('input[name="agreement"]:checked').checked = false;
                            // Clear any other fields as needed

                            // Clear the deceased information table
                            document.getElementById('deceasedInformationList').innerHTML = '';

                            // Clear the local storage for deceasedChecked
                            localStorage.removeItem('deceasedChecked');
        
                            // Show a SweetAlert
                            Swal.fire({
                                title: 'Success!',
                                text: 'Benevolent Claim submitted successfully and is in review.',
                                icon: 'success',
                                confirmButtonText: 'OK',
                            }).then(() => {
                            location.reload();
                            });;
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
        const dependantNames = formData.deceasedInformation.deceasedChecked.map(deceased => deceased.nameofdependant);
        
        if (dependantNames.length === 0) {
            return '';
        } else if (dependantNames.length === 1) {
            return dependantNames[0];
        } else {
            const lastDependant = dependantNames.pop(); 
            return dependantNames.join(', ') + ' and ' + lastDependant;
        }
    }
    
});    



// SHARES TRANSFER
document.addEventListener('DOMContentLoaded', function () {
    const formData = new FormData();


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
                            if (data.error === 'Recipient user does not exist') {
                                Swal.fire({
                                    title: 'Error',
                                    text: 'Recipient user does not exist',
                                    icon: 'error',
                                });
                            } else {
                                Swal.showValidationMessage(`Incorrect PIN`);
                            }
                            return false;
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        Swal.fire({
                            title: 'Error',
                            text: 'Error checking PIN',
                            icon: 'error',
                        });
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // PIN is correct, ask for confirmation
                    const formData1 = new FormData1();
                    formData1.append('membernumberst', document.getElementById('membernumberst').value);
                    formData1.append('shareAmountToTransfer', document.getElementById('shareAmountToTransfer').value);
                    formData1.append('transferReason', document.getElementById('transferReason').value);

                    Swal.fire({
                        title: 'Confirmation',
                        html: `${result.value}`,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, submit',
                        cancelButtonText: 'Cancel',
                    }).then((confirmationResult) => {
                        if (confirmationResult.isConfirmed) {
                            // Add your AJAX request or form submission logic here
                    
                            fetch('/membersPortal/transfer_shares', {
                                method: 'POST',
                                headers: {
                                    'X-CSRFToken': getCookie('csrftoken')
                                },
                                body: JSON.stringify({ formData1 }),
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
                                        window.location.href = '{% url "dashboard" %}';
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






// const formData = new FormData();
        // formData.append('membernumberba', document.querySelector('#memberNumberba').value);
        // formData.append('shareAmountToTransafer', document.querySelector('#shareAmountToTransafer').value);
        // formData.append('blockReason', document.querySelector('#blockReason').value);

      