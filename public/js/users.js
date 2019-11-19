"use strict";

$('#show-register').click(event => {
	event.preventDefault();
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
	$('#show-login').attr("aria-hidden", "true");
	$('#show-login').attr("hidden", "true");
	$('#register-form').attr("aria-hidden", "true");
	$('#register-form').attr("hidden", "true");
	$('#show-register').attr("aria-hidden", "false");
	$('#show-register').removeAttr("hidden");
	$('#login-form').attr("aria-hidden", "false");
	$('#login-form').removeAttr("hidden");
});

