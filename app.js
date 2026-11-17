// MG WATCH & EARN
// Website basic functions

document.addEventListener("DOMContentLoaded", function () {

    console.log("MG WATCH & EARN is running!");

    // Welcome message
    const registerButton = document.querySelector("#account button");

    if (registerButton) {
        registerButton.addEventListener("click", function () {
            alert("Welcome to MG WATCH & EARN! Registration is coming soon.");
        });
    }

});
