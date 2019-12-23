"use strict";

function parseJwt(token) {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace('-', '+').replace('_', '/');
	return JSON.parse(window.atob(base64));
};

function authorizeUser() {
	if (!localStorage.getItem('client_token')) {
		location.href = '/';
	};
};

function getUser(user_id) {
	// console.log(user_id);
	$.ajax({
		url: `/api/users/${user_id}`,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		xhrFields: {
      withCredentials: true
   	},
		success: (data) => {
			console.log(data);
		},
		error: (error) => {
			console.log(error);
		}
	});
};

function logoutUser() {
	localStorage.removeItem('client_token');
	location.href = ('/');
};

$(() => {
	authorizeUser();
});

// GET User PROFILE
$('#show-profile').click(function(event) {
	event.preventDefault();
	getUser(parseJwt(localStorage.client_token).user_id);
});

//Logout User
$('#logout').click(function(event) {
	event.preventDefault();
	logoutUser();
});
