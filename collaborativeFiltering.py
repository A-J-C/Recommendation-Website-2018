#
# AUTHOR: mxcm21
# Date: 01/12/2018
#
# FUNCTIONALITY: reads in MovieLensDB and uses item-item collaborative filtering
#    to provide recommendations based on a particular Movie.
#
# ACKNOWLEDGMENTS: My code is a combination of experimentation, my ideas, following
#    lecture content and understanding the following two tutorials:
#    https://stackabuse.com/creating-a-simple-recommender-system-in-python-using-pandas/
#    https://medium.com/@james_aka_yale/the-4-recommendation-engines-that-can-predict-your-movie-tastes-bbec857b8223
#
# USE: used by personalisedMovies.py
#

############### IMPORTS ###############
import pandas as pd
import numpy as np
import warnings
import tableHandler
import matrixFactorisation

############### GLOBAL CONSTANTS & VARIABLES ###############
FILTER_VALUE = 50                                                                           # we ignore movies with fewer than this number of ratings

data_mean_count = None;                                                                     # global variable for generated table
user_m_rating = None;                                                                       # global variable for generated table

############### FUNCTIONS ###############

# numpy throws a few runtime warnings which are safe to ignore
warnings.filterwarnings("ignore", category=RuntimeWarning)


def generate_tables():
    """ create two new tables, a mean count, and a user / movie rating matrix """

    global data_mean_count, user_m_rating

    data_mean_count = pd.DataFrame(tableHandler.data_table.groupby(                         # new data frame grouping the titles by average rating
        "title")["rating"].mean())

    data_mean_count["rating_counts"] = pd.DataFrame(                                        # adding in the number of ratings
        tableHandler.data_table.groupby("title")["rating"].count())

    user_m_rating = tableHandler.data_table.pivot_table(index = "userId",                   # generate movie / rating matrix
        columns = "title", values = "rating")


def similar_movie(movie ,userId):
    """ given a movie find top 10 correlated movies using collaborative filtering """

    if movie in user_m_rating:                                                              # first check movie exists
        movie_ratings = user_m_rating[movie]                                                # get ratings for movie
        similar_movies = user_m_rating.corrwith(movie_ratings)                              # find correlated movies
        corr_movie = pd.DataFrame(similar_movies, columns = ["Correlation"])                # new data frame adding movie title

        corr_movie.dropna(inplace = True)                                                   # remove any N/A rows

        # join with ratings
        corr_movie = corr_movie.join(data_mean_count["rating_counts"])

        corr_movie = corr_movie[corr_movie["rating_counts"] > FILTER_VALUE].sort_values(    # filter out movies without enough ratings
            'Correlation', ascending = False).iloc[:11]                                     # we only want top 10 similar movies

        corr_movie.drop(movie, inplace = True, errors="ignore")                             # remove the movie itself

        # merge so we have genres
        corr_movie = pd.merge(corr_movie,
            tableHandler.movies_table, how='left', on = "title")

        # merge so we have user ratings
        corr_movie = (pd.merge(corr_movie,  tableHandler.ratings_table.
            loc[(tableHandler.ratings_table['userId'] == userId)], how = "left",
            on = "movieId"))

        # get user predictions
        user_pred = (matrixFactorisation.pred_table.loc[userId - 1].
            sort_values(ascending = False))

        user_pred = (user_pred.to_frame().reset_index().                                    # convert to data frame and add in indexes
            rename(columns = {'index': 'title', (userId - 1): 'prediction'}))               # and change column name

        # merge with predicted ratings
        corr_movie = pd.merge(corr_movie, user_pred,  how = "left", on = "title")

        corr_movie = (corr_movie[['title', 'genres', 'rating',                              # extract and reorder relevant columns
            'prediction', 'tmdbId']])

        return corr_movie.to_json(orient='values')

    else:
        return "error"
