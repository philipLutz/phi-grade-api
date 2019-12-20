"use strict";

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
	})
});
