#
# AUTHOR: mxcm21
# Date: 31/11/2018
#
# FUNCTIONALITY: uses Flask and Jinja templates to run a recommendation server
#    which using the MovieLensDB provides movie recommendations based on
#    Matrix Factorisation and Collaborative Filtering techniques
#
# USE: Can only be run via command line:
# 			python3 ./personalisedMovies.py [portNumber]
#			[portNumber] is optional and if not given defaults to 5000
#

############### IMPORTS ###############
import sys
from flask import Flask, session, url_for, render_template, request, redirect, Response, jsonify
from os import urandom
import random
import json
import users
import tableHandler
import collaborativeFiltering
import matrixFactorisation

############### FUNCTIONS ###############
def setUpTables():
	""" sets several recommendation tables us, and also refreshes them """
	print("Loading Ratings & Movies")
	tableHandler.load_tables() 								# load other tables

	print("Generating Collaborative Filtering")
	collaborativeFiltering.generate_tables() 						# generate new tables

	print("Generating Matrix Factorisation")
	matrixFactorisation.generate_tables() 							# generate new tables


############### INITIALISATION ###############
app = Flask(__name__)								                # initialise app
app.secret_key = urandom(24)									# generate secret key for session handling

print("Loading Users")
users.load_users() 										# load the users database from csv

setUpTables() 											# loads tables

print("=== Ready ===")


############### ROUTING ###############

# all GET requests for pages should go through here
@app.route('/', methods = ['GET'])
def index():
	if 'username' in session:								# check if user logged in or not
		username = session['username']
		return render_template('index.html', user = username)				# return rendered index.html page
	else:
		return render_template('login.html', settingsClass = 'disabled') 		# else return login page with a disabled settings dropdown


# GET user info
@app.route('/userInfo', methods = ['GET'])
def info():
	if 'username' in session:								# if we are logged in
		data =  users.get_info(session['username'])					# get info
		output = {									# create dictionary
			'username': data[0],
			'email': data[1],
			'language': data[2],
			'id': str(data[3])
		}

		return jsonify(output)								# return as json dictionary
	else:
		return "error"


# GET top recommended
@app.route('/getRecommended', methods = ['GET'])
def topRecommended():
	if 'username' in session:								# if we are logged in
		movie = request.args.get('title')						# extract args
		data =  matrixFactorisation.recommend(int(session['idNo']))			# get recommendations using matrix factorisation
		return jsonify(data)								# return as json dictionary
	else:
		return "error"


# GET previously watched movies
@app.route('/getWatched', methods = ['GET'])
def getWatched():
	if 'username' in session:								# if we are logged in
		data =  tableHandler.get_watched(int(session['idNo']))				# get previously watched movies
		return jsonify(data)								# return as json dictionary
	else:
		return "error"


# GET searched movies
@app.route('/get_all', methods = ['GET'])
def search():
	if 'username' in session:								# if we are logged in
		resp =  tableHandler.get_all(int(session['idNo']))				# get all movies
		return jsonify(resp)								# return as json dictionary
	else:
		return "error"


# GET similar
@app.route('/getSimilar', methods = ['GET'])
def similar():
	if 'username' in session:								# if we are logged in
		movie = str(request.args.get('title'))						# extract args
		data =  collaborativeFiltering.similar_movie(movie,		                # get recommendations using item-item colaborative filtering
		 	int(session['idNo']))
		return jsonify(data)								# return as json dictionary
	else:
		return "error"


# POST to login
@app.route('/login', methods = ['POST'])
def login():
	data = request.get_data()
	data = json.loads(data)
	username = data['username']

	if users.valid_user(username):								# check for valid user
		username = users.get_correct_username(username) 				# get correct version of username
		print("Logging in:", username)
		session['username'] = username 							# set session
		updateSession() 								# update session variables
		return redirect(url_for('index')) 						# redirect to main page
	else:
		return "Invalid User"


# allows user to logout
@app.route('/logout', methods = ['GET'])
def logout():
	if 'username' in session:
		print("Logging out:", session['username'])
		session.pop('username', None) 							# clear session of username

	return redirect(url_for('login')) 							# refresh page


# registering a new user
@app.route('/register', methods = ['POST'])
def register():
	data = request.get_data()
	data = json.loads(data)

	print("Registering new user:", data['username'])

	msg = ""

	# check if username already exists
	if users.valid_user(data['username']):
		msg += "username "

	# confirm id hasn't already been used
	if data['user'] != '' and users.valid_id(data['user']):
		msg += "user "

	# if error return message
	if len(msg) > 0:
		return msg 						 			# return errors
	else:
		users.create_user(data)								# add to database
		session['username'] = data['username'] 						# log user in
		setUpTables(); 									# need to refresh the tables
		updateSession() 								# update session variables
		return "success"							        # return success


# eitting a user
@app.route('/edit', methods = ['POST'])
def edit():
	if 'username' in session:
		data = request.get_data()
		data = json.loads(data)

		print("Editting user:", session['username'])

		msg = ""

		# check if username has changed and if so if it it's unique
		if (data['username'] != session['username'] and
			users.valid_user(data['username'])):
			msg = "error"

		# if error return message
		if len(msg) > 0:
			return msg 						 		# return errors
		else:
			users.edit_user(session['username'], data)				# add to database
			session['username'] = data['username'] 					# log user in
			updateSession() 							# update session variables
			return "succcess"							# return success
	else:
		return redirect(url_for('login'))


# updating a user's language
@app.route('/updateLanguage', methods = ['POST'])
def updateLang():
	if 'username' in session:
		data = request.get_data()
		language = json.loads(data)

		print("Editting Language for:", session['username'])

		users.update_lang(session['username'], language)				# update database
		updateSession() 								# update session variables
		return "succcess"								# return success
	else:
		return "noUser"									# message if not logged in


# POSTing a new rating
@app.route('/updateRating', methods = ['POST'])
def rating():
	if 'username' in session:
		data = request.get_data()
		data = json.loads(data)

		print("Adding Rating for:", session['username'])

		resp = tableHandler.make_rating(int(session['idNo']), data['title'], 	        # submit rating
			data['rating'])

		if resp == "success":
			return "success"
		else:
			return "error"
	else:
		return "error"


# POST to regenerate matricies
@app.route('/updateMatrix', methods = ['POST'])
def updateRating():
	if 'username' in session:
		print("Regenerating Matricies for:", session['username'])

		# regenerate all tables
		setUpTables();

		return "success"
	else:
		return "error"


# handles all 404 page not found issues by redirecting
# and also method not allowed 405 errors
@app.errorhandler(404)
@app.errorhandler(405)
def page_not_found(e):
    # note that we set the 404 status explicitly
    return redirect(url_for('index'))


# updates session with user information
def updateSession():
	""" updates session variables for HTML to take """
	print (session)
	if 'username' in session:
		details = users.get_info(session['username'])
		session['email'] = details[1]
		session['language'] = details[2]
		session['idNo'] = str(details[3])
	print(session)


if __name__ == '__main__':
        print ("starting")
	if len(sys.argv) == 2:
		app.run("0.0.0.0", sys.argv[1])
	else:
		app.run()						                        # run from command line
