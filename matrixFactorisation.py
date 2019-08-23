#
# AUTHOR: mxcm21
# Date: 01/12/2018
#
# FUNCTIONALITY: reads in MovieLensDB and uses matrix factorisation
#    to provide recommendations based on a user.
#
# ACKNOWLEDGMENTS: My code is a combination of experimentation, my ideas, following
#    lecture content and understanding the following two tutorials:
#    https://beckernick.github.io/matrix-factorization-recommender/
#    https://medium.com/@james_aka_yale/the-4-recommendation-engines-that-can-predict-your-movie-tastes-bbec857b8223
#
# USE: used by personalisedMovies.py
#

############### IMPORTS ###############
import pandas as pd
import numpy as np
import warnings
import tableHandler
import users
from scipy.sparse.linalg import svds

############### GLOBAL CONSTANTS & VARIABLES ###############
pred_table = None;                                                                  # global variable for generated table

############### FUNCTIONS ###############

# numpy throws a few runtime warnings which are safe to ignore
warnings.filterwarnings("ignore", category=RuntimeWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

def generate_tables():
    """ generates a predicted ratings table by using Single Value Decomposition """
    global pred_table

    ratings = tableHandler.data_table.pivot_table(index = "userId",                 # generate movie / rating matrix
        columns = "title", values = "rating").fillna(0)

    current_users = ratings.index                                                   # get current users

    for item in users.users_table['id']:                                            # loop through users in user table
        if item not in current_users:                                               # if user isn't included in ratings table
            df = pd.DataFrame([item], columns = {"userId"})                         # make new data frame
            df = df.set_index('userId')                                             # set index
            ratings = ratings.append(df)                                            # append to table

    ratings = ratings.fillna(0)                                                     # fill with 0's
    ratings_matrix = ratings.values                                                 # convert to matrix
    user_r_mean = np.mean(ratings_matrix, axis = 1).reshape(-1, 1)                  # get means

    ratings_demeaned = ratings_matrix - user_r_mean                                 # demean the matrix
    U, sigma, Vt = svds(ratings_demeaned, k = 50)                                   # single value decomposition
    sigma = np.diag(sigma)                                                          # diagonalise sigma

    all_pred_ratings = np.dot(np.dot(U, sigma), Vt) + user_r_mean
    pred_table = pd.DataFrame(all_pred_ratings, columns = ratings.columns)          # build new data frame


def recommend(user):
    """ given a user returns their predicted top rated movies """

    user_pred = pred_table.loc[user - 1].sort_values(ascending = False)             # get predictions
    user_pred = (user_pred.to_frame().reset_index().                                # convert to data frame and add in indexes
        rename(columns = {'index': 'title', (user - 1): 'prediction'}))             # and change column name

    user_data = tableHandler.data_table[tableHandler.data_table["userId"] == user]  # get original ratings

    # return number of recommendations that the user hasn't already rated
    recommendations = (tableHandler.movies_table[~tableHandler.
         movies_table['title'].isin(user_data['title'])].
         merge(user_pred, on = "title").
         sort_values('prediction', ascending = False).iloc[:250])

    recommendations = recommendations[["movieId", "title", "genres",                # reorder columns
        "prediction", "tmdbId"]];

    return recommendations.to_json(orient='values')                                 # return it in a json format
