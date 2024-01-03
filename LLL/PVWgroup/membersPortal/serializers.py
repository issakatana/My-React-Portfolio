# from rest_framework import serializers
# from .models import Member

# class MemberSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Member
#         fields = '__all__'  





# <script>
#     document.addEventListener('DOMContentLoaded', function() {
#         // Get elements and set up event listeners
#         const loanSubmitFormButton = document.getElementById('loanSubmitFormButton');
#         const amountInput = document.getElementById('amount');
#         const errorSpan = document.getElementById('amountAppliedForError');

#         // Event listener for form submission
#         loanSubmitFormButton.addEventListener('click', function() {
#             try {
#                 validateFormData();
#             } catch (error) {
#                 handleError(error.message);
#             } finally {
#                 // Add any code that should run regardless of success or failure
#             }
#         });

#         // Event listener for real-time amount validation
#         amountInput.addEventListener('input', function() {
#             try {
#                 validateAmountInput();
#             } catch (error) {
#                 handleError(error.message);
#             }
#         });

#         async function validateFormData() {
#             const amountValue = parseFloat(amountInput.value);
#             const memberId = 2/* Get the member ID from your frontend, e.g., user ID */;

#             try {
#                 const response = await fetch(`/api/member/${memberId}/gross-salary/`);
#                 const grossSalary = await response.json();

#                 if (amountValue > 0 && amountValue <= 0.5 * grossSalary) {
#                     errorSpan.textContent = '';
#                     sendFormData(); // Move this call here if validation passes
#                     showSuccessMessage();
#                 } else {
#                     throw new Error('Amount must be 50% or less of the gross salary.');
#                 }
#             } catch (error) {
#                 throw new Error('Error fetching gross salary.');
#             }
#         }

#         function validateAmountInput() {
#             const amountValue = parseFloat(amountInput.value);
#             if (amountValue > 0) {
#                 errorSpan.textContent = '';
#             } else {
#                 throw new Error('Amount must be greater than zero.');
#             }
#         }

#         function sendFormData() {
#             // Add your logic to send the form data
#         }

#         function showSuccessMessage() {
#             Swal.fire({
#                 title: 'Loan Application Submitted',
#                 text: 'Your loan application has been successfully submitted.',
#                 icon: 'success'
#             });
#         }

#         function handleError(errorMessage) {
#             errorSpan.textContent = errorMessage;
#             Swal.fire({
#                 icon: 'error',
#                 title: 'Oops...',
#                 text: 'Failed to submit application!',
#                 footer: '<a href="#">Why do I have this issue?</a>'
#             });
#         }
#     });
# </script>