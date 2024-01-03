

// <script>
// // Initialize loanFormData object
// const loanFormData = {
//     personalDetails: {
//         fullname: '{{ full_name }}',
//         position: '{{ member_position }}',
//         idnumber: '{{ member_idno }}',
//         phonenumber: '{{ phone_number }}',
//         residence: '{{ residence }}'
//     },
//     loanDetails: {
//         amount: 0,
//         loanType: {
//             advanceLoan: false,
//             normalLoan: false
//         },
//         repaymentPeriod: "",
//         monthlyInstallment: "",
//         loanPurpose: ""
//     },
//     guarantors: [],
//     declaration: false
// };
// // Function to set initial values from Django context
// function setInitialValues() {
//     document.getElementById('fullname').value = loanFormData.personalDetails.fullname;
//     document.getElementById('position').value = loanFormData.personalDetails.position;
//     document.getElementById('idnumber').value = loanFormData.personalDetails.idnumber;
//     document.getElementById('phonenumber').value = loanFormData.personalDetails.phonenumber;
//     document.getElementById('residence').value = loanFormData.personalDetails.residence;
// }
// // Function to load data from localStorage
// function loadFromLocalStorage() {
//     const storedData = localStorage.getItem('loanFormData');
//     if (storedData) {
//         const parsedData = JSON.parse(storedData);
//         // Update form fields with stored data
//         updateFormField('amount', parsedData.loanDetails.amount);
//         updateFormField('advanceLoan', parsedData.loanDetails.loanType.advanceLoan);
//         updateFormField('normalLoan', parsedData.loanDetails.loanType.normalLoan);
//         updateFormField('repaymentPeriod', parsedData.loanDetails.repaymentPeriod);
//         updateFormField('monthlyInstallment', parsedData.loanDetails.monthlyInstallment);
//         updateFormField('loanPurpose', parsedData.loanDetails.loanPurpose);
//         // Load guarantors data
//         rowIndexCounter = parsedData.guarantorMemberNumbers.length + 1;
//         const tableBody = document.getElementById('loanGuarantorsList');
//         tableBody.innerHTML = ''; // Clear existing rows
//         parsedData.guarantorMemberNumbers.forEach((memberNumber, index) => {
//             // You may need to make an AJAX call here to get guarantor info similar to the addGuarantor event listener
//             // For simplicity, I'm just adding a placeholder row
//             const newRow = tableBody.insertRow();
//             newRow.innerHTML = `<td>${index + 1}</td>
//                                 <td>Guarantor Name</td>
//                                 <td>Guarantor ID</td>
//                                 <td>Guarantor Phone</td>
//                                 <td class="pending-acceptance">Pending Acceptance</td>
//                                 <td><i class="fa fa-trash delete-button" onclick="deleteRow(${newRow.rowIndex})"></i></td>`;
//         });
//         // Update declaration checkbox
//         updateFormField('agreement', parsedData.declaration);
//     }
// }
// // Function to update a form field based on its type
// function updateFormField(fieldName, value) {
//     const field = document.getElementById(fieldName);
//     if (field.type === 'checkbox') {
//         loanFormData.loanDetails[fieldName] = field.checked = value;
//     } else {
//         loanFormData.loanDetails[fieldName] = field.value = value;
//     }
//     // Save the updated data to localStorage
//     saveToLocalStorage();
// }
// // Event listener for the amount input field
// document.getElementById('amount').addEventListener('input', function () {
//     const enteredAmount = parseFloat(this.value) || 0;
//     loanFormData.loanDetails.amount = enteredAmount;
//     saveToLocalStorage();
// });
// // Event listener for loan type checkboxes
// document.getElementById('advanceLoan').addEventListener('change', function () {
//   loanFormData.loanDetails.loanType.advanceLoan = this.checked;
//   if (this.checked) {
//     loanFormData.loanDetails.loanType.normalLoan = false;
//     document.getElementById('normalLoan').checked = false; 
//     saveToLocalStorage();
//   }
// });
// document.getElementById('normalLoan').addEventListener('change', function () {
//   loanFormData.loanDetails.loanType.normalLoan = this.checked;
//   if (this.checked) {
//     loanFormData.loanDetails.loanType.advanceLoan = false;
//     document.getElementById('advanceLoan').checked = false;
//     saveToLocalStorage();
//   }
// });
// // Event listener for repaymentPeriod input field
// document.getElementById('repaymentPeriod').addEventListener('input', function () {
//   loanFormData.loanDetails.repaymentPeriod = this.value || 0;
//   saveToLocalStorage();
// });
// // Event listener for monthlyInstallment input field
// document.getElementById('monthlyInstallment').addEventListener('input', function () {
//   const enteredMonthlyInstallment = parseFloat(this.value) || 0;
//   loanFormData.loanDetails.monthlyInstallment = enteredMonthlyInstallment;
//   saveToLocalStorage();
// });
// // Event listener for loanPurpose textarea
// document.getElementById('loanPurpose').addEventListener('input', function () {
//   loanFormData.loanDetails.loanPurpose = this.value;
//   saveToLocalStorage();
// });
// // Initialize guarantors in loanFormData
// let rowIndexCounter = 1;
// loanFormData.guarantorMemberNumbers = [];
// document.getElementById('addGuarantor').addEventListener('click', function () {
//     const memberNumberInput = document.getElementById('guarantorMemberNumber');
//     const memberNumber = memberNumberInput.value.trim();
//     if (memberNumber) {
//         if (loanFormData.guarantorMemberNumbers.includes(memberNumber)) {
//             memberNumberInput.value = '';
//             Swal.fire({
//                 icon: "error",
//                 title: "Oops...",
//                 text: "You have already selected this member as a guarantor!",
//                 footer: '<a href="#">Why do I have this issue?</a>'
//             });
//             return;
//         }
//         const xhr = new XMLHttpRequest();
//         xhr.open('GET', `get_guarantor_info/${memberNumber}/`, true);
//         xhr.onload = function () {
//             if (xhr.status === 200) {
//                 const data = JSON.parse(xhr.responseText);
//                 memberNumberInput.value = '';
//                 const tableBody = document.getElementById('loanGuarantorsList');
//                 const newRow = tableBody.insertRow();
//                 newRow.innerHTML = `
//                     <td>${rowIndexCounter}</td>
//                     <td>${data.full_name}</td>
//                     <td>${data.id_number}</td>
//                     <td>${data.phone_number}</td>
//                     <td class="pending-acceptance">Pending Acceptance</td>
//                     <td><i class="fa fa-trash delete-button" onclick="deleteRow(${newRow.rowIndex})"></i></td>
//                 `;
//                 rowIndexCounter++;
//                 loanFormData.guarantorMemberNumbers.push(memberNumber);
//                 saveToLocalStorage();
//                 const style = document.createElement('style');
//                 style.innerHTML = `
//                     .delete-button {
//                         background-color: red;
//                         padding: 1vw;
//                         border: none;
//                         color: white;
//                         cursor: pointer;
//                     }
//                     .delete-button:hover {
//                         background-color: darkred;
//                     }
//                     .pending-acceptance {
//                         color: #8B0000; 
//                         font-weight: bold;
//                         font-size:1.2rem;
//                     }
//                 `;
//                 document.head.appendChild(style);
//                 Swal.fire({
//                     title: "Member Number found!",
//                     text: "A request has been sent to the guarantor, and it is pending their acceptance.",
//                     icon: "success"
//                 });
//             } else {
//                 memberNumberInput.value = '';
//                 Swal.fire({
//                     icon: "error",
//                     title: "Oops...",
//                     text: "Member number not found!",
//                     footer: '<a href="#">Why do I have this issue?</a>'
//                 });
//             }
//         };
//         xhr.onerror = function () {
//             console.error('Network error');
//         };
//         xhr.send();
//     }
// });
// function deleteRow(index) {
//     const deletedMemberNumber = loanFormData.guarantorMemberNumbers.splice(index - 1, 1)[0];
//     const tableBody = document.getElementById('loanGuarantorsList');
//     tableBody.deleteRow(index - 2);
//     const rows = tableBody.getElementsByTagName('tr');
//     for (let i = index - 1; i < rows.length; i++) {
//         const cells = rows[i].getElementsByTagName('td');
//         cells[0].textContent = i + 1;
//     }
//     rowIndexCounter = loanFormData.guarantorMemberNumbers.length + 1;
// }
// // Event listener for the declaration checkbox
// document.querySelector('input[name="agreement"]').addEventListener('change', function () {
//   loanFormData.declaration = this.checked;
//   saveToLocalStorage();
// });
// // Function to save data to localStorage
// function saveToLocalStorage() {
//     localStorage.setItem('loanFormData', JSON.stringify(loanFormData));
//     console.log('Saved to localStorage:', loanFormData);
// }
// // Call the loadFromLocalStorage function to populate the form with stored data
// loadFromLocalStorage();
// </script>



