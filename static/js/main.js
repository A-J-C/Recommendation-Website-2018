/* AUTHOR: mxcm21	*/
/* CONTAINS MAIN FUNCTIONS USED ACROSS WEBSITE */

$( document ).ready(function() {

	// prevent caching
	$.ajaxSetup({ cache: false });

	// update page on load
	updatePage();

	// load recommnedations into page on load
	refreshRecommendations();

	// tool tip
	$("#refresh").tooltip();

	/* TOGGLES WELCOME MESSAGE */
  $("#collapseWelcome").click(function() {
    $("#welcome").toggleClass("toggle");
		$("#collapseWelcome .arrow").toggleClass("down");
  });

	/* TOGGLES ADVANCED SEARCH */
	$("#advanced").click(function() {
    $("#filters").toggle();
		$("#advanced .arrow").toggleClass("down");
  });

	/* TOGGLES GENRE SELECTION */
	$(".genre").click(function() {
    $(this).toggleClass("selected");
  });

	$("#allOn").click(function() {
    $(".genre").addClass("selected");
  });

	$("#allOff").click(function() {
    $(".genre").removeClass("selected");
  });

	/* FOR SETTINGS PANEL */
	$("#username, #email, #dropdownLanguage").on('change', function(e) {
		// if username or email have an input, not the same as the placeholder
		// or if thing that changed was language
		if(($("#username").val() &&
			$("#username").val() != $("#username").attr("placeholder")) ||
			($("#email").val() &&
			$("#email").val() != $("#email").attr("placeholder")) ||
			$(this).attr('id') == "dropdownLanguage")	{

			$("#settingsSave").removeClass("disabled");
		} else {
			$("#settingsSave").addClass("disabled");
		}
	});

	$("#settingsSave").click(function() {
		// check it isn't disabled
		if(!$(this).hasClass("disabled")) {
			$(".regErrors").hide();    																								// hide all warnings

			// only interested in checking this input
			if (!$("#username").val()) {
				$("#usernameError").show();
			} else {
				var entries = {};
				$.each($('#registerForm').serializeArray(), function(i, field) {
						entries[field.name] = field.value;
				});

				// add ID
				entries['user'] = $("#idNo").text();

				$.post("/edit", JSON.stringify(entries), function(data){
					if (data == "error") {
						$("#usernameError").show();																					// show error
					} else {
						$("#settingsModal").modal("hide");
						updatePage();
						message("profile", []);
					}
				});
			}
		}
	});

	/* UPDATES PAGE DYNAMICALLY */
	function updatePage() {
		$.get("/userInfo", function(data){
			$(".userName").text(data['username']);
			$("#username").attr("placeholder", data['username']);
			$("#username").attr("value", data['username']);
			$("#email").attr("placeholder", data['email']);
			$("#email").attr("value", data['email']);
			$("#dropdownLanguage").val(data['language']);
		});

		updateLanguageForUser();
	}

	/* SWITCHING LANGUAGES */
	/* when a language option is clicked */
	$(".lang").click(function() {
		var language = $(this).text();

		// updates language for user if logged in
		$.post("/updateLanguage", JSON.stringify(language), function(data){
			// if user isn't logged in then update manually
			if(data == "noUser") {
				updateLanguage(language);
			} else {
				// else run update for whole page
				updatePage();
				message("language", []);
			}
		});
	});

	/* DISMISSING MESSAGES */
	$("#alertArea").on('click', '.alert-dismissible', function() {
		$(this).alert("close")
	});

	/* APPLYING RATINGS */
	$("body").on('click', '.starContainer span', function() {

		// grab information
		data = {
			"rating" : $(this).attr('data-rating-value'),
			"title" : $(this).parent().attr('data-title')
		}

		// set parent to new rating
		$(this).parent().removeClass("highlight0 highlight1 highlight2 highlight3 " +
			"highlight4 highlight5 dim").addClass("highlight"+data["rating"]);

		// updates ratings for user
		$.post("/updateRating", JSON.stringify(data), function(resp){
			// if user isn't logged in then update manually
			if(resp != "error") {
				refreshRecommendations();
				message("rating", data);
			}
		});
	});

	/* SEARCH FUNCTIONALITY */
	$('#searchBar').submit(function(event) {
		event.preventDefault();		// prevent default submission
		getSearch(true);
	});

	/* REGNERATING RECOMMENDATIONS FUNCTIONALITY */
	$('.recommendations').click(function() {
		// updates ratings for user
		$.post("/updateMatrix", "", function(resp) {
			// if user isn't logged in then update manually
			if(resp != "error") {
				refreshRecommendations();
				message("update");
			};
		});
	});

	/* MOVIE MODAL LOGIC */
	$("body").on("click", "tr td:first-child, tr td:nth-child(2)", function() {
		popUpMovie(this);
	});
});

