#
# AUTHOR: mxcm21
# Date: 31/11/2018
#
# FUNCTIONALITY: methods for loading, saving and querying the users.csv
#                data store
#
# USE: used by personalisedMovies.py
#

############### IMPORTS ###############
import pandas as pd


############### GLOBAL CONSTANTS & VARIABLES ###############
# Used to stop variables having to be constantly passed around
USER_COLS = ['id', 'username', 'language', 'email'];                            # headers of CSV file
users_table = None;                                                             # CSV file read into this variable


############### FUNCTIONS ###############
def load_users():
    """ reads in user database from csv file """
    global users_table                                                          # so that it can update global variable

    users_table = pd.read_csv('data/users.csv', sep=',', names=USER_COLS,       # read in file
		encoding='utf-8', skiprows = 1)


def save_users():
    """ saves users_table back into csv """
    users_table.to_csv('data/users.csv', index = False, encoding='utf-8')       # write back to csv ignoring index labels


def valid_user(user):
    """ checks if a given username is in the table (case agnostic) """
    regex = '^' + user + '$'                                                    # means full word has to match with nothing before or after
    valid = users_table['username'].str.match(regex, case=False).any()          # check if given username in username column
    return valid                                                                # return answer


def get_correct_username(user):
    """ given a username returns the correct casing of it as appears in the csv """
    regex = '^' + user + '$'                                                    # means full word has to match with nothing before or after
    name = users_table[users_table['username'].str.match(regex, case=False)]    # get row from dataFrame

    if not name.empty:                                                          # if we've corerctly selected a row
        return name.iloc[0]['username']                                         # get correct form of username
    else:
        return ""


def valid_id(id):
    """ checks if a given id is in the table """
    valid = users_table.loc[users_table['id'] == int(id)]                       # get all rows with id == id
    return len(valid)                                                           # return answer, 0 is False, 1 is True


def max_id():
    """ returns the maximum current id of users """
    return max(610, users_table['id'].max())                                    # need max of 610 as we already have 610 users from MovieLens


def create_user(data):
    """ creates a new user """
    global users_table

    userID = 0
    if data['user'] != "":
        userID = int(data['user'])                                              # if id isn't blank use it
    else:
        userID = max_id() + 1                                                   # if blank we want the next valid id

    entry = [[userID, data['username'], data['language'],                       # create a new entry
     data['email']]]

    df = pd.DataFrame(entry, columns = USER_COLS)                               # make new frame

    users_table = users_table.append(df, ignore_index=True)                     # append to users_table

    save_users()                                                                # write csv back


def edit_user(user, data):
    """ given a username and data, update that user """
    entry = [[int(data['user']), data['username'], data['language'],            # create a new entry
     data['email']]]

    users_table.loc[users_table['username'] == user] = entry                    # grab and update relevant row

    save_users()                                                                # write csv to file


def update_lang(user, lang):
    """ updates a users language """
    users_table.loc[users_table['username'] == user, 'language'] = lang         # grab and update relevant row

    save_users()                                                                # write csv to file


def get_info(user):
    """ returns details for whole row given username """
    row = users_table.loc[users_table['username'] == user]
    entry = [row.iloc[0]['username'], row.iloc[0]['email'],
        row.iloc[0]['language'], row.iloc[0]['id']]

    return entry
