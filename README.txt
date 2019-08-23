Author: mxcm21

========== ESSENTIAL INSTRUCTIONS ==========

1) Ensure all dependencies are installed:
	- Flask (and it's sub-dependencies)
	- Pandas 
	- An internet connection is required as website dependencies are taken from CDN's, specifically for:
		- jQuery v3.3.1
		- Bootstrap v4.1.3
		- Popper.js v1.14.3
		- FontAwesome v5.3.1

	- An internet connection is also required as my solution makes API calls to TheMovieDB.org for additional information

2) Run on command line (can't be run from IDLE):
	- python3 personalisedMovies.py [portNumber]
	- where portNumber is an optional parameter specifying the port to run on
	- portNumber defaults to 5000, and returns an error if port is already in use
	Note: some portNumber's will be blocked by firewall rules, so best to use 5000/8000/8080

3) Access website via: http://127.0.0.1:5000/  (or your chosen portNumber)
   - or by http://localhost:5000/
	 - Website is fully compatible and tested with Chrome, Firefox and Edge (IE is not supported)

Acknowledgments:
For use of the MovieLens dataset (the smaller set was used for efficiency reasons,  but code could easily be adapted for the full dataset):
F. Maxwell Harper and Joseph A. Konstan. https://grouplens.org/datasets/movielens/latest/

For use of TheMovieDB API:
https://www.themoviedb.org/

Aswell as the lecture content I followed the following three tutorials to help inform me about recommendation techniques:
https://medium.com/@james_aka_yale/the-4-recommendation-engines-that-can-predict-your-movie-tastes-bbec857b8223 , Accessed 31/11/2018
https://beckernick.github.io/matrix-factorization-recommender/ , Accessed 31/11/2018
https://stackabuse.com/creating-a-simple-recommender-system-in-python-using-pandas/ , Accessed 31/11/2018

========== FEATURES (194 words) ==========

==== Dataset:
- MovieLens
- csv for interface users 
- smaller set for memory-efficiency, easily scalable 
- link to TMDB-API

==== Profiling:
- user has: Username, email, language, MovieLensID
- update functionality under "Profile"
- can create new ID to start off with no previous ratings 
- saved to csv files for persistency
- language change via dropdown
- Flask handles login/out cookies

==== Recommendations:
1) TopRecommendations
	- matrix-factorisation, interface shows predicted-rating
2) WatchAgain
	- previously rated sorted by rating/timestamp
3) Search
	- Matrix-Factorisation displays predicted-rating
	- table sorted by rating/predictedRating
	- filter by genre, and/or partial/full search-term
	- tags included, searching "pixar" returns movies tagged as pixar

Movie Modal:
	- extra information (viaTMDB)
    - list of similar movies, via item-item-collaborative-filtering
	- matrix-factorisation used to give predicted-rating if no user-rating is available

==== Personalised:
- full translation
- language specific poster

4 options which demonstrating full utf-8 characterset
- appropriate meta tags showing site has i18n features

==== Interface:
- AJAX/JSON communication to dynamically load information/translations
- clicking rows provides seamless modals
- instead of rebuilding Matricx-Factorisation-matricies every time a new rating is added, user can refresh as needed
- language-specific information message is displayed
- responsive design (jQuery/Bootsrap)
