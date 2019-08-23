/* AUTHOR: mxcm21	*/
/* CONTAINS JS USED FOR GETTING RECOMMENDATIONS */

dict = {
	"English" : {
		"Advanced": "Advanced",
	  "Action": "Action",
	  "Adventure": "Adventure",
	  "Animation": "Animation",
	  "Children": "Children",
	  "Comedy": "Comedy",
	  "Crime": "Crime",
	  "Documentary": "Documentary",
	  "Drama": "Drama",
	  "Fantasy": "Fantasy",
	  "Film-Noir": "Film-Noir",
	  "Horror": "Horror",
	  "Musical": "Musical",
	  "Mystery": "Mystery",
	  "Romance": "Romance",
	  "Sci-Fi": "Sci-Fi",
	  "Thriller": "Thriller",
	  "War": "War",
	  "Western": "Western",
		"showing": "Showing",
		"to": "to",
		"of": "of",
		"entries": "entries",
		"previous": "Previous",
		"next": "Next",
		"minutes": " minutes",
		"noData": "No data available, try rating a few movies",
		"noResults": "No movies found matching those search parameters",
		"notEnough": "Not enough data to return similar movies"},
	"Français" : {
		"Advanced": "Avancée",
		"Action": "Action",
		"Adventure": "Aventure",
		"Animation": "Animation",
		"Children": "Enfants",
		"Comedy": "Comédie",
		"Crime": "Criminalité",
		"Documentary": "Documentaire",
		"Drama": "Drame",
		"Fantasy": "Fantaisie",
		"Film-Noir": "Film-Noir",
		"Horror": "Horreur",
		"Musical": "Musical",
		"Mystery": "Mystère",
		"Romance": "Amour",
		"Sci-Fi": "Sci-Fi",
		"Thriller": "Thriller",
		"War": "Guerre",
		"Western": "Occidental",
		"showing": "Montrant",
		"to": "à",
		"of": "de",
		"entries": "les entrées",
		"previous": "Précédent",
		"next": "Suivant",
		"minutes": " minutes",
		"noData": "Pas de données disponibles, essayez de noter quelques films",
		"noResults": "Aucun film trouvé correspondant à ces paramètres de recherche",
		"notEnough": "Pas assez de données pour retourner des films similaires"},
	"Deutsch" : {"Advanced": "Erweiterte",
	  "Action": "Aktion",
	  "Adventure": "Abenteuer",
	  "Animation": "Animation",
	  "Children": "Kinder",
	  "Comedy": "Komödie",
	  "Crime": "Kriminalität",
	  "Documentary": "Dokumentarfilm",
	  "Drama": "Dramatik",
	  "Fantasy": "Fantasie",
	  "Film-Noir": "Film-Noir",
	  "Horror": "Grusel",
	  "Musical": "Musikalisch",
	  "Mystery": "Geheimnis",
	  "Romance": "Romantik",
	  "Sci-Fi": "Sci-Fi",
	  "Thriller": "Krimi",
	  "War": "Krieg",
	  "Western": "Westlich",
		"showing": "Anzeigen",
		"to": "zu",
		"of": "de",
		"entries": "einträge",
		"previous": "Bisherige",
		"next": "Nächster",
		"minutes": " Protokoll",
		"noData": "Keine Daten verfügbar. Versuchen Sie, ein paar Filme zu bewerten",
		"noResults": "Es wurden keine Filme gefunden, die diesen Suchparametern entsprechen",
		"notEnough": "Nicht genug Daten, um ähnliche Filme zurückzugeben"},
	"русский" : {
		"Advanced": "Расширенный",
	  "Action": "действие",
	  "Adventure": "Приключения",
	  "Animation": "Анимация",
	  "Children": "Детская",
	  "Comedy": "Комедия",
	  "Crime": "Преступность",
	  "Documentary": "Документальный фильм",
	  "Drama": "Драма",
	  "Fantasy": "Фэнтези",
	  "Film-Noir": "Фильм нуар",
	  "Horror": "Ужас",
	  "Musical": "музыкальный",
	  "Mystery": "тайна",
	  "Romance": "романс",
	  "Sci-Fi": "научная фантастика",
	  "Thriller": "Триллер",
	  "War": "война",
		"showing": "показ",
		"to": "в",
		"of": "из",
		"entries": "записи",
		"previous": "предыдущий",
		"next": "следующий",
		"minutes": " минут",
		"noData": "Нет данных, попробуйте оценить несколько фильмов",
		"noResults": "Не найдено ни одного фильма, соответствующего этим параметрам поиска",
		"notEnough": "Недостаточно данных для возврата похожих фильмов"}
}

var currentLanguage = "English";

var lookUp = {
	"English" : "en",
	"Deutsch" : "de",
	"Français" : "fr",
	"русский" : "ru"
}