// <script>
// // const loanFormData = {
// //     personalDetails: {
// //         fullname: '{{ full_name }}',
// //         position: '{{ member_position }}',
// //         idnumber: '{{ member_idno }}',
// //         phonenumber: '{{ phone_number }}',
// //         residence: '{{ residence }}'
// //     },
// //     loanDetails: {
// //         amount: 0,
// //         loanType: {
// //         advanceLoan: false,
// //         normalLoan: false
// //         },
// //         repaymentPeriod: "",
// //         monthlyInstallment: "",
// //         loanPurpose: ""
// //     },
// //     guarantors: [],
// //     declaration: false
// // };

// // // Set initial values from Django context
// // document.getElementById('fullname').value = loanFormData.personalDetails.fullname;
// // document.getElementById('position').value = loanFormData.personalDetails.position;
// // document.getElementById('idnumber').value = loanFormData.personalDetails.idnumber;
// // document.getElementById('phonenumber').value = loanFormData.personalDetails.phonenumber;
// // document.getElementById('residence').value = loanFormData.personalDetails.residence;

// // // Event listener for the amount input field
// // document.getElementById('amount').addEventListener('input', function () {
// //   const enteredAmount = parseFloat(this.value) || 0;
// //   loanFormData.loanDetails.amount = enteredAmount;
// //   console.log('Updated loanFormData:', loanFormData);
// // });

