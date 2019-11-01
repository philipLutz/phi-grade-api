"use strict";

function authorizeUser() {
	const token = localStorage.getItem('authToken');
	if (!token) {
		location.href = '/';
	}
};

function logoutUser() {
	localStorage.removeItem('authToken');
	window.location.href = ('/')
};

// $(() => {
// 	authorizeUser();
// });

//Logout User
// $('.js-logout-button').click(function(event) {
// 	event.preventDefault();
// 	logoutUser();
// });