/* makes sure alert message is in correct language */
function message(type, extra) {
	$.ajax({
		url: "/userInfo",
		method: "GET",
		cache: false,
		success: function(data) {
			// would error if not logged in
			if (data != "error") {
				var language = data['language'];
				if (type == "language") {
					switch(language) {
						case "English": addAlert("Update", "Saved English as new Language choice"); break;
						case "Français": addAlert("Mettre à jour", "Enregistré Français comme nouveau choix de langue"); break;
						case "Deutsch": addAlert("Aktualisieren", "Gerettet Deutsch als neue Sprachwahl"); break;
						case "русский": addAlert("Обновить", "Сохраненный русский как новый выбор языкаe"); break;
					}
				} else if (type == "profile") {
					switch(language) {
						case "English": addAlert("Update", "Your profile has been updated"); break;
						case "Français": addAlert("Mettre à jour", "votre profil a été mis a jour"); break;
						case "Deutsch": addAlert("Aktualisieren", "Ihr Profil wurde aktualisiert"); break;
						case "русский": addAlert("Обновить", "Ваш профиль был обновлен"); break;
					}
				} else if (type == "rating") {
					switch(language) {
						case "English": addAlert("Rating", "Your rating of " + extra["rating"] + " for " + extra["title"] + " has been saved."); break;
						case "Français": addAlert("Évaluation", "Votre note de " + extra["rating"] + " pour " + extra["title"] + " a été enregistré."); break;
						case "Deutsch": addAlert("Bewertung", "Ihre Bewertung von " + extra["rating"] + " zum " + extra["title"] + " wurde gespeichert."); break;
						case "русский": addAlert("Рейтинг", "Ваш рейтинг " + extra["rating"] + " за " + extra["title"] + " сохранено."); break;
					}
				} else if (type == "search") {
					switch(language) {
						case "English": addAlert("Search", "Your search returned " + extra["number"] + " results in " + extra["time"] + " seconds."); break;
						case "Français": addAlert("Chercher", "Votre recherche a renvoyé " + extra["number"] + " résulte en " + extra["time"] + " secondes."); break;
						case "Deutsch": addAlert("Suche", "Ihre Suche wurde zurückgegeben " + extra["number"] + " führt in " + extra["time"] + " Sekunden."); break;
						case "русский": addAlert("Поиск", "Ваш поиск возвращен " + extra["number"] + " приводит к " + extra["time"] + " секунд."); break;
					}
				} else if (type == "update") {
					switch(language) {
						case "English": addAlert("Update", "Updated recommendation algorithms!"); break;
						case "Français": addAlert("Mettre à jour", "Algorithmes de recommandation mis à jour!"); break;
						case "Deutsch": addAlert("Aktualisieren", "Aktualisierte Empfehlungsalgorithmen!"); break;
						case "русский": addAlert("Обновить", "Обновлены алгоритмы рекомендаций!"); break;
					}
				}
			}
		}
	});
}


/* given a message adds a new alert */
function addAlert(msgBold, msg) {
	alert = "<div class='alert alert-success alert-dismissible fade show' role='alert'> " +
		"<strong>" + msgBold + ": </strong>" + msg +
		"<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
		"  <span aria-hidden='true'>&times;</span> " +
		"</button>" +
	"</div>";

	// add it and automatically disapear after 5 seconds
	$(alert).appendTo("#alertArea").fadeTo(5000, 0.5, function() {
		$(this).hide();
	});
}
