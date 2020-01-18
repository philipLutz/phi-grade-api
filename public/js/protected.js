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

function display(section) {
	console.log(section);
	const allSections = [
		'all_grades', 'profile', 'encrypt', 'decrypt', 'edit_grade', 'other_profile'
	];
	for (let i=0; i<allSections.length; i++) {
		if (allSections[i] !== section) {
			$(`#${allSections[i]}`).attr("aria-hidden", "true");
			$(`#${allSections[i]}`).attr("hidden", "true");
		}
	}
	$(`#${section}`).attr("aria-hidden", "false");
	$(`#${section}`).removeAttr("hidden");
}

function getAllGrades() {
	$('#all_grades').empty();
	$.ajax({
		url: '/api/grades',
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		xhrFields: {
      withCredentials: true
   	},
		success: (data) => {
			console.log(data);
			for (let i=0; i<data.length; i++) {
				let grade = data[i].encrypted_string.substring(7);
				$('#all_grades').append(`
					<div class= "grade" id="${data[i].grade_id}">&Phi;${grade}</div>
				`);
			}
		},
		error: (error) => {
			console.log(error);
		}
	});
}

function getUser(user_id) {
	$('#profile').empty();
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
			$('#profile').append(`
				<div>first_name: ${data.first_name}</div>
				<div>last_name: ${data.last_name}</div>
				<div>bio: ${data.bio}</div>
			`);
		},
		error: (error) => {
			console.log(error);
		}
	});
	$.ajax({
		url: `/api/grades/all/${user_id}`,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		xhrFields: {
      withCredentials: true
   	},
		success: (data) => {
			console.log(data);
			$('#profile').append(`
				<div></div>
			`);
		},
		error: (error) => {
			console.log(error);
		}
	});
};

function getGrade(string) {
	$.ajax({
		url: `/api/grades/${string}`,
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
}

function logoutUser() {
	localStorage.removeItem('client_token');
	location.href = ('/');
};

$(() => {
	authorizeUser();
});

// GET User Profile
$('#show-profile').click(function(event) {
	event.preventDefault();
	// display('profile');
	getUser(parseJwt(localStorage.client_token).user_id);
	display('profile');
});

// GET All Grades
$('#phi').click(function(event) {
	event.preventDefault();
	// display('all_grades');
	getAllGrades();
	display('all_grades');
});

// Show Decrypt Form
$('#js-decrypt').click(event => {
	event.preventDefault();

});

//Logout User
$('#logout').click(function(event) {
	event.preventDefault();
	logoutUser();
});