/* populates given table with data */
function populate(table, data) {
	data = JSON.parse(data); 																														// convert back to array

	extraClass = (table == "#topRecommendations") ? "dim" : "";
	
	lan = dict[currentLanguage];
	
	// handles Table pagination
	var table = $(table).DataTable({
		"destroy": true,
		"searching": false,
		"ordering": false,
		"aaSorting": [],
		"autoWidth": false,
		"columnDefs": [
			{"width" : "50%", "targets" : 0},
			{"width" : "35%", "targets" : 1},
			{"width" : "15%", "targets" : 2}
		],
		"language": {
			"paginate": {
				"previous": lan["previous"],
				"next": lan["next"]
			},
			"info" : lan["showing"] + " _START_ " + lan["to"] + " _END_ " + lan["of"] + " _TOTAL_ " + lan["entries"],
			"emptyTable":  lan["noData"],
			"infoEmpty": lan["showing"] + " 0 " + lan["to"] + " 0 " + lan["of"] + " 0 " + lan["entries"]
		}
	});

	table.clear().draw(); 																															// clear the table
	
	for (e in data) {																																// loop through all movies

		movie = data[e];																															// get movie

		genre = movie[2].split("|");

		for (w in genre)
			genre[w] = lan[genre[w]];

		genre = genre.join(", ");
		rating = Math.ceil(movie[3]);

		item = [movie[1], genre,																													// new row
			"<div class='starContainer "+ extraClass + " highlight" + rating + "' " +
			"data-tmdbId='"+ movie[4] +"' " +
			"data-title='"+ movie[1] +"'>" +
		  "<span data-rating-value='1' class='fas fa-star'></span> " +
		  "<span data-rating-value='2' class='fas fa-star'></span> " +
		  "<span data-rating-value='3' class='fas fa-star'></span> " +
		  "<span data-rating-value='4' class='fas fa-star'></span> " +
		  "<span data-rating-value='5' class='fas fa-star'></span> " +
		"</div>"];

		table.row.add(item);            																											// add to Data Table
	}

	table.draw();																																	// redraw columns
}


/* updates Top Recommendations table */
function getRecommended() {

	// ajax used so we can disbale cache
	$.ajax({
		url: "/getRecommended",
		method: "GET",
		cache: false,
		success: function(data) {
			// would error if not logged in
			if (data != "error") {
				populate("#topRecommendations", data);
			}
		}
	});
}

/* updates Watch Again table */
function getWatched() {

	// ajax used so we can disbale cache
	$.ajax({
		url: "/getWatched",
		method: "GET",
		cache: false,
		success: function(data) {
			// would error if not logged in

			if (data != "error") {
				populate("#watchAgain", data);
			}
		}
	});
}

/* updates Search Results table */
function getSearch(showMessage = false) {

	var categories = [];
	$("#filters .badge-pill.selected span").each(function() {
		categories.push($(this).attr('data-langKey'));
	});

	var term = $("#searchField").val().toLowerCase()
	var terms =  term.split(" ");
	var tags =  $("#userTags").is(':checked');
	var full =  $("#phrase").is(':checked');

	// ajax used so we can disbale cache
	$.ajax({
		url: "/get_all",
		method: "GET",
		cache: false,
		success: function(data) {
			// would error if not logged in
			var time = Date.now();

			if (data != "error") {

				data = JSON.parse(data); 																										// convert back to array

				// handles Table pagination
				var table = $("#searchTable").DataTable({
					"destroy": true,
					"searching": false,
					"order": [[2, "desc"]],
					"autoWidth": false,
					"columnDefs": [
						{"width" : "50%", "targets" : 0},
						{"width" : "35%", "targets" : 1},
						{"width" : "15%", "targets" : 2},
						{"orderable": false, "targets": "_all"}
					],
					"language": {
						"paginate": {
						  "previous": lan["previous"],
						  "next": lan["next"]
						},
						"info" : lan["showing"] + " _START_ " + lan["to"] + " _END_ " + lan["of"] + " _TOTAL_ " + lan["entries"],
						"emptyTable":  lan["noResults"],
						"infoEmpty": lan["showing"] + " 0 " + lan["to"] + " 0 " + lan["of"] + " 0 " + lan["entries"]
					 }
				});
				

				table.clear().draw(); 																											// clear the table

				lan = dict[currentLanguage];
				number = 0;
				for (e in data) {																												// loop through all movies
					movie = data[e];																											// get movie

					genres = movie[2].split("|");																								// split genres into list
					genres = genres.concat(categories); 																						// concatenate the two lists

					// in case movie doesn't have any tags
					if (movie[4] == null)
						movie[4] = "";

					var title = movie[1].replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();

					// checks if the movie has a genre that we are interested in
					if (((new Set(genres)).size != genres.length) && (term == ""
							|| (!full && terms.some(substring => (" " + title + " ").includes(" " + substring + " ")))
							|| (full && (title).includes(term))
							|| (!full && tags && terms.some(substring => (" " + movie[4].toLowerCase() + " ").includes(" " + substring + " ")))
							|| (full && tags && (movie[4].toLowerCase()).includes(term)))) {

						number ++;
						extraClass = "";

						// translate genre
						genre = movie[2].split("|");

						for (w in genre)
							genre[w] = lan[genre[w]];

						genre = genre.join(", ");

						// use predicted rating if we don't have a rating
						rating = Math.ceil(movie[3]);

						if (rating == 0) {
							rating = Math.ceil(movie[5]);
							extraClass = "dim"
						}

						item = [movie[1], genre,																									// new row
							"<div class='starContainer "+ extraClass + " highlight" + rating + "' " +
							"data-tmdbId='"+ movie[7] +"' " +
							"data-title='"+ movie[1] +"'>" +
							"<span data-rating-value='1' class='fas fa-star'></span> " +
							"<span data-rating-value='2' class='fas fa-star'></span> " +
							"<span data-rating-value='3' class='fas fa-star'></span> " +
							"<span data-rating-value='4' class='fas fa-star'></span> " +
							"<span data-rating-value='5' class='fas fa-star'></span> " +
							"<span class='hidden'>" + rating + "</span> " +
						"</div>"];

						table.row.add(item);            																							// add to Data Table

						if (number > 500)
							break;
					}
				}
				table.draw();																														// redraw columns
			}

		output = {
			"number": number,
		  "time" : ((Date.now() - time) / 1000)
		};

		if (showMessage)
			message("search", output);
	}
	});
}

