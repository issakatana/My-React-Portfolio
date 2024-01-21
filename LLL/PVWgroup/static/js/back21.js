// NEW ACCOUNTS APPROVALS
document.addEventListener('DOMContentLoaded', function () {
    const approveButtons = document.querySelectorAll('.approveMember');
    const unblockButtons = document.querySelectorAll('.unblockMember');
    const overlay = document.getElementById('overlay');
    const popupContent = document.getElementById('popupContent');
    const popupCloseButton = document.getElementById('popupCloseButton');
    const popupPrevButton = document.getElementById('popupPrevButton');
    const popupNextButton = document.getElementById('popupNextButton');
    const popupRejectButtonAcc = document.getElementById('popupRejectButtonAcc');
    const popupApproveButton = document.getElementById('popupApproveButton');

    let currentSection = 0;
    let sections = [];

    function showSection(index) {
        sections.forEach((section, i) => {
            if (i === index) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        if (index === 0) {
            popupPrevButton.style.display = 'none';
        } else {
            popupPrevButton.style.display = 'inline-block';
        }

        if (index === sections.length - 1) {
            popupNextButton.style.display = 'none';
            popupRejectButtonAcc.style.display = 'inline-block';
            popupApproveButton.style.display = 'inline-block';
        } else {
            popupNextButton.style.display = 'inline-block';
            popupRejectButtonAcc.style.display = 'none';
            popupApproveButton.style.display = 'none';
        }
    }

    function showNextSection() {
        if (currentSection < sections.length - 1) {
            currentSection++;
            showSection(currentSection);
        }
    }

    function showPrevSection() {
        if (currentSection > 0) {
            currentSection--;
            showSection(currentSection);
        }
    }

    approveButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const memberId = button.getAttribute('approve-data-member-id');
            // Send an AJAX request to get member details
            fetch(`get_member_details/${memberId}`)
                .then(response => response.json())
                .then(data => {
                    // Update the content of the popup with member details
                    popupContent.innerHTML = `
                    <div class="general-data my-details pending-approval">
                        <div class="my-details-tittle profile-tittle">
                            <p>General Details</p>
                        </div>
                        <div class="my-details-data">
                            <div class="form-group">
                                <label for="fulname">Full Name</label>
                                <input type="text" value="${data.full_name}" readonly>
                            </div> 
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input type="text" value="${data.username}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="memberno">Member Number</label>
                                <input type="text" value="${data.member_number}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="text" value="${data.email}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="phoneno">Phone Number</label>
                                <input type="text" value="${data.phone_number}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="idnumber">ID Number</label>
                                <input type="text" value="${data.id_number}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="position">Position</label>
                                <input type="text" value="${data.position}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="gender">Gender</label>
                                <input type="text" value="${data.gender}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="dob">Date of Birth</label>
                                <input type="text" value="${data.dob}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="county">County</label>
                                <input type="text" value="${data.county}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="subcounty">Sub County</label>
                                <input type="text" value="${data.sub_county}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="ward">Ward</label>
                                <input type="text" value="${data.ward}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="sublocation">Sub Location</label>
                                <input type="text" value="${data.sublocation}" readonly>
                            </div> 
                        </div>
                    </div>
                    <div class="next-of-kin-data next-of-kin pending-approval">
                        <div class="my-member-tittle profile-tittle">
                            <p>Next of Kin Data</p>
                        </div>
                        <table class="tbl">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Relationship</th>
                                    <th>ID Number/Birth Certificate Number</th>
                                    <th>Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${data.nextofkin_name}</td>
                                    <td>${data.nextofkin_relationship}</td>
                                    <td>${data.nextofkin_idnumber}</td>
                                    <td>${data.nextofkin_contact}</td>
                                </tr>
                            </tbody>
                        </table>    
                    </div>
                    <div class="nominee-data member-nominees pending-approval">
                        <div class="my-member-tittle profile-tittle">
                            <p>Dependants Data</p>
                        </div>
                        <table class="tbl">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Relationship</th>
                                    <th>ID Number/Birth Certificate Number</th>
                                    <th>Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${data.nameofdependant}</td>
                                    <td>${data.nominee_relationship}</td>
                                    <td>${data.nominee_idnumber}</td>
                                    <td>${data.nominee_contact}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    `;
                    // Update the href attribute dynamically
                    const rejectLink = document.getElementById("rejectLinkAcc");
                    const approveLink = document.getElementById("approveLink");
                    const rejectClonedLink = rejectLink.cloneNode(true);
                    const clonedLink = approveLink.cloneNode(true);

                    rejectClonedLink.setAttribute("data-rejectAccountCreatedLoan-url", `{% url "reject_accountCreated_request" loan_id=1 %}`.replace("1", memberId));
                    rejectLink.parentNode.replaceChild(rejectClonedLink, rejectLink);

                    rejectClonedLink.addEventListener("click", function (event) {
                        event.preventDefault();
                        const url = rejectClonedLink.getAttribute("data-rejectAccountCreatedLoan-url");
                    
                        fetch(`reject_accountCreated_request/${memberId}/`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! Status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(data => {
                                Swal.fire({
                                    icon: "success",
                                    title: "Member Account Rejected!",
                                    html: `You have successfully rejected <strong>${data.full_name}</strong> to be member of Parkside Villa Welfare Group with Member Number <strong>${data.member_number}</strong>.`,
                                }).then(() => {
                                    location.reload();
                                });                              
                            })
                            .catch(error => {
                                console.error("Error:", error);
                                Swal.fire({
                                    icon: "error",
                                    title: "Reject Failed!",
                                    text: "There was an error rejecting the account. Please try again.",
                                });
                            });
                    });

                    clonedLink.setAttribute("data-url", `{% url "approve_member" member_id=1 %}`.replace("1", memberId));
                    approveLink.parentNode.replaceChild(clonedLink, approveLink);

                    clonedLink.addEventListener("click", function (event) {
                        event.preventDefault(); 
                        const url = clonedLink.getAttribute("data-url");
                        
                        fetch(`approve_member/${memberId}/`)  
                            .then(response => response.json())
                            .then(data => {
                                Swal.fire({
                                    icon: "success",
                                    title: "Member Approved!",
                                    html: `You have successfully approved <strong>${data.full_name}</strong> as a member of Parkside Villa Welfare Group with Member Number <strong>${data.member_number}</strong>.`,
                                }).then(() => {
                                    location.reload();
                                });
                            })
                            .catch(error => console.error("Error:", error));
                    });
                    currentSection = 0; 
                    sections = document.querySelectorAll('.pending-approval');
                    showSection(currentSection);
                    overlay.style.display = 'flex';
                })
                .catch(error => console.error('Error fetching member details:', error));
        });
    });



    unblockButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const memberId = button.getAttribute('unblock-data-member-id');
            // Send an AJAX request to get member details
            fetch(`get_member_details/${memberId}`)
                .then(response => response.json())
                .then(data => {
                    // Update the content of the popup with member details
                    popupContent.innerHTML = `
                    <div class="general-data my-details pending-approval">
                        <div class="my-details-tittle profile-tittle">
                            <p>General Details</p>
                        </div>
                        <div class="my-details-data">
                            <div class="form-group">
                                <label for="fulname">Full Name</label>
                                <input type="text" value="${data.full_name}" readonly>
                            </div> 
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input type="text" value="${data.username}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="memberno">Member Number</label>
                                <input type="text" value="${data.member_number}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="text" value="${data.email}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="phoneno">Phone Number</label>
                                <input type="text" value="${data.phone_number}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="idnumber">ID Number</label>
                                <input type="text" value="${data.id_number}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="position">Position</label>
                                <input type="text" value="${data.position}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="gender">Gender</label>
                                <input type="text" value="${data.gender}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="dob">Date of Birth</label>
                                <input type="text" value="${data.dob}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="county">County</label>
                                <input type="text" value="${data.county}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="subcounty">Sub County</label>
                                <input type="text" value="${data.sub_county}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="ward">Ward</label>
                                <input type="text" value="${data.ward}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="sublocation">Sub Location</label>
                                <input type="text" value="${data.sublocation}" readonly>
                            </div> 
                        </div>
                    </div>
                    <div class="next-of-kin-data next-of-kin pending-approval">
                        <div class="my-member-tittle profile-tittle">
                            <p>Next of Kin Data</p>
                        </div>
                        <table class="tbl">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Relationship</th>
                                    <th>ID Number/Birth Certificate Number</th>
                                    <th>Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${data.nextofkin_name}</td>
                                    <td>${data.nextofkin_relationship}</td>
                                    <td>${data.nextofkin_idnumber}</td>
                                    <td>${data.nextofkin_contact}</td>
                                </tr>
                            </tbody>
                        </table>    
                    </div>
                    <div class="nominee-data member-nominees pending-approval">
                        <div class="my-member-tittle profile-tittle">
                            <p>Dependants Data</p>
                        </div>
                        <table class="tbl">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Relationship</th>
                                    <th>ID Number/Birth Certificate Number</th>
                                    <th>Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${data.nameofdependant}</td>
                                    <td>${data.nominee_relationship}</td>
                                    <td>${data.nominee_idnumber}</td>
                                    <td>${data.nominee_contact}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    `;
                    // Update the href attribute dynamically
                    const approveLink = document.getElementById("approveLink");
                    const clonedLink = approveLink.cloneNode(true);

                    clonedLink.setAttribute("data-url", `{% url "approve_member" member_id=1 %}`.replace("1", memberId));
                    approveLink.parentNode.replaceChild(clonedLink, approveLink);

                    clonedLink.addEventListener("click", function (event) {
                        event.preventDefault(); 
                        const url = clonedLink.getAttribute("data-url");
                        
                        fetch(`approve_member/${memberId}/`)  
                            .then(response => response.json())
                            .then(data => {
                                Swal.fire({
                                    icon: "success",
                                    title: "Member Unblocked!",
                                    html: `You have successfully unblocked account for <strong>${data.full_name}</strong> with Member Number <strong>${data.member_number}</strong>.`,
                                }).then(() => {
                                    location.reload();
                                });
                            })
                            .catch(error => console.error("Error:", error));
                    });
                    currentSection = 0; 
                    sections = document.querySelectorAll('.pending-approval');
                    showSection(currentSection);
                    overlay.style.display = 'flex';
                })
                .catch(error => console.error('Error fetching member details:', error));
        });
    });

    popupCloseButton.addEventListener('click', function () {
        overlay.style.display = 'none';
    });
    popupPrevButton.addEventListener('click', function () {
        showPrevSection();
    });
    popupNextButton.addEventListener('click', function () {
        showNextSection();
    });

});



