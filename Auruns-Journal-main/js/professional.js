/**
 * Handles the contact form submission.
 * Validates inputs and creates a mailto link.
 */
function sendMail() {
    // Grab the form and its input fields
    const form = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');

    // --- Simple checks for empty fields ---
    let isValid = true; // Assume form is valid initially
    let errors = [];    // Keep track of any errors found

    // Quick function to reset border style
    const resetBorder = (el) => el.style.borderColor = '';
    // Quick function to set border style to red
    const errorBorder = (el) => el.style.borderColor = 'red';

    // Check if name is empty
    if (!nameInput.value.trim()) {
        isValid = false;
        errors.push("Name is required.");
        errorBorder(nameInput); // Highlight the field
    } else {
        resetBorder(nameInput); // Reset highlight if fixed
    }

    // Check if email is empty or invalid format
    if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
        isValid = false;
        errors.push("A valid email address is required.");
        errorBorder(emailInput);
    } else {
        resetBorder(emailInput);
    }

    // Check if subject is empty
     if (!subjectInput.value.trim()) {
        isValid = false;
        errors.push("Subject is required.");
        errorBorder(subjectInput);
    } else {
        resetBorder(subjectInput);
    }

    // Check if message is empty
    if (!messageInput.value.trim()) {
        isValid = false;
        errors.push("Message is required.");
        errorBorder(messageInput);
    } else {
        resetBorder(messageInput);
    }

    // If any checks failed, show an alert and stop
    if (!isValid) {
        alert("Please correct the following errors:\n- " + errors.join("\n- "));
        return; // Don't proceed
    }

    // --- Prepare the email ---
    const recipientEmail = "Aurunb50@gmail.com"; // The email address to send to
    // Encode subject and body components to make them safe for a URL
    const subject = encodeURIComponent(subjectInput.value.trim());
    const body = encodeURIComponent(
        `Name: ${nameInput.value.trim()}\n` +
        `Email: ${emailInput.value.trim()}\n\n` +
        `Message:\n${messageInput.value.trim()}`
    );

    // Create the final mailto link
    const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    // Try to open the user's default email app using the mailto link
    window.location.href = mailtoLink;

    // Let the user know what happened (we can't guarantee the email was sent)
    alert("Your email application should open with the details pre-filled. Please review and send manually.");

    // Optional: Clear the form after attempting to open the mail client
    // form.reset();
}

/**
 * Basic check for email format using a regular expression.
 * Not foolproof, but catches common mistakes like missing '@' or '.'.
 * @param {string} email The email string to check.
 * @returns {boolean} True if it looks like a valid email structure, false otherwise.
 */
function validateEmail(email) {
  // A common pattern for email structure: characters@characters.characters
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Test the email against the pattern (case-insensitive)
  return re.test(String(email).toLowerCase());
}