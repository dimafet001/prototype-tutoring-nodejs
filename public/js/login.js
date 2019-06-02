$(document).ready(function() {


	$("#login-btn").click(function(e) {
		e.preventDefault();
	
		// putting the data together
		var data_str = "";

		//TODO: Fix before launching tho


		$.ajax({
			beforeSend: function() {
				// checking if forms are valid or should user change anything
				if ( !(emailIsValid($("input#email").val()) && $("input#password").val().length >= 8) ) {
					alert("Your email is not valid or your password is too short");
					return false;
					//TODO: Make it prettier than alert
				}
			},
			contentType: 'application/json',
			type: "POST",
			url: "login-student",
			data: JSON.stringify({	email : $("input#email").val(),
									password : $("input#password").val(),
									name : $("input#name").val(),
									school : $("input#school").val()
											})
		})
		.done(function (response) { 
			console.log(response);
			window.location.href = "feed";
		}).fail(function (jqXHR, textStatus, errorThrown) { window.location.href = "feed"; });

	});


});

function emailIsValid(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