// ADVANCE LOAN REQUEST APPROVALS
document.addEventListener('DOMContentLoaded', function () {
    const approveAdvanceLoanButtons = document.querySelectorAll('.approveAdvanceLoan');
    const overlayadv = document.getElementById('overlayadv');
    const advancePopupContent = document.getElementById('advancePopupContent');
    const popupCloseButtonadv = document.getElementById('popupCloseButtonadv');
    const popupPrevButtonadv = document.getElementById('popupPrevButtonadv');
    const popupNextButtonadv = document.getElementById('popupNextButtonadv');
    const popupApproveButtonadv = document.getElementById('popupApproveButtonadv');
    const popupRejectButtonadv = document.getElementById('popupRejectButtonadv');
   
    let currentSectionadv = 0;
    let sectionsadvs = [];

    function showSection(index) {
        sectionsadvs.forEach((sectionadv, i) => {
            if (i === index) {
                sectionadv.classList.add('active');
            } else {
                sectionadv.classList.remove('active');
            }
        });

        if (index === 0) {
            popupPrevButtonadv.style.display = 'none';
        } else {
            popupPrevButtonadv.style.display = 'inline-block';
        }

        if (index === sectionsadvs.length - 1) {
            popupNextButtonadv.style.display = 'none';
            popupApproveButtonadv.style.display = 'inline-block';
            popupRejectButtonadv.style.display = 'inline-block';
        } else {
            popupNextButtonadv.style.display = 'inline-block';
            popupApproveButtonadv.style.display = 'none';
            popupRejectButtonadv.style.display = 'none';
        }
    }

    function showNextSection() {
        if (currentSectionadv < sectionsadvs.length - 1) {
            currentSectionadv++;
            showSection(currentSectionadv);
        }
    }

    function showPrevSection() {
        if (currentSectionadv > 0) {
            currentSectionadv--;
            showSection(currentSectionadv);
        }
    }

    approveAdvanceLoanButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const advanceloanId = button.getAttribute('data-advanceLoan-id');
            // Send an AJAX request to get advance loan details
            fetch(`get_advanceLoan_details/${advanceloanId}`)
                .then(response => response.json())
                .then(data => {
                    // Log the data to the console
                    console.log('Received Advance Loan Data:', data);

                    // Log the inner HTML of the advancePopupContent div
                    console.log('Current HTML of advancePopupContent:', advancePopupContent.innerHTML);

                    // Update the content of the popup with member details using textContent
                    advancePopupContent.innerHTML = `
                    <div class=" pending-approvaladv">
                        <div class="my-details-tittle profile-tittle">
                            <p>General Details of Loan Applicant</p>
                        </div>
                        <div class="my-details-data">
                            <div class="form-group">
                                <label for="fulname">Full Name</label>
                                <input type="text" value="${data.full_name}" readonly>
                            </div> 
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input type="text" value="${data.username}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="memberno">Member Number</label>
                                <input type="text" value="${data.member_number}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="text" value="${data.email}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="phoneno">Phone Number</label>
                                <input type="text" value="${data.phone_number}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="idnumber">ID Number</label>
                                <input type="text" value="${data.id_number}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="position">Position</label>
                                <input type="text" value="${data.position}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="gender">Gender</label>
                                <input type="text" value="${data.gender}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="dob">Date of Birth</label>
                                <input type="text" value="${data.dob}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="county">County</label>
                                <input type="text" value="${data.county}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="subcounty">Sub County</label>
                                <input type="text" value="${data.sub_county}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="ward">Ward</label>
                                <input type="text" value="${data.ward}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="sublocation">Sub Location</label>
                                <input type="text" value="${data.sublocation}" readonly>
                            </div> 
                        </div>
                    </div>
                    <div class=" pending-approvaladv">
                        <div class="my-member-tittle profile-tittle">
                            <p>Guarantors Details</p>
                        </div>
                        <table class="tbl">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Member Number</th>
                                    <th>ID Number</th>
                                    <th>Contact</th>
                                    <th>Loan Guaranteed</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="guarantorsTableBody">
                                <!-- Guarantors data will be inserted here using JavaScript -->
                                ${data.guarantors.map(guarantor => `
                                    <tr>
                                        <td>${guarantor.full_name}</td>
                                        <td>${guarantor.member_number}</td>
                                        <td>${guarantor.id_number}</td>
                                        <td>${guarantor.phone_number}</td>
                                        <td>${guarantor.loan_type_guaranteed}</td>
                                        <td>${guarantor.signature_status}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class=" pending-approvaladv">
                        <div class="my-member-tittle profile-tittle">
                            <p>Applicant's Assets Information</p>
                        </div>
                        <div class="my-details-data">
                            <div class="form-group">
                                <label for="username">Applicant's Gross Salary</label>
                                <input type="text" value="${data.gross_salary}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="fulname">Total Shares</label>
                                <input type="text" value="${data.shares_contribution}" readonly>
                            </div> 
                            <div class="form-group">
                                <label for="fulname">Total Benovolent</label>
                                <input type="text" value="${data.benovelent_contribution}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="memberno">Welfare Loan Balance</label>
                                <input type="text" value="${data.normal_loan}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="email">Advance Loan Balance</label>
                                <input type="text" value="${data.salary_advance_loan}" readonly>
                            </div>
                        </div>
                        <div class="my-member-tittle profile-tittle">
                            <p>Applicants Loan Details</p>
                        </div>
                        <table class="tbl">
                            <thead>
                                <tr>
                                    <th>Date Borrowed</th>
                                    <th>Loan Id</th>
                                    <th>Borrowed Loan Amount</th>
                                    <th>Interest Rate</th>
                                    <th>Interest</th>
                                    <th>Amount to be paid</th>
                                    <th>Maturity Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${data.date_requested}</td>
                                    <td>${data.loan_id}</td>
                                    <td>${data.borrowed_amount}</td>
                                    <td> 5% </td>
                                    <td>${data.interest}</td>
                                    <td>${data.amount_to_be_paid }</td>
                                    <td>${data.maturity_date}</td>
                                </tr>
                            </tbody>
                        </table>    
                    </div>
                    `;
                    // Update the href attribute dynamically
                    const rejectLink = document.getElementById("rejectLink");
                    const approveLink = document.getElementById("approveLinkadv");
                    const rejectClonedLink = rejectLink.cloneNode(true);
                    const approveClonedLink = approveLink.cloneNode(true);

                    rejectClonedLink.setAttribute("data-rejectAdvanceLoan-url", `{% url "reject_advanceLoan_request" loan_id=1 %}`.replace("1", advanceloanId));
                    rejectLink.parentNode.replaceChild(rejectClonedLink, rejectLink);

                    rejectClonedLink.addEventListener("click", function (event) {
                        event.preventDefault();
                        const url = rejectClonedLink.getAttribute("data-rejectAdvanceLoan-url");
                    
                        // Use SweetAlert for confirmation
                        Swal.fire({
                            title: 'Confirm Rejection',
                            text: 'Are you sure you want to reject the advance loan?',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Yes, reject it!'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Perform the rejection action here
                                // You can add your logic for rejecting the advance loan
                    
                                fetch(`reject_advanceLoan_request/${advanceloanId}/`)
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error(`HTTP error! Status: ${response.status}`);
                                        }
                                        return response.json();
                                    })
                                    .then(data => {
                                        Swal.fire({
                                            icon: "success",
                                            title: "Advance Loan Rejected!",
                                            html: `You have successfully rejected the advance loan with ID <strong>${data.loan_id}</strong> for <strong>${data.full_name}</strong>, Member Number <strong>${data.member_number}</strong>.`,
                                        }).then(() => {
                                            location.reload();
                                        });
                                    })
                                    .catch(error => {
                                        console.error("Error:", error);
                                        Swal.fire({
                                            icon: "error",
                                            title: "Reject Failed!",
                                            text: "There was an error rejecting the advance loan. Please try again.",
                                        });
                                    });
                            }
                        });
                    });
                    
                    approveClonedLink.setAttribute("data-approveAdvanceLoan-url", `{% url "approve_advance_loan" loan_id=1 %}`.replace("1", advanceloanId));
                    approveLink.parentNode.replaceChild(approveClonedLink, approveLink);

                    approveClonedLink.addEventListener("click", function (event) {
                        event.preventDefault();
                        const url = approveClonedLink.getAttribute("data-approveAdvanceLoan-url");
                        console.log(advanceloanId);
                    
                        // Use SweetAlert for confirmation
                        Swal.fire({
                            title: 'Confirm Approval',
                            text: 'Are you sure you want to approve the advance loan?',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, approve it!'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Perform the approval action here
                                // You can add your logic for approving the advance loan
                    
                                fetch(`approve_advance_loan/${advanceloanId}/`)
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error(`HTTP error! Status: ${response.status}`);
                                        }
                                        return response.json();
                                    })
                                    .then(data => {
                                        Swal.fire({
                                            icon: "success",
                                            title: "Advance Loan Approved!",
                                            html: `You have successfully approved the advance loan with ID <strong>${data.loan_id}</strong> for <strong>${data.full_name}</strong>, Member Number <strong>${data.member_number}</strong>.`,
                                        }).then(() => {
                                            location.reload();
                                        });
                                    })
                                    .catch(error => {
                                        console.error("Error:", error);
                                        Swal.fire({
                                            icon: "error",
                                            title: "Approval Failed!",
                                            text: "There was an error approving the advance loan. Please try again.",
                                        });
                                    });
                            }
                        });
                    });
                                        
                    currentSectionadv = 0; 
                    sectionsadvs = document.querySelectorAll('.pending-approvaladv');
                    showSection(currentSectionadv);
                    overlayadv.style.display = 'flex';

                })
                .catch(error => console.error('Error fetching member details:', error));

        })});
       
        popupCloseButtonadv.addEventListener('click', function () {
            overlayadv.style.display = 'none';
        });
        popupPrevButtonadv.addEventListener('click', function () {
            showPrevSection();
        });
        popupNextButtonadv.addEventListener('click', function () {
            showNextSection();
        });
});



// WELFARE LOAN REQUEST APPROVALS
document.addEventListener('DOMContentLoaded', function () {
    const approveWelfareLoanButtons = document.querySelectorAll('.approveWelfareLoan');
    const overlaywel = document.getElementById('overlaywel');
    const welfarePopupContent = document.getElementById('welfarePopupContent');
    const popupCloseButtonwel = document.getElementById('popupCloseButtonwel');
    const popupPrevButtonwel = document.getElementById('popupPrevButtonwel');
    const popupNextButtonwel = document.getElementById('popupNextButtonwel');
    const popupApproveButtonwel = document.getElementById('popupApproveButtonwel');
    const popupRejectButtonwel = document.getElementById('popupRejectButtonwel');
    
    let currentSectionwel = 0;
    let sectionswels = [];
    
    function showSection(index) {
        sectionswels.forEach((sectionwel, i) => {
            if (i === index) {
                sectionwel.classList.add('active');
            } else {
                sectionwel.classList.remove('active');
            }
        });
    
        if (index === 0) {
            popupPrevButtonwel.style.display = 'none';
        } else {
            popupPrevButtonwel.style.display = 'inline-block';
        }
    
        if (index === sectionswels.length - 1) {
            popupNextButtonwel.style.display = 'none';
            popupApproveButtonwel.style.display = 'inline-block';
            popupRejectButtonwel.style.display = 'inline-block';
        } else {
            popupNextButtonwel.style.display = 'inline-block';
            popupApproveButtonwel.style.display = 'none';
            popupRejectButtonwel.style.display = 'none';
        }
    }
    
    function showNextSection() {
        if (currentSectionwel < sectionswels.length - 1) {
            currentSectionwel++;
            showSection(currentSectionwel);
        }
    }
    
    function showPrevSection() {
        if (currentSectionwel > 0) {
            currentSectionwel--;
            showSection(currentSectionwel);
        }
    }
    
    approveWelfareLoanButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const welfareloanId = button.getAttribute('data-welfareLoan-id');
            // Send an AJAX request to get advance loan details
            fetch(`get_welfareLoan_details/${welfareloanId}`)
                .then(response => response.json())
                .then(data => {

                    // Update the content of the popup with member details using textContent
                    welfarePopupContent.innerHTML = `
                    <div class="pending-approvalwel">
                        <div class="my-details-tittle profile-tittle">
                            <p>General Details of Loan Applicant</p>
                        </div>
                        <div class="my-details-data">
                            <div class="form-group">
                                <label for="fulname">Full Name</label>
                                <input type="text" value="${data.full_name}" readonly>
                            </div> 
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input type="text" value="${data.username}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="memberno">Member Number</label>
                                <input type="text" value="${data.member_number}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="text" value="${data.email}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="phoneno">Phone Number</label>
                                <input type="text" value="${data.phone_number}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="idnumber">ID Number</label>
                                <input type="text" value="${data.id_number}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="position">Position</label>
                                <input type="text" value="${data.position}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="gender">Gender</label>
                                <input type="text" value="${data.gender}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="dob">Date of Birth</label>
                                <input type="text" value="${data.dob}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="county">County</label>
                                <input type="text" value="${data.county}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="subcounty">Sub County</label>
                                <input type="text" value="${data.sub_county}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="ward">Ward</label>
                                <input type="text" value="${data.ward}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="sublocation">Sub Location</label>
                                <input type="text" value="${data.sublocation}" readonly>
                            </div> 
                        </div>
                    </div>
                    <div class=" pending-approvalwel">
                        <div class="my-member-tittle profile-tittle">
                            <p>Guarantors Details</p>
                        </div>
                        <table class="tbl">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Member Number</th>
                                    <th>ID Number</th>
                                    <th>Contact</th>
                                    <th>Loan Guaranteed</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="guarantorsTableBody">
                                <!-- Guarantors data will be inserted here using JavaScript -->
                                ${data.guarantors.map(guarantor => `
                                    <tr>
                                        <td>${guarantor.full_name}</td>
                                        <td>${guarantor.member_number}</td>
                                        <td>${guarantor.id_number}</td>
                                        <td>${guarantor.phone_number}</td>
                                        <td>${guarantor.loan_type_guaranteed}</td>
                                        <td>${guarantor.signature_status}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>    
                    </div>
                    <div class=" pending-approvalwel">
                        <div class="my-member-tittle profile-tittle">
                            <p>Applicant's Assets Information</p>
                        </div>
                        <div class="my-details-data">
                            <div class="form-group">
                                <label for="username">Applicant's Gross Salary</label>
                                <input type="text" value="${data.gross_salary}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="fulname">Total Shares</label>
                                <input type="text" value="${data.shares_contribution}" readonly>
                            </div> 
                            <div class="form-group">
                                <label for="fulname">Total Benovolent</label>
                                <input type="text" value="${data.benovelent_contribution}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="memberno">Welfare Loan Balance</label>
                                <input type="text" value="${data.normal_loan}" readonly>
                            </div>
                            <div class="form-group">
                                <label for="email">Advance Loan Balance</label>
                                <input type="text" value="${data.salary_advance_loan}" readonly>
                            </div>
                        </div>
                        <div class="my-member-tittle profile-tittle">
                            <p>Applicants Loan Details Summary</p>
                        </div>
                        <table class="tbl">
                            <thead>
                                <tr>
                                    <th>Date Borrowed</th>
                                    <th>Loan Id</th>
                                    <th>Borrowed Loan Amount</th>
                                    <th>Interest Rate</th>
                                    <th>Duration</th>
                                    <th>Total Loan Interest</th>
                                    <th>Amount to be paid</th>
                                    <th>Maturity Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${data.date_requested}</td>
                                    <td>${data.loan_id}</td>
                                    <td>${data.borrowed_amount}</td>
                                    <td> 5% </td>
                                    <td>${data.duration}</td>
                                    <td>${data.interest}</td>
                                    <td>${data.amount_to_be_paid }</td>
                                    <td>${data.maturity_date}</td>
                                </tr>
                            </tbody>
                        </table> 
                    </div>
                    <div class=" pending-approvalwel">
                        <div class="my-member-tittle profile-tittle">
                           <p>Repayment Schedule Welfare Loan Summary</p>
                        </div> 
                        <table class="tbl">
                            <thead>
                                <tr>
                                    <th>Maturity Date</th>
                                    <th>Duration(Months)</th>
                                    <th>Monthly Installment</th>
                                    <th>Interest Rate</th>
                                    <th>Monthly Interest</th>
                                    <th>Amount Due</th>
                                    <th>Status</th>
                                    <th>Date Paid</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.reducingTables.map(reducingTable => `
                                    <tr>
                                        <td>${reducingTable.maturity_date}</td>
                                        <td>${reducingTable.duration}</td>
                                        <td>${reducingTable.installment}</td>
                                        <td>${reducingTable.interest_rate * 100}%</td>
                                        <td>${reducingTable.interest}</td>
                                        <td>${reducingTable.amount_due}</td>
                                        <td>${reducingTable.status}</td>
                                        <td>${reducingTable.date_paid || 'Not Updated'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table> 
                    </div>
                    `;
                    // Update the href attribute dynamically
                    const rejectLink = document.getElementById("rejectLinkwel");
                    const approveLink = document.getElementById("approveLinkwel");
                    const rejectClonedLink = rejectLink.cloneNode(true);
                    const approveClonedLink = approveLink.cloneNode(true);

                    rejectClonedLink.setAttribute("data-rejectWelfareLoan-url", `{% url "reject_welfareLoan_request" loan_id=1 %}`.replace("1", welfareloanId));
                    rejectLink.parentNode.replaceChild(rejectClonedLink, rejectLink);

                    rejectClonedLink.addEventListener("click", function (event) {
                        event.preventDefault();
                        const url = rejectClonedLink.getAttribute("data-rejectWelfareLoan-url");
                    
                        // Use SweetAlert for confirmation
                        Swal.fire({
                            title: 'Confirm Rejection',
                            text: 'Are you sure you want to reject the welfare loan?',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Yes, reject it!'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Perform the rejection action here
                                // You can add your logic for rejecting the welfare loan
                    
                                fetch(`reject_welfareLoan_request/${welfareloanId}/`)
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error(`HTTP error! Status: ${response.status}`);
                                        }
                                        return response.json();
                                    })
                                    .then(data => {
                                        Swal.fire({
                                            icon: "success",
                                            title: "Welfare Loan Rejected!",
                                            html: `You have successfully rejected the welfare loan with ID <strong>${data.loan_id}</strong> for <strong>${data.full_name}</strong>, Member Number <strong>${data.member_number}</strong>.`,
                                        }).then(() => {
                                            location.reload();
                                        });
                                    })
                                    .catch(error => {
                                        console.error("Error:", error);
                                        Swal.fire({
                                            icon: "error",
                                            title: "Reject Failed!",
                                            text: "There was an error rejecting the welfare loan. Please try again.",
                                        });
                                    });
                            }
                        });
                    });
                    
                    approveClonedLink.setAttribute("data-approveWelfareLoan-url", `{% url "approve_welfare_loan" loan_id=1 %}`.replace("1", welfareloanId));
                    approveLink.parentNode.replaceChild(approveClonedLink, approveLink);

                    approveClonedLink.addEventListener("click", function (event) {
                        event.preventDefault();
                        const url = approveClonedLink.getAttribute("data-approveWelfareLoan-url");
                        console.log(welfareloanId);
                    
                        // Use SweetAlert for confirmation
                        Swal.fire({
                            title: 'Confirm Approval',
                            text: 'Are you sure you want to approve the welfare loan?',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, approve it!'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Perform the approval action here
                                // You can add your logic for approving the welfare loan
                    
                                fetch(`approve_welfare_loan/${welfareloanId}/`)
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error(`HTTP error! Status: ${response.status}`);
                                        }
                                        return response.json();
                                    })
                                    .then(data => {
                                        Swal.fire({
                                            icon: "success",
                                            title: "Welfare Loan Approved!",
                                            html: `You have successfully approved the welfare loan with ID <strong>${data.loan_id}</strong> for <strong>${data.full_name}</strong>, Member Number <strong>${data.member_number}</strong>.`,
                                        }).then(() => {
                                            location.reload();
                                        });
                                    })
                                    .catch(error => {
                                        console.error("Error:", error);
                                        Swal.fire({
                                            icon: "error",
                                            title: "Approval Failed!",
                                            text: "There was an error approving the welfare loan. Please try again.",
                                        });
                                    });
                            }
                        });
                    });
                    
                    currentSectionwel = 0; 
                    sectionswels = document.querySelectorAll('.pending-approvalwel');
                    showSection(currentSectionwel);
                    overlaywel.style.display = 'flex';

                })
                .catch(error => console.error('Error fetching member details:', error));

        })});
       
        popupCloseButtonwel.addEventListener('click', function () {
            overlaywel.style.display = 'none';
        });
        
        popupPrevButtonwel.addEventListener('click', function () {
            showPrevSection();
        });
        
        popupNextButtonwel.addEventListener('click', function () {
            showNextSection();
        });        
});


// BENEVOLENT CLAIMS REJECTION AND APPROVALS
document.addEventListener('DOMContentLoaded', function () {
    const approveBenevolentClaimButtons = document.querySelectorAll('.approveBenevolentClaim');
    const overlayclm = document.getElementById('overlayclm');
    const benevolentPopupContent = document.getElementById('benevolentPopupContent');
    const popupCloseButtonclm = document.getElementById('popupCloseButtonclm');
    const popupPrevButtonclm = document.getElementById('popupPrevButtonclm');
    const popupNextButtonclm = document.getElementById('popupNextButtonclm');
    const popupApproveButtonclm = document.getElementById('popupApproveButtonclm');
    const popupRejectButtonclm = document.getElementById('popupRejectButtonclm');

    
    let currentSectionclm = 0;
    let sectionsclm = [];

    function showSection(index) {
        sectionsclm.forEach((sectionclm, i) => {
            if (i === index) {
                sectionclm.classList.add('active');
            } else {
                sectionclm.classList.remove('active');
            }
        });

        if (index === 0) {
            popupPrevButtonclm.style.display = 'none';
        } else {
            popupPrevButtonclm.style.display = 'inline-block';
        }

        if (index === sectionsclm.length - 1) {
            popupNextButtonclm.style.display = 'none';
            popupApproveButtonclm.style.display = 'inline-block';
            popupRejectButtonclm.style.display = 'inline-block';
        } else {
            popupNextButtonclm.style.display = 'inline-block';
            popupApproveButtonclm.style.display = 'none';
            popupRejectButtonclm.style.display = 'none';
        }
    }

    function showNextSection() {
        if (currentSectionclm < sectionsclm.length - 1) {
            currentSectionclm++;
            showSection(currentSectionclm);
        }
    }

    function showPrevSection() {
        if (currentSectionclm > 0) {
            currentSectionclm--;
            showSection(currentSectionclm);
        }
    }

    approveBenevolentClaimButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const benevolentClaimId = button.getAttribute('data-benevolentClaim-id');
            // Send an AJAX request to get benevolent claim details
            fetch(`get_benevolent_claim_details/${benevolentClaimId}`)
                .then(response => response.json())
                .then(data => {
                    // Log the data to the console
                    console.log('Received data Benevolent Claim Data:', data);
    
                    // Log the inner HTML of the benevolentPopupContent div
                    console.log('Current HTML of benevolentPopupContent:', benevolentPopupContent.innerHTML);

                    // Update the content of the popup with member details using textContent
                    benevolentPopupContent.innerHTML = `
                        <div class="pending-approvalclm">
                            <div class="my-details-tittle profile-tittle">
                                <p>General Details of Benevolent Claim Applicant</p>
                            </div>
                            <div class="my-details-data">
                                <div class="form-group">
                                    <label for="fulname">Full Name</label>
                                    <input type="text" value="${data.full_name}" readonly>
                                </div> 
                                <div class="form-group">
                                    <label for="username">Username</label>
                                    <input type="text" value="${data.username}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="memberno">Member Number</label>
                                    <input type="text" value="${data.member_number}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="email">Email</label>
                                    <input type="text" value="${data.email}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="phoneno">Phone Number</label>
                                    <input type="text" value="${data.phone_number}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="idnumber">ID Number</label>
                                    <input type="text" value="${data.id_number}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="position">Position</label>
                                    <input type="text" value="${data.position}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="gender">Gender</label>
                                    <input type="text" value="${data.gender}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="dob">Date of Birth</label>
                                    <input type="text" value="${data.dob}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="county">County</label>
                                    <input type="text" value="${data.county}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="subcounty">Sub County</label>
                                    <input type="text" value="${data.sub_county}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="ward">Ward</label>
                                    <input type="text" value="${data.ward}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="sublocation">Sub Location</label>
                                    <input type="text" value="${data.sublocation}" readonly>
                                </div> 
                            </div>
                        </div>
                        <div class="pending-approvalclm">
                            <div class="my-details-tittle profile-tittle">
                                <p>Dependants List of Benevolent Claim Applicant</p>
                            </div>
                            <table class="tbl">
                                <thead>
                                    <tr>
                                        <th>Name of Dependant</th>
                                        <th>Dependant Relationship</th>
                                        <th>Dependant ID Number</th>
                                        <th>Dependant Contact</th>
                                        <th>Is Picked</th>
                                        <th>Is Deceased</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.dependants.map(dependant => `
                                        <tr>
                                            <td>${dependant.nameofdependant}</td>
                                            <td>${dependant.dependantrelationship}</td>
                                            <td>${dependant.dependantidnumber}</td>
                                            <td>${dependant.dependantcontact}</td>
                                            <td>${dependant.is_picked_status}</td>
                                            <td>${dependant.is_deceased_status}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table> 
                        </div>

                        <div class="pending-approvalclm">
                            <div class="my-details-tittle profile-tittle">
                                <p>Deceased List</p>
                            </div>
                            <table class="tbl">
                                <thead>
                                    <tr>
                                        <th>Deceased Name</th>
                                        <th>Relationship</th>
                                        <th>Date of Birth</th>
                                        <th>Date of Death</th>
                                        <th>Amount Awarded</th>
                                        <th>Is Claim Approved</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.deceasedInformations.map(deceasedInformation => `
                                        <tr>
                                            <td>${deceasedInformation.deceased_name}</td>
                                            <td>${deceasedInformation.relationship_with_member}</td>
                                            <td>${deceasedInformation.deceased_dob}</td>
                                            <td>${deceasedInformation.deceased_date_of_death}</td>
                                            <td>${deceasedInformation.awarded_amount}</td>
                                            <td>${deceasedInformation.is_claim_approved}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table> 
                        </div>

                        <div class="pending-approvalclm">
                           <div class="my-details-tittle profile-tittle">
                                <p>Account Summary of Benevolent Claim Applicant</p>
                            </div>
                            <div class="my-details-data">
                                <div class="form-group">
                                    <label for="username">Applicant's Gross Salary</label>
                                    <input type="text" value="${data.gross_salary}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="fulname">Total Shares</label>
                                    <input type="text" value="${data.shares_contribution}" readonly>
                                </div> 
                                <div class="form-group">
                                    <label for="fulname">Total Benovolent</label>
                                    <input type="text" value="${data.benovelent_contribution}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="memberno">Welfare Loan Balance</label>
                                    <input type="text" value="${data.normal_loan}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="email">Advance Loan Balance</label>
                                    <input type="text" value="${data.salary_advance_loan}" readonly>
                                </div>
                            </div>
                        </div>

                        <div class="pending-approvalclm">
                            <div class="my-details-tittle profile-tittle">
                                <p>Welfare Revenue</p>
                            </div>
                            <div class="my-details-data">
                                <div class="form-group">
                                    <label for="fulname">Welfare Income On Benevolent Contributed (Balance)</label>
                                    <input type="text" value="${data.overall_balances_benevolent_award.total_welfare_benovelent_contribution_before}" readonly>
                                </div>

                                <div class="form-group">
                                    <label for="awardamount">Total Benevolent Amount Awarded(Click Input to Modify)</label>
                                    <input type="text" value="${data.total_amount_awarded}" readonly>
                                </div>
                        
                                <div class="form-group">
                                    <label for="fulname">Welfare Income On Benevolent Contributed (Balance After Award deduction)</label>
                                    <input type="text" value="${data.overall_balances_benevolent_award.total_welfare_benovelent_contribution_after_benevolent_award}" readonly>
                                </div>
                            </div>
                        </div>
                    `;
                    // Update the href attribute dynamically
                    const rejectLink = document.getElementById("rejectLinkclm");
                    const approveLink = document.getElementById("approveLinkclm");
                    const rejectClonedLink = rejectLink.cloneNode(true);
                    const approveClonedLink = approveLink.cloneNode(true);

                    rejectClonedLink.setAttribute("data-rejectBenevolentClaim-url", `{% url "reject_benevolentClaim_request" claim_id=1 %}`.replace("1", benevolentClaimId));
                    rejectLink.parentNode.replaceChild(rejectClonedLink, rejectLink);

                    rejectClonedLink.addEventListener("click", function (event) {
                        event.preventDefault();
                        const url = rejectClonedLink.getAttribute("data-rejectBenevolentClaim-url");

                        // Ask user for confirmation
                        Swal.fire({
                            title: 'Confirmation',
                            html: `Are you sure you want to rejected the benevolent claim requested by <strong>${data.full_name}</strong>, Member Number <strong>${data.member_number}</strong> ?`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, submit',
                            cancelButtonText: 'Cancel',
                        }).then((result) => {
                            if (result.isConfirmed) {
                                fetch(`reject_benevolentClaim_request/${benevolentClaimId}/`)
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error(`HTTP error! Status: ${response.status}`);
                                    }
                                    return response.json();
                                })
                                .then(data => {
                                    Swal.fire({
                                        icon: "success",
                                        title: "Benevolent Claim Rejected!",
                                        html: `You have successfully rejected the benevolent claim with ID <strong>${data.id}</strong> for <strong>${data.full_name}</strong>, Member Number <strong>${data.member_number}</strong>.`,
                                    }).then(() => {
                                        location.reload();
                                    });                                
                                })
                                .catch(error => {
                                    console.error("Error:", error);
                                    Swal.fire({
                                        icon: "error",
                                        title: "Reject Failed!",
                                        text: "There was an error rejecting the benevolent claim. Please try again.",
                                    });
                                });

                            }});    
                    });

                    approveClonedLink.setAttribute("data-approveBenevolentClaim-url", `{% url "approve_benevolent_claim" claim_id=1 %}`.replace("1", benevolentClaimId));
                    approveLink.parentNode.replaceChild(approveClonedLink, approveLink);

                    approveClonedLink.addEventListener("click", function (event) {
                        event.preventDefault();
                        const url = approveClonedLink.getAttribute("data-approveBenevolentClaim-url");


                        // Ask user for confirmation
                        Swal.fire({
                            title: 'Confirmation',
                            html: `Are you sure you want to approved the benevolent requested by <strong>${data.full_name}</strong>, Member Number <strong>${data.member_number}</strong> ?`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, submit',
                            cancelButtonText: 'Cancel',
                        }).then((result) => {
                            if (result.isConfirmed) {

                                fetch(`approve_benevolent_claim/${benevolentClaimId}/`)
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error(`HTTP error! Status: ${response.status}`);
                                    }
                                    return response.json();
                                })
                                .then(data => {
                                    Swal.fire({
                                        icon: "success",
                                        title: "Benevolent Claim Approved!",
                                        html: `You have successfully approved the benevolent claim with ID <strong>${data.id}</strong> for <strong>${data.full_name}</strong>, Member Number <strong>${data.member_number}</strong>.`,
                                    }).then(() => {
                                        location.reload();
                                    });
                                })
                                .catch(error => {
                                    console.error("Error:", error);
                                    Swal.fire({
                                        icon: "error",
                                        title: "Approval Failed!",
                                        text: "There was an error approving the benevolent claim. Please try again.",
                                    });
                                });

                            }}); 

                    });

                    currentSectionclm = 0; 
                    sectionsclm = document.querySelectorAll('.pending-approvalclm');
                    showSection(currentSectionclm);
                    overlayclm.style.display = 'flex';                    

                })
                .catch(error => console.error('Error fetching member details:', error));

        })});
       
        popupCloseButtonclm.addEventListener('click', function () {
            overlayclm.style.display = 'none';
        });
        
        popupPrevButtonclm.addEventListener('click', function () {
            showPrevSection();
        });
        
        popupNextButtonclm.addEventListener('click', function () {
            showNextSection();
        });
              
});




//PVWG UPDATE CONTRIBUTIONS, SHARES, BENEVOLENT AND LOANS.
document.addEventListener('DOMContentLoaded', function () {
    const getPvwContributionButtons = document.getElementById('getPvwContributionButtons');
    const overlaypvwUpdate = document.getElementById('overlaypvwUpdate');
    const pvwMonthlyUpdatePopupContent = document.getElementById('pvwMonthlyUpdatePopupContent');
    const popupCloseButtonpvwUpdate = document.getElementById('popupCloseButtonpvwUpdate');
    const popupPrevButtonpvwUpdate = document.getElementById('popupPrevButtonpvwUpdate');
    const popupNextButtonpvwUpdate = document.getElementById('popupNextButtonpvwUpdate');
    const popupApproveButtonpvwUpdate = document.getElementById('popupApproveButtonpvwUpdate');
    const popupRejectButtonpvwUpdate = document.getElementById('popupRejectButtonpvwUpdate');

    let currentSectionpvwUpdate = 0;
    let sectionspvwUpdate = [];

    function showPreloader() {
        // Display the preloader
        document.getElementById('preloader').style.display = 'block';
    
        // Set a timeout to hide the preloader after 10 seconds
        setTimeout(function() {
          
        }, 10000);  // 10000 milliseconds = 10 seconds
    }
    
    function hidePreloader() {
        // Hide the preloader by setting its display property to 'none'
        document.getElementById('preloader').style.display = 'none';
    }
    

    function showSection(index) {
        sectionspvwUpdate.forEach((sectionpvwUpdate, i) => {
            if (i === index) {
                sectionpvwUpdate.classList.add('active');
            } else {
                sectionpvwUpdate.classList.remove('active');
            }
        });

        if (index === 0) {
            popupPrevButtonpvwUpdate.style.display = 'none';
        } else {
            popupPrevButtonpvwUpdate.style.display = 'inline-block';
        }

        if (index === sectionspvwUpdate.length - 1) {
            popupNextButtonpvwUpdate.style.display = 'none';
            popupApproveButtonpvwUpdate.style.display = 'inline-block';
            popupRejectButtonpvwUpdate.style.display = 'inline-block';
        } else {
            popupNextButtonpvwUpdate.style.display = 'inline-block';
            popupApproveButtonpvwUpdate.style.display = 'none';
            popupRejectButtonpvwUpdate.style.display = 'none';
        }
    }

    function showNextSection() {
        if (currentSectionpvwUpdate < sectionspvwUpdate.length - 1) {
            currentSectionpvwUpdate++;
            showSection(currentSectionpvwUpdate);
        }
    }

    function showPrevSection() {
        if (currentSectionpvwUpdate > 0) {
            currentSectionpvwUpdate--;
            showSection(currentSectionpvwUpdate);
        }
    }


    
    getPvwContributionButtons.addEventListener('click', function (event) {
        // Prevent the default behavior of the click event
        event.preventDefault();
    
        showPreloader()

        // Simulate a minimum delay of 5 seconds with setTimeout
        setTimeout(() => {

            // Send an AJAX request to get advance loan details
            fetch(`get_member_details_for_pvwUpdateContributions/`)
                .then(response => response.json())
                .then(data => {
                   
                    // Update the content of the popup with member details using textContent
                    pvwMonthlyUpdatePopupContent.innerHTML = `
                        <div class="pending-approvalpvwUpdate">
                            <div class="my-details-tittle profile-tittle">
                                <p>Changes To be Updated On Shares</p>
                            </div>
                            <table class="tbl">
                                <thead>
                                    <tr>
                                        <th>Full Name</th>
                                        <th>Member Number</th>
                                        <th>Position</th>
                                        <th>Shares Contribution Balance</th>
                                        <th>Share Amount to Contribute</th>
                                        <th>New Shares Contribution Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.members.map(member => `
                                        <tr>
                                            <td>${member.full_name}</td>
                                            <td>${member.member_number}</td>
                                            <td>${member.position}</td>
                                            <td>${member.shares_contribution_balance}</td>
                                            <td>${member.share_amountTo_contribute}</td>
                                            <td>${member.new_shares_contribution_balance}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table> 
                        </div>
        
                        <div class="pending-approvalpvwUpdate">
                            <div class="my-details-tittle profile-tittle">
                                <p>Changes To be Updated On Benevolent</p>
                            </div>
                            <table class="tbl">
                                <thead>
                                    <tr>
                                        <th>Full Name</th>
                                        <th>Member Number</th>
                                        <th>Position</th>
                                        <th>Benevolent Contribution Balance</th>
                                        <th>Benevolent Amount to Contribute</th>
                                        <th>New Benevolent Contribution Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.members.map(member => `
                                        <tr>
                                            <td>${member.full_name}</td>
                                            <td>${member.member_number}</td>
                                            <td>${member.position}</td>
                                            <td>${member.benevolent_contribution_balance}</td>
                                            <td>${member.benevolent_amountTo_contribute}</td>
                                            <td>${member.new_benevolent_contribution_balance}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table> 
                        </div>    

                        <div class="pending-approvalpvwUpdate">
                            <div class="my-details-tittle profile-tittle">
                                <p>Salary Advance Loan Due (REPAYMENTS)</p>
                            </div>

                            <table class="tbl">
                                <thead>
                                    <tr>
                                        <th>Full Name</th>
                                        <th>Member Number</th>
                                        <th>Position</th>
                                        <th>Loan ID</th>
                                        <th>Loan Amount Borrowed</th>
                                        <th>Interest</th>
                                        <th>Loan Amount Due</th>
                                        <th>Loan Due Date</th>
                                        <th>Outstanding Loan Principal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Use a conditional check to display "No active salary advance loans" message -->
                                    ${data.members.length > 0 ?
                                        data.members.map(member => {
                                            return member.advance_loans_due_repayments.map(loan => `
                                                <tr>
                                                    <td>${member.full_name}</td>
                                                    <td>${member.member_number}</td>
                                                    <td>${member.position}</td>
                                                    <td>${loan.loan_id}</td>
                                                    <td>${loan.loan_amount_borrowed}</td>
                                                    <td>${loan.interest}</td>
                                                    <td>${loan.amount_to_be_paid}</td>
                                                    <td>${loan.due_date}</td>
                                                    <td>${member.outstanding_balance_after_repayment}</td>
                                                </tr>
                                            `).join('');
                                        }).join('')
                                        :
                                        `<tr>
                                            <td colspan="6">No active salary advance loans</td>
                                        </tr>`
                                    }
                                </tbody>
                            </table> 

                        </div>

                        <div class="pending-approvalpvwUpdate">
                            <div class="my-details-tittle profile-tittle">
                                <p>Welfare Loan Installments  Due (REPAYMENTS)</p>
                            </div>
                            <table class="tbl">
                                <thead>
                                    <tr>
                                        <th>Full Name</th>
                                        <th>Member Number</th>
                                        <th>Position</th>
                                        <th>Loan ID</th>
                                        <th>Loan Amount Borrowed</th>
                                        <th>Installment</th>
                                        <th>Interest</th>
                                        <th>Amount Due</th>
                                        <th>Installment Due Date</th>
                                        <th>Outstanding Loan Principal</th>
                                        <th>Months Remaining</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.members.map(member => `
                                        ${member.welfare_loan_installment_due_repayments.map(welfareLoan => `
                                            <tr>
                                                <td>${member.full_name}</td>
                                                <td>${member.member_number}</td>
                                                <td>${member.position}</td>
                                                <td>${welfareLoan.loan_id}</td>
                                                <td>${welfareLoan.loan_amount_borrowed}</td>
                                                <td>${welfareLoan.installment}</td>
                                                <td>${welfareLoan.interest}</td>
                                                <td>${welfareLoan.amount_due}</td>
                                                <td>${welfareLoan.installment_due_date}</td>
                                                <td>${welfareLoan.outstanding_loan_principal}</td>
                                                <td>${welfareLoan.months_remaining}</td>
                                            </tr>
                                        `).join('')}
                                    `).join('')}
                                </tbody>
                            </table>
                        </div> 
                        <div class="pending-approvalpvwUpdate">
                            <div class="my-details-tittle profile-tittle">
                                <p>Welfare Revenue</p>
                            </div>
                            <table class = "tbl">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Before Balance</th>
                                        <th>Gain Adjustment</th>
                                        <th>After Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Welfare Income On Shares Contributed</td>
                                        <td>${data.overall_balances.total_welfare_shares_contribution_before}</td>
                                        <td>${data.overall_balances.total_welfare_shares_contribution_after - data.overall_balances.total_welfare_shares_contribution_before}</td>
                                        <td>${data.overall_balances.total_welfare_shares_contribution_after}</td>
                                    </tr>
                                    <tr>
                                        <td>Welfare Income On Benevolent Contributed</td>
                                        <td>${data.overall_balances.total_welfare_benovelent_contribution_before}</td>
                                        <td>${data.overall_balances.total_welfare_benovelent_contribution_after - data.overall_balances.total_welfare_benovelent_contribution_before}</td>
                                        <td>${data.overall_balances.total_welfare_benovelent_contribution_after}</td>
                                    </tr>
                                    <tr>
                                        <td>Welfare Income From Loan Interest</td>
                                        <td>${data.overall_balances.total_welfare_interest_before}</td>
                                        <td>${data.overall_balances.total_welfare_interest_after - data.overall_balances.total_welfare_interest_before}</td>
                                        <td>${data.overall_balances.total_welfare_interest_after}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                    // Update contribution changes
                    const rejectLink = document.getElementById("rejectLinkpvwUpdate");
                    const approveLink = document.getElementById("approveLinkpvwUpdate");

                    rejectLink.addEventListener("click", function (event) {
                        event.preventDefault();
                    
                        // Use SweetAlert for confirmation
                        Swal.fire({
                            title: 'Confirm Revert',
                            text: 'Are you sure you want to revert changes on contributions?',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, revert it!'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Perform the revert action here
                                // You can add your logic for reverting changes
                    
                                Swal.fire({
                                    icon: "success",
                                    title: "Revert Success!",
                                    html: `You have successfully reverted changes on contributions.`,
                                }).then(() => {
                                    location.reload();
                                });
                            }
                        });
                    });
                    
                    approveLink.addEventListener("click", function (event) {
                        event.preventDefault();
                    
                        // Use SweetAlert for confirmation
                        Swal.fire({
                            title: 'Confirm Update',
                            text: `Are you sure you want to update contributions for the end of the month (${getEndOfMonthDate()})?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, update it!'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                const url = approveLink.getAttribute("data-approvePvwMonthlyUpdate-url");
                    
                                // Fetch CSRF token from cookies
                                function getCookie(name) {
                                    const value = `; ${document.cookie}`;
                                    const parts = value.split(`; ${name}=`);
                                    if (parts.length === 2) return parts.pop().split(';').shift();
                                }
                    
                                fetch(`approve_pvwMonthlyUpdate_Contributions/`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRFToken': getCookie('csrftoken'),
                                    },
                                })
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error(`HTTP error! Status: ${response.status}`);
                                    }
                                    return response.json();
                                })
                                .then(data => {
                                    Swal.fire({
                                        icon: "success",
                                        title: "Contributions Updated!",
                                        html: `You have successfully updated <strong>${data.total_share_amount} KES </strong> shares, and <strong>${data.total_benevolent_amount} KES </strong> benevolent. New share balance <strong>${data.new_total_share_amount_balance} KES </strong> and new benevolent balance is <strong>${data.new_total_benevolent_amount_balance} KES </strong> .`,
                                    }).then(() => {
                                        location.reload();
                                    });
                                })
                                .catch(error => {
                                    console.error("Error:", error);
                                    Swal.fire({
                                        icon: "error",
                                        title: "Approval Failed!",
                                        text: "There was an error while updating the contributions. Please try again.",
                                    });
                                });
                            }
                        });
                    });
                    
                    // Function to get the end of the month date formatted as DD-MM-YYYY
                    function getEndOfMonthDate() {
                        const currentDate = new Date();
                        const endOfMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                        
                        const day = endOfMonthDate.getDate();
                        const month = endOfMonthDate.getMonth() + 1;
                        const year = endOfMonthDate.getFullYear();
                        
                        return `${day}-${month < 10 ? '0' : ''}${month}-${year}`;
                    }
                    
                    currentSectionpvwUpdate = 0;
                    sectionspvwUpdate = document.querySelectorAll('.pending-approvalpvwUpdate');
                    showSection(currentSectionpvwUpdate);
                    overlaypvwUpdate.style.display = 'flex';

                    // Hide the preloader after the data is fetched
                    hidePreloader();
                })
                .catch(error => console.error('Error fetching advance loan details:', error));
                // Hide the preloader in case of an error
                hidePreloader();

        }, 5000); // 5000 milliseconds (5 seconds) delay
    });
   
    
    popupCloseButtonpvwUpdate.addEventListener('click', function () {
        overlaypvwUpdate.style.display = 'none';
    });
    
    popupPrevButtonpvwUpdate.addEventListener('click', function () {
        showPrevSection();
    });
    
    popupNextButtonpvwUpdate.addEventListener('click', function () {
        showNextSection();
    });
    
})