// // // Event listener for loan type checkboxes
// // document.getElementById('advanceLoan').addEventListener('change', function () {
// //   loanFormData.loanDetails.loanType.advanceLoan = this.checked;
// //   if (this.checked) {
// //     loanFormData.loanDetails.loanType.normalLoan = false;
// //     document.getElementById('normalLoan').checked = false; 
// //   }
// //   console.log('Updated loanFormData:', loanFormData);
// // });
// // document.getElementById('normalLoan').addEventListener('change', function () {
// //   loanFormData.loanDetails.loanType.normalLoan = this.checked;
// //   if (this.checked) {
// //     loanFormData.loanDetails.loanType.advanceLoan = false;
// //     document.getElementById('advanceLoan').checked = false;
// //   }
// //   console.log('Updated loanFormData:', loanFormData);
// // });

// // // Event listener for repaymentPeriod input field
// // document.getElementById('repaymentPeriod').addEventListener('input', function () {
// //   loanFormData.loanDetails.repaymentPeriod = this.value || 0;
// //   console.log('Updated loanFormData:', loanFormData);
// // });

// // // Event listener for monthlyInstallment input field
// // document.getElementById('monthlyInstallment').addEventListener('input', function () {
// //   const enteredMonthlyInstallment = parseFloat(this.value) || 0;
// //   loanFormData.loanDetails.monthlyInstallment = enteredMonthlyInstallment;
// //   console.log('Updated loanFormData:', loanFormData);
// // });

// // // Event listener for loanPurpose textarea
// // document.getElementById('loanPurpose').addEventListener('input', function () {
// //   loanFormData.loanDetails.loanPurpose = this.value;
// //   console.log('Updated loanFormData:', loanFormData);
// // });

