#
# AUTHOR: mxcm21
# Date: 01/12/2018
#
# FUNCTIONALITY: handles reading and writing tables since both collaborativeFiltering
#    and matrixFactorisation need to use them. Also provides basic functionality to
#    manipulate the tables, i.e. get previously watched and searched for movies
#
# USE: used by collaborativeFiltering.py, matrixFactorisation.py and personalisedMovies.py
#

############### IMPORTS ###############
import pandas as pd
import numpy as np
import warnings
import math
import time
import matrixFactorisation

############### GLOBAL CONSTANTS & VARIABLES ###############
RATING_COLS = ["userId", "movieId", "rating", "timestamp"];                             # headers of CSV file
MOVIE_COLS = ["movieId", "title", "genres"];                                            # headers of CSV file

ratings_table = None;                                                                   # global variable for CSV to be read into
movies_table = None;                                                                    # global variable for CSV to be read into
tags_table = None;                                                                      # global variable for CSV to be read into
data_table = None;                                                                      # global variable for generated table to be put in

############### FUNCTIONS ###############

# numpy throws a few runtime warnings which are safe to ignore
warnings.filterwarnings("ignore", category=RuntimeWarning)

def load_tables():
    """ reads in ratings and movie databases from csv files """
    global ratings_table, movies_table, data_table, tags_table                          # so that it can update global variable

    ratings_table = pd.read_csv('data/ratings.csv', sep=',', names=RATING_COLS,         # read in file
		encoding='utf-8', skiprows = 1)

    movies_table = pd.read_csv('data/movies.csv', sep=',', names=MOVIE_COLS,            # read in file
		encoding='utf-8', skiprows = 1)

    links_table = pd.read_csv('data/links.csv', sep=",", encoding='utf-8');
    movies_table = pd.merge(movies_table, links_table[["movieId", "tmdbId"]],           # merge in link to tmdb
        on="movieId")

    data_table = pd.merge(ratings_table, movies_table, on="movieId")                    # merge tables

    tags_table = pd.read_csv('data/tags.csv', sep=',', encoding = "utf-8");             # read in tags
    tags_table = tags_table[['movieId', 'tag']]                                         # reduce to interesting columns
    tags_table = tags_table.groupby('movieId').apply(lambda x: (x + " ").sum())         # group tags by movie id
    tags_table = tags_table.reset_index()                                               # give an index column again

    print("Loaded Ratings and Movies")


def make_rating(userID, title, rating):
    """ saves a user's rating for a particular movie """
    global ratings_table, data_table

    movieID = movies_table[movies_table['title'] == title]["movieId"]                   # get movie ID

    if len(movieID):
        movieID = movieID.values[0]                                                     # extract int

        entry = ratings_table.loc[(ratings_table['userId'] == userID) & (               # get corresponding entries index
            ratings_table['movieId'] == movieID)].index.values.astype(int)

        rating = int(rating) * 1.0                                                      # casting to double
        timestamp = int(math.floor(time.time()))                                        # get current time
        if len(entry):                                                                  # check if entry already exists
            ratings_table.at[entry[0], "rating"] = rating                               # update rating
            ratings_table.at[entry[0], "timestamp"] = timestamp                         # update rating
        else:                                                                           # or we are making a new one
            entry = [[userID, movieID, rating, timestamp]]                              # create a new entry

            df = pd.DataFrame(entry, columns = RATING_COLS)                             # make new frame

            ratings_table = ratings_table.append(df, ignore_index=True)                 # append to ratings_table

        save_table()                                                                    # write results

        data_table = pd.merge(ratings_table, movies_table, on="movieId")                # merge tables again

        return "success"
    else:
        return "error"


def save_table():
    """ saves the rating table back to csv
        our movies list will never change so no need to provide saving for that """

    ratings_table.to_csv('data/ratings.csv', index = False, encoding='utf-8')           # write back to csv ignoring index labels


def get_watched(user):
    """ returns a json object of movies previously watched by given user """
    prev_watched = (data_table.loc[data_table['userId'] == user].
        sort_values(['rating', 'timestamp'], ascending = [False, False]))               # get previously watched

    prev_watched = prev_watched[['userId', 'title', 'genres', 'rating', 'tmdbId']]      # extract and reorder relevant columns

    return prev_watched.to_json(orient='values')                                        # return it in a json format


def get_all(userID):
    """ returns all movies"""
    movies = pd.merge(movies_table,                                                     # merge movies on users ratings
        ratings_table.loc[(ratings_table['userId'] == userID)], how = "outer")

    movies = pd.merge(movies, tags_table, how = "outer")                                # merge with tags

    user_pred = (matrixFactorisation.pred_table.loc[userID - 1].                        # get predictions
        sort_values(ascending = False))
        
    user_pred = (user_pred.to_frame().reset_index().                                    # convert to data frame and add in indexes
        rename(columns = {'index': 'title', (userID - 1): 'prediction'}))               # and change column name

    movies = pd.merge(movies, user_pred,  how = "outer")

    movies = (movies[['userId', 'title', 'genres', 'rating', 'tag',                     # extract and reorder relevant columns
        'prediction', 'timestamp', 'tmdbId']]. sort_values(['rating', 'timestamp',
        'prediction'], ascending =[False, False, False]))

    return movies.to_json(orient='values')
