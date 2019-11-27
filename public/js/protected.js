"use strict";

function parseJwt(token) {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace('-', '+').replace('_', '/');
	return JSON.parse(window.atob(base64));
};

function authorizeUser() {
	const token = localStorage.getItem('token');
	if (!token) {
		location.href = '/';
	}
};

function logoutUser() {
	localStorage.removeItem('token');
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