// //POP UP CONTAINERS
const okButton = document.getElementById('popupOkButton');
okButton.addEventListener('click', function () {
    const popupContainer = document.querySelector('.popup-container');
    const overlay = document.querySelector('.overlay');
    popupContainer.style.display = 'none';
    overlay.style.display = 'none';
});

// LOG SUCCESS POP UP
document.addEventListener('DOMContentLoaded', function () {
    const successOverlay = document.getElementById('successOverlay');
    const messagePopup = document.getElementById('messagePopup');
    const okButton = document.getElementById('popupCloseButton');
    // Check if the messagePopup should be displayed
    if (messagePopup) {
        // Show the overlay and messagePopup
        successOverlay.style.display = 'block';
        messagePopup.style.display = 'block';
        // Add event listener to the OK button
        okButton.addEventListener('click', function () {
            // Hide the overlay and messagePopup when OK is clicked
            successOverlay.style.display = 'none';
            messagePopup.style.display = 'none';
        });
    }
});





        
