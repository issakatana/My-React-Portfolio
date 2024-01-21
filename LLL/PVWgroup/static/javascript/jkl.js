
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

    // Function to update supportDocuments in real-time
    function updateSupportDocuments() {
        const supportDocumentsInput = document.getElementById('supportDocuments_la');
        loanFormData.support_documents = Array.from(supportDocumentsInput.files).map(file => file.name.trim());
    }

    

   
   

   

    // Function to format field name for better user experience
    function formatFieldName(fieldName) {
        // Example: Convert 'account_name' to 'Account Name'
        return fieldName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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



     

        // Check for empty member details
        const emptypersonalDetailKey = Object.keys(loanFormData.personalDetails).find(key => {
            const value = loanFormData.personalDetails[key];
            return typeof value === 'string' && value.trim() === '';
        });

        if (emptypersonalDetailKey) {
            Swal.fire({
                title: 'Error',
                text: `${formatFieldName(emptypersonalDetailKey)} field cannot be empty`,
                icon: 'error',
                confirmButtonText: 'OK',
            });
            return false;
        }
    
        // Check if the loan type is selected
        if (!(loanFormData.loanDetails.loanType.advanceLoan ^ loanFormData.loanDetails.loanType.normalLoan)) {
            Swal.fire({
                title: 'Error',
                text: 'Please select the type of loan you are applying for.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
            return false;
        }

        // Check for empty loan details excluding loanType
        const emptyLoanDetailKey = Object.keys(loanFormData.loanDetails).find(key => {
            if (key === 'loanType') {
                return false;
            }

            // Skip checking monthly installment and repayment period for advance loan
            if (loanFormData.loanDetails.loanType.advanceLoan) {
                if (key === 'monthly_installment' || key === 'repayment_period') {
                    return false;
                }
            }

            if (key === 'loan_amount' && parseFloat(loanFormData.loanDetails[key]) <= 0) {
                return true;
            }

            if (typeof loanFormData.loanDetails[key] === 'object') {
                return Object.values(loanFormData.loanDetails[key]).some(value => value === true);
            } else {
                return typeof loanFormData.loanDetails[key] === 'string' && loanFormData.loanDetails[key].trim() === '';
            }
        });

        // Check if loan_amount is zero or negative
        if (emptyLoanDetailKey === 'loan_amount') {
            Swal.fire({
                title: 'Error',
                text: 'Loan amount must be greater than zero.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
            return false;
        }

        if (emptyLoanDetailKey) {
            Swal.fire({
                title: 'Error',
                text: `${formatFieldName(emptyLoanDetailKey)} field cannot be empty`,
                icon: 'error',
                confirmButtonText: 'OK',
            });
            return false;
        }

       

        

        // All validations passed
        return true;
    }


// Function to submit loan application data to the server
function submitLoanApplication(formData) {
    // Assuming you have a Django server endpoint to handle loan applications
    fetch('handle_loan_submission', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(formData),
    })
    .then(response => {
        if (!response.ok) {
            // If the response status is not okay (e.g., 400 Bad Request), throw an error
            throw new Error('Bad Request');
        }
        return response.json();
    })
    .then(data => {
        console.log('Server response:', data);

        // After successful submission, reset the form and remove data from local storage
        deleteLoanFormData();

        // Optionally, clear the entire local storage
        clearLocalStorage();

        // Delay the form reset for 2 seconds (adjust the time as needed)
        // setTimeout(function() {
        //     resetForm();
        // }, 2000);

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
    })
    .catch(error => {
        console.error("Error:", error);

        // Check if the error message is 'Bad Request'
        if (error.message === 'Bad Request') {
            Swal.fire({
                icon: "error",
                title: "Loan Submission Failed!",
                text: "There was an error in your loan application. Please check the provided information and try again.",
            });
        } else if (error.response && error.response.status === 400 && error.response.data.error === 'You already have an active salary advance loan') {
            // Display a custom Swal alert for the specific error scenario
            Swal.fire({
                icon: "error",
                title: "Loan Submission Failed!",
                text: "You already have an active salary advance loan. You cannot apply for another one.",
            });
        } else {
            // For other errors, display a generic error message
            Swal.fire({
                icon: "error",
                title: "Loan Submission Failed!",
                text: "There was an error while submitting the loan application. Please try again.",
            });
        }
    });
}


    
   



   







    //Attach support documents in real time to the loan form data object
    document.getElementById('supportDocuments_la').addEventListener('change', function () {
        updateSupportDocuments();
    });

 

    

    




    

    // Update loan details based on local storage value on page refresh
    updateLoanDetailsFromLocalStorage()


    
    


   
});