// // // Initialize guarantors in loanFormData
// // let rowIndexCounter = 1;
// // loanFormData.guarantorMemberNumbers = [];

// // document.getElementById('addGuarantor').addEventListener('click', function () {
// //     const memberNumberInput = document.getElementById('guarantorMemberNumber');
// //     const memberNumber = memberNumberInput.value.trim();

// //     if (memberNumber) {
// //         if (loanFormData.guarantorMemberNumbers.includes(memberNumber)) {
// //             memberNumberInput.value = '';
// //             Swal.fire({
// //                 icon: "error",
// //                 title: "Oops...",
// //                 text: "You have already selected this member as a guarantor!",
// //                 footer: '<a href="#">Why do I have this issue?</a>'
// //             });
// //             return;
// //         }

// //         const xhr = new XMLHttpRequest();
// //         xhr.open('GET', `get_guarantor_info/${memberNumber}/`, true);
// //         xhr.onload = function () {
// //             if (xhr.status === 200) {
// //                 const data = JSON.parse(xhr.responseText);
// //                 memberNumberInput.value = '';
// //                 const tableBody = document.getElementById('loanGuarantorsList');
// //                 const newRow = tableBody.insertRow();

// //                 newRow.innerHTML = `
// //                     <td>${rowIndexCounter}</td>
// //                     <td>${data.full_name}</td>
// //                     <td>${data.id_number}</td>
// //                     <td>${data.phone_number}</td>
// //                     <td class="pending-acceptance">Pending Acceptance</td>
// //                     <td><i class="fa fa-trash delete-button" onclick="deleteRow(${newRow.rowIndex})"></i></td>
// //                 `;

// //                 rowIndexCounter++;

// //                 loanFormData.guarantorMemberNumbers.push(memberNumber);

// //                 const style = document.createElement('style');
// //                 style.innerHTML = `
// //                     .delete-button {
// //                         background-color: red;
// //                         padding: 1vw;
// //                         border: none;
// //                         color: white;
// //                         cursor: pointer;
// //                     }
// //                     .delete-button:hover {
// //                         background-color: darkred;
// //                     }
// //                     .pending-acceptance {
// //                         color: #8B0000; 
// //                         font-weight: bold;
// //                         font-size:1.2rem;
// //                     }
// //                 `;
// //                 document.head.appendChild(style);

// //                 Swal.fire({
// //                     title: "Member Number found!",
// //                     text: "A request has been sent to the guarantor, and it is pending their acceptance.",
// //                     icon: "success"
// //                 });
// //             } else {
// //                 memberNumberInput.value = '';
// //                 Swal.fire({
// //                     icon: "error",
// //                     title: "Oops...",
// //                     text: "Member number not found!",
// //                     footer: '<a href="#">Why do I have this issue?</a>'
// //                 });
// //             }
// //         };
// //         xhr.onerror = function () {
// //             console.error('Network error');
// //         };
// //         xhr.send();
// //     }
// // });
// // function deleteRow(index) {
// //     const deletedMemberNumber = loanFormData.guarantorMemberNumbers.splice(index - 1, 1)[0];
// //     const tableBody = document.getElementById('loanGuarantorsList');
// //     tableBody.deleteRow(index - 2);
// //     const rows = tableBody.getElementsByTagName('tr');
// //     for (let i = index - 1; i < rows.length; i++) {
// //         const cells = rows[i].getElementsByTagName('td');
// //         cells[0].textContent = i + 1;
// //     }
// //     rowIndexCounter = loanFormData.guarantorMemberNumbers.length + 1;
// // }


// // // Event listener for the declaration checkbox
// // document.querySelector('input[name="agreement"]').addEventListener('change', function () {
// //   loanFormData.declaration = this.checked;
// //   console.log('Updated loanFormData:', loanFormData);
// // });



// // Fetch API to make an asynchronous GET request
// // document.getElementById('addGuarantor').addEventListener('click', function () {
// //     const memberNumberInput = document.getElementById('guarantorMemberNumber');
// //     const memberNumber = memberNumberInput.value.trim();

