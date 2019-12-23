"use strict";

// Button actions
$('#show-register').click(event => {
	event.preventDefault();
	$('#register-fail').empty();
	$('#login-fail').empty();
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
	$('#register-fail').empty();
	$('#login-fail').empty();
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
	registerNewUser(newUser);
}

function registerNewUser(user) {
	$('#register-fail').empty();
	$.ajax({
		url: '/api/users/register',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
			"email": `${user.email}`,
			"password": `${user.password}`,
			"first_name": `${user.firstName}`,
			"last_name": `${user.lastName}`,
			"private": `${user.private}`
		}),
		success: (data) => {
			login(user);
		},
		error: (...res) => {
			$('#register-fail').append(`
					<p>${res[0].status} ${res[0].statusText}</p>
					<p>${res[0].responseJSON.message}</p>
					<br>
			`);
		}
	});
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

// Login
function login(credentials) {
	$('#login-fail').empty();
	$.ajax({
		url: '/api/users/login',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
			"email": `${credentials.email}`,
			"password": `${credentials.password}`
		}),
		success: (res) => {
			localStorage.setItem('client_token', res[1].client_token);
			location.href = '/home.html';
		},
		error: (...res) => {
			$('#login-fail').append(`
					<p>${res[0].status} ${res[0].statusText}</p>
					<p>${res[0].responseJSON.message}</p>
					<br>
			`);
		}
	});
}

$('#login-form').submit(event => {
	event.preventDefault();
	const credentials = {
		email: $('input[name="login-email"]').val(),
		password: $('input[name="login-password"]').val()
	}
	login(credentials);
});

// Check if user has client auth token
$(function() {
	if (localStorage.getItem('client_token')) {
		location.href = '/home.html';
	}
});
