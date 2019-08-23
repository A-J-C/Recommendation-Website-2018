/* AUTHOR: mxcm21	*/
/* CONTAINS LOGIN SPECIFIC FUNCTIONALITY */

$( document ).ready(function() {

	// prevent caching
	$.ajaxSetup({ cache: false });

	// tool tip
	$("#btnRegister").tooltip();

	// initialise to English to begin with
	updateLanguage("English");

	/* LOGIN FUNCTIONALITY */
	$("#btnLogin").click(function(event) {

		var loginForm = document.getElementById('loginForm');

		if (loginForm.checkValidity() === false) {
		  event.preventDefault();
		  event.stopPropagation();
		} else {
			$(".regErrors").hide();																										// hide any errors

			event.preventDefault();																										// prevent default submission

			/* get all form inputs */
			var entries = {};
			$.each($('#loginForm').serializeArray(), function(i, field) {
			    entries[field.name] = field.value;
			});

			/* post form inputs as JSON */
			$.post("/login", JSON.stringify(entries), function(data){
				if (data == "Invalid User") {
					$("#uError").show();																								// show error and stay on page
				} else {
					window.location.reload(); 																							// reload as now logged in
				}
			});
		}

		$("#loginForm").addClass('was-validated');
  });

	/* SWAPS FORMS*/
	$("#loginHead").click(function(event) {
		$("#loginForm").show();
		$("#registerForm").hide();
		$(this).removeClass("unselected");
		$("#registerHead").addClass("unselected");
  });

	$("#registerHead").click(function(event) {
		$("#registerForm").show();
		$("#loginForm").hide();
		$(this).removeClass("unselected");
		$("#loginHead").addClass("unselected");
  });

	/* REGISTER FUNCTIONALITY */
	$('#registerForm').submit(function(event) {
		$(".regErrors").hide();																											// hide any errors

		event.preventDefault();																											// prevent default submission

		/* get all form inputs */
		var entries = {};
		$.each($('#registerForm').serializeArray(), function(i, field) {
		    entries[field.name] = field.value;
		});

		/* post form inputs as JSON */
		$.post("/register", JSON.stringify(entries), function(data){
			if(data != "success") {
				warnings = data.split(" ")
				// no need for footer
				$("#registerFooter").hide();
				/* show warnings */
				for (e in warnings) {
					if (warnings[e] == "username") {
						$("#usernameError").show();
					} else if (warnings[e] == "user") {
						$("#userIDError").show();
					}
				}
			} else {
				// get home page if successful
				location.reload();
			}
		});
	});

});