// //     if (memberNumber) {
// //         fetch(`get_guarantor_info/${memberNumber}/`)
// //             .then(response => {
// //                 if (!response.ok) {
// //                     throw new Error(`Error: ${response.status} ${response.statusText}`);
// //                 }
// //                 return response.json();
// //             })
// //             .then(data => {
// //                 memberNumberInput.value = '';
// //             })
// //             .catch(error => {
// //                 console.error('Error:', error.message);
// //             });
// //     }
// // });

// // Axios to make an asynchronous GET request
// // document.getElementById('addGuarantor').addEventListener('click', function () {
// //     const memberNumberInput = document.getElementById('guarantorMemberNumber');
// //     const memberNumber = memberNumberInput.value.trim();

// //     if (memberNumber) {
// //         axios.get(`get_guarantor_info/${memberNumber}/`)
// //             .then(response => {
// //                 memberNumberInput.value = '';
// //             })
// //             .catch(error => {
// //                 console.error('Error:', error);
// //             });
// //     }
// // });


// // function updateGuarantorsTable(guarantorName, guarantorIdNumber) {
// //     // Get the table body
// //     const tableBody = document.getElementById('loanGuarantorsList');

// //     // Create a new row
// //     const newRow = document.createElement('tr');
// //     newRow.innerHTML = `
// //         <td>${tableBody.children.length + 1}</td>
// //         <td>${guarantorName}</td>
// //         <td>${guarantorIdNumber}</td>
// //         <td>Telephone</td>
// //         <td>Signature</td>
// //         <td>Delete</td>
// //         <td>Blank</td>
// //     `;

// //     // Append the new row to the table
// //     tableBody.appendChild(newRow);
// // }

// </script>



// <script>

//     // toggle inputs based on loan checked
//     function uncheckOther(currentCheckbox) {
//     const advanceChecked = document.getElementById('advanceLoan');
//     const normalChecked = document.getElementById('normalLoan');
//     const checkboxes = [advanceChecked, normalChecked];
//     checkboxes.forEach(function (checkbox) {
//         if (checkbox !== currentCheckbox) {
//             checkbox.checked = false;
//         }
//     });

//     if (advanceChecked.checked) {
//         const showInputs = document.getElementsByClassName('showIfNormalLoan');
//         if (showInputs.length > 0) {
//             showInputs[0].style.display = 'none';
//             showInputs[1].style.display = 'none';
//             showInputs[2].style.display = 'none';
//         }
//     } else if (normalChecked.checked) {
//         const showInputs = document.getElementsByClassName('showIfNormalLoan');
//         if (showInputs.length > 0) {
//             showInputs[0].style.display = 'block';
//             showInputs[1].style.display = 'block';
//             showInputs[2].style.display = 'block';
//         }
//     } else {
//         const showInputs = document.getElementsByClassName('showIfNormalLoan');
//         if (showInputs.length > 0) {
//             showInputs[0].style.display = 'none';
//             showInputs[1].style.display = 'none';
//             showInputs[2].style.display = 'none';
//         }
//     }
// }


// document.addEventListener('DOMContentLoaded', function () {
//     let loanType = ''; // Initialize loanType variable
//     let principal = 0;
//     let interestRate = 0;
//     let interest = 0;
//     let amountToBePaid = 0;
//     let outstandingLoanAmount = 0;
//     let borrowedLoanAmount = 0;
//     let duration = 0;
//     let monthlyInstallment = 0;

//     // get real-time input data
//     const textInputs = document.querySelectorAll('.plain-text-input');
//     const checkboxInputs = document.querySelectorAll('.loan-checkbox');

//     checkboxInputs.forEach(function (checkbox) {
//         checkbox.addEventListener('change', function () {
//             loanType = checkbox.id; 
//             calculateLoan();
//             logAmount(); 
//         });
//     });

