/* AUTHOR: mxcm21	*/
/* CONTAINS JS USED FOR INTERNATIONALISATION */

/* updates page given specific language */
function updateLanguage(origLanguage) {

	lang = {
		"English" : "English",
		"Français" : "French",
		"Deutsch" : "German",
		"русский" : "Russian"
	}

	// $.getJSON doesn't use UTF-8 for sending the URL causing errors
	// so we have to send a Latin alphabet version instead
	language = lang[origLanguage];

	// get json file for language
	$.getJSON("/static/i18n/" + language + ".json", function(data) {
		// loop through every span with langKey attribute
		$("span[data-langKey]").each(function() {
			var langKey = $(this).attr('data-langKey');
			if (data[langKey]) {
				$(this).html(data[langKey]);
			}
		});

		// set other fields
		$("#dropdownLanguage").val(origLanguage);
		$("#usernameLogin").attr("placeholder", data["username"]);
		$("#usernameReg").attr("placeholder", data["username"]);
		$("#emailReg").attr("placeholder", data["email"]);
		$("#searchField").attr("placeholder", data["searchField"]);
		$("#refresh").attr("title", data["tooltip"]);
		$("#refresh").attr("data-original-title", data["tooltip"]);
		$("#btnRegister").attr("title", data["regTooltip"]);
		$("#btnRegister").attr("data-original-title", data["regTooltip"]);
		$(document).attr("title", data["Movies"]);
	});
}

/* updates language by getting the users current language and updating page */
function updateLanguageForUser() {

	// ajax used so we can disbale cache
	$.ajax({
		url: "/userInfo",
		method: "GET",
		cache: false,
		success: function(data) {
			// would error if not logged in
			if (data != "error") {
				var language = data['language'];
				updateLanguage(language);
				refreshRecommendations();
			}
		}
	});
}
