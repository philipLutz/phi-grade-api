"use strict";

function authorizeUser() {
	const token = localStorage.getItem('authToken');
	if (!token) {
		location.href = '/';
	}
};

function logoutUser() {
	localStorage.removeItem('authToken');
	location.href = ('/');
};

$(() => {
	authorizeUser();
});

//Logout User
$('#js-logout').click(function(event) {
	event.preventDefault();
	console.log('log out click');
	logoutUser();
});