/* pop up movie when clicked on */
function popUpMovie(elem) {
	parent = $(elem).parent();
	var title = parent.find("td:first-child").text();
	var movieID = parent.find("td:nth-child(3) div").attr('data-tmdbId');
	var rating = parent.find("td:nth-child(3)").html();

	$.getJSON("https://api.themoviedb.org/3/movie/" + movieID + "?api_key=179888c2888c0074bf9579eb0dfca026&language=" + lookUp[currentLanguage], function(tmdb) {
		if (tmdb) {
			var toAdd = "<img src='http://image.tmdb.org/t/p/w185"+tmdb.poster_path+"'/>";
			toAdd += "<div class='movieRight'>";
			toAdd += rating;
			toAdd += "<div id='movieRating'>" + tmdb.vote_average * 10 + "<span id='percent'>%</span> </div>";
			toAdd += "<div id='movieRelease'>" + new Date(tmdb.release_date).toLocaleDateString() + "</div>";
			toAdd += "<div id='movieRuntime'>" + tmdb.runtime + lan["minutes"] + "</div>";
			toAdd += "<div id='movieOverview'>" + tmdb.overview + "</div>";
			toAdd += "</div>";

			// add our info in
			$("#movieModal #movieBody").html(toAdd);

			// empty table
			$("#simliarMovies tbody").html("");

			$.ajax({
				url: "/getSimilar",
				method: "GET",
				data: {"title" : title},
				cache: false,
				success: function(data) {
					// would error if not logged in
						
					if (data != "error") {
						lan = dict[currentLanguage];
						data = JSON.parse(data); 																								// convert back to array

						for (e in data) {																										// loop through all movies

							movie = data[e];																									// get movie
							genre = movie[1].split("|");

							for (w in genre)
								genre[w] = lan[genre[w]];

							genre = genre.join(", ");
							rating = Math.ceil(movie[2]);

							if (rating == 0) {
								rating = Math.ceil(movie[3]);
								extraClass = "dim"
							}

							item = "<tr>" +																										// new row
								"<td>" + movie[0] + "</td>" +
								"<td>" + genre + "</td>" +
								"<td>" +
									"<div class='starContainer "+ extraClass + " highlight" + rating + "' " +
									"data-tmdbId='"+ movie[4] +"' " +
									"data-title='"+ movie[0] +"'>" +
								  "<span data-rating-value='1' class='fas fa-star'></span> " +
								  "<span data-rating-value='2' class='fas fa-star'></span> " +
								  "<span data-rating-value='3' class='fas fa-star'></span> " +
								  "<span data-rating-value='4' class='fas fa-star'></span> " +
								  "<span data-rating-value='5' class='fas fa-star'></span> " +
								"</div></td>";

							$("#simliarMovies tbody").append(item);            																	// append movie to table
						}
						
						// if no results were returned
						if(data.length == 0) {
							$("#simliarMovies tbody").append(lan["notEnough"]);
						}
					}
				}
			});
		}
	});

	$("#movieModal #movieModalTitle").text(title);
	$("#movieModal").modal("show");
}

/* refreshes the Top Recommendations and Watch Again tables */
function refreshRecommendations() {
	// only want to run these if we are on the home page
	if ($("#searchField").length != 0) {
		$.ajax({
			url: "/userInfo",
			method: "GET",
			cache: false,
			success: function(resp) {
				// would error if not logged in
				if (resp != "error") {
					currentLanguage = resp['language'];
					getRecommended();
					getWatched();
					getSearch();
				}
			}
		});
	}
}