//     const amountInput = document.getElementById('amount');
//     amountInput.addEventListener('input', function () {
//         borrowedLoanAmount = amountInput.value;
//         calculateLoan(); 
//         logAmount(); 
//     });
//     const repaymentPeriodInput = document.getElementById('repaymentPeriod');
//     repaymentPeriodInput.addEventListener('input', function () {
//         duration = repaymentPeriodInput.value;
//         calculateLoan(); 
//         logAmount(); 
//     });
//     const monthlyInstallmentInput = document.getElementById('monthlyInstallment');
//     monthlyInstallmentInput.addEventListener('input', function () {
//         monthlyInstallment = monthlyInstallmentInput.value;
//         calculateLoan(); 
//         logAmount(); 
//     });
//     function calculateLoan() {
//         if (loanType === 'advanceLoan') {
//             principal = parseInt(borrowedLoanAmount, 10);
//             interestRate = 0.05;
//             interest = principal * interestRate;
//             amountToBePaid = outstandingLoanAmount = interest + principal;
//         } 
//     }
//     function logAmount() {
//     const amountToBePaidDiv = document.getElementById('amountToBePaid');
//         if (loanType !== 'advanceLoan' || (!borrowedLoanAmount || isNaN(amountToBePaid))) {
//             amountToBePaidDiv.style.display = 'none';
//         } else {
//             const formattedAmount = amountToBePaid.toLocaleString('en-US', {
//                 style: 'currency',
//                 currency: 'KES',
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2
//             });
//             amountToBePaidDiv.textContent = `Repayment Amount: ${formattedAmount}`;
//             amountToBePaidDiv.style.display = 'block'; 
//         }
//     }
// });

// </script>
// <script>
//     document.addEventListener('DOMContentLoaded', function () {
//     document.getElementById('loanSubmitFormButton').addEventListener('click', function () {
//         if (validateFormData()) {
//             sendFormData();
//             Swal.fire({
//                 title: "Loan Application Submitted",
//                 text: "Your loan application has been successfully submitted.",
//                 icon: "success"
//             });
//         }
//         // } else {
//         //     // Swal.fire({
//         //     //     icon: "error",
//         //     //     title: "Oops...",
//         //     //     text: "Failed to submit application!",
//         //     //     footer: '<a href="#">Why do I have this issue?</a>'
//         //     // });
//         // }
//     });
//     function validateFormData() {
//         if (loanFormData.loanDetails.amount <= 0) {
//             Swal.fire({
//                 icon: "error",
//                 title: "Oops...",
//                 text: "Loan amount must be greater than 0",
//                 footer: '<a href="#">Why do I have this issue?</a>'
//             });
//             return false;
//         }
//         if (loanFormData.loanDetails.loanType.advanceLoan === false && loanFormData.loanDetails.loanType.normalLoan === false ) {
//             Swal.fire({
//             icon: "error",
//             title: "Oops...",
//             text: "Please select the type of loan you are applying for.",
//             footer: '<a href="#">Why do I have this issue?</a>'
//             });
//         return false;
//         } 
//         if (loanFormData.declaration === false ) {
//             Swal.fire({
//                 icon: "error",
//                 title: "Oops...",
//                 text: "You are required to accept the loan agreement in order to proceed.",
//                 footer: '<a href="#">Why do I have this issue?</a>'
//             });
//             return false;
//         }
//         return true;
//     }
    
//     function sendFormData() {
//         fetch(`{% url 'handle_loan_submission' %}`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': getCookie('csrftoken'),
//             },
//             body: JSON.stringify({ loanFormData }),
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.status === 'success') {
//                 window.location.href = data.redirect_url;
//             } else {
//                 console.error('Error saving form data:', data.error);
//             }
//         })
//         .catch(error => {
//             console.error('Error saving form data:', error);
//         });
//     }
//     // custom csrf
//     function getCookie(name) {
//         const cookieName = name + "=";
//         const decodedCookies = decodeURIComponent(document.cookie);
//         const cookieArray = decodedCookies.split(';');

//         for (let i = 0; i < cookieArray.length; i++) {
//             let cookie = cookieArray[i].trim();
//             if (cookie.indexOf(cookieName) === 0) {
//                 return cookie.substring(cookieName.length);
//             }
//         }
//         return null;
//     }
// });
// </script>