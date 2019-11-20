"use strict";

// Button actions
$('#show-register').click(event => {
	event.preventDefault();
	$('#tagline').attr("aria-hidden", "true");
	$('#tagline').attr("hidden", "true");
	$('#show-register').attr("aria-hidden", "true");
	$('#show-register').attr("hidden", "true");
	$('#login-form').attr("aria-hidden", "true");
	$('#login-form').attr("hidden", "true");
	$('#show-login').attr("aria-hidden", "false");
	$('#show-login').removeAttr("hidden");
	$('#register-form').attr("aria-hidden", "false");
	$('#register-form').removeAttr("hidden");
});

$('#show-login').click(event => {
	event.preventDefault();
	$('#tagline').attr("aria-hidden", "true");
	$('#tagline').attr("hidden", "true");
	$('#show-login').attr("aria-hidden", "true");
	$('#show-login').attr("hidden", "true");
	$('#register-form').attr("aria-hidden", "true");
	$('#register-form').attr("hidden", "true");
	$('#show-register').attr("aria-hidden", "false");
	$('#show-register').removeAttr("hidden");
	$('#login-form').attr("aria-hidden", "false");
	$('#login-form').removeAttr("hidden");
});

$('#privacy-button').click(event => {
	event.preventDefault();
	const state = document.getElementById("private-input").checked;
	if (state) {
		document.getElementById("privacy-button").style.backgroundColor = "#181B1B";
		document.getElementById("privacy-button").style.color = "#CECACA";
		document.getElementById("private-input").checked = false;
		document.getElementById("not-private-input").checked = true;
	}	else {
		document.getElementById("privacy-button").style.backgroundColor = "#CECACA";
		document.getElementById("privacy-button").style.color = "#181B1B";
		document.getElementById("private-input").checked = true;
		document.getElementById("not-private-input").checked = false;
	}
});

// Register Request
function createNewUser() {
	let isPrivate = false;
	if ($('input[id="private-input"]').is(':checked')) {
		isPrivate = true;
	}
	const newUser = {
		email: $('input[name="email"]').val(),
		password: $('input[name="password"]').val(),
		firstName: $('input[name="first_name"]').val(),
		lastName: $('input[name="last_name"]').val(),
		private: isPrivate
	};
	postNewUser(newUser);
}

function postNewUser(user) {

}

$('#register-form').submit(event => {
	event.preventDefault();
	$('#password-error').attr("aria-hidden", "true");
	$('#password-error').attr("hidden", "true");
	let password1 = $('input[name="password"]').val();
	let password2 = $('input[name="verify_password"]').val();
	if (password1 === password2) {
		createNewUser();
	}	else {
		$('#password-error').attr("aria-hidden", "false");
		$('#password-error').removeAttr("hidden");

	}
});

