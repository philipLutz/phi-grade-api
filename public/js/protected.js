"use strict";

function parseJwt(token) {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace('-', '+').replace('_', '/');
	return JSON.parse(window.atob(base64));
};

function authorizeUser() {
	if (!localStorage.getItem('client_token')) {
		location.href = '/';
	}	else {
		console.log(parseJwt(localStorage.getItem('client_token')));
	}
};

function logoutUser() {
	localStorage.removeItem('client_token');
	location.href = ('/');
};

$(() => {
	authorizeUser();
});

//Logout User
$('#js-logout').click(function(event) {
	event.preventDefault();
	logoutUser();
});
