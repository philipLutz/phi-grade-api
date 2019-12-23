"use strict";

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

// GET All grades
$('#get').click(event => {
	event.preventDefault();
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
		},
		error: (error) => {
			console.log(error);
		}
	});
});

// Show Decrypt Form
$('#js-decrypt').click(event => {
	event.preventDefault();
	
});
