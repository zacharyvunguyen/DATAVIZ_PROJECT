import pandas as pd
import numpy as np
from collections import Counter

import os


import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy import MetaData,Table,inspect,desc
from sqlalchemy.sql import func


import psycopg2
import os 
from flask import send_from_directory     

from flask import Flask, jsonify, render_template,url_for
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)


#################################################
# Database Setup
#################################################
#DATABASE_URL = os.environ['DATABASE_URL']
#app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#for local "'postgres://zacharynguyen:92ZacharY@localhost:5432/inc5000'"
app.config["SQLALCHEMY_DATABASE_URI"]='postgres://zacharynguyen:92ZacharY@localhost:5432/inc5000'
db = SQLAlchemy(app)


metadata = MetaData(bind=db.engine) 
# inc2018_data = Table('inc2018_data', metadata, autoload_with=db.engine) 

inc2018_data = Table('inc2018_data', metadata, autoload_with=db.engine) 


#session = Session(db.engine)
# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

session = Session(db.engine)

Base.classes.keys()
# Save references to each table
Inc2018_data = Base.classes.inc2018_data

# Select All
sel_all = [ 
        Inc2018_data.rank,
        Inc2018_data.url,
        Inc2018_data.growth,
        Inc2018_data.industry,
        Inc2018_data.revenue,
        Inc2018_data.state_l,
        Inc2018_data.state_s,
        Inc2018_data.city,
        Inc2018_data.founded,
        Inc2018_data.latitude,
        Inc2018_data.longitude,
        Inc2018_data.yrs_on_list,
        Inc2018_data.company,
        Inc2018_data.website,
        Inc2018_data.workers,
        ]

def build_metadata_list(inc_jsondata_list,results):
    
    inc_jsondata={}
    for result in results:
        inc_jsondata['Rank'] = result[0]
        inc_jsondata['url'] = result[1]
        inc_jsondata['Growth'] = result[2]
        inc_jsondata['Industry'] = result[3]
        inc_jsondata['Revenue'] = result[4]
        inc_jsondata['State'] = result[5]
        inc_jsondata['State_s'] = result[6]
        inc_jsondata['City'] = result[7]
        inc_jsondata['Founded'] = result[8]
        inc_jsondata['latitude'] = result[9]
        inc_jsondata['longtitude'] = result[10]
        inc_jsondata['Years_on_List'] = result[11]
        inc_jsondata['Company'] = result[12]
# Fix url format

        if  result[13] == None :
            url = 'N/A'
        elif ('http://' in result[13]):
            url = result[13]
        else:
            url = 'http://'+ result[13]

        inc_jsondata['Website'] = url

        inc_jsondata['Workers'] = result[14]
        inc_jsondata_list.append(inc_jsondata)
        inc_jsondata={}
    return inc_jsondata_list

def build_filter_list(results,filter_name):
    filter_list = []
    if filter_name == 'Rank' :
        col = 0
    if filter_name == 'Industry' :
        col = 3
    if filter_name == 'State' :
        col = 5
    if filter_name == 'City' :
        col = 7
    if filter_name == 'Founded' :
        col = 8
    if filter_name == 'Years_on_List' :
        col = 11
    for result in results:
        if result[col] != None:
            filter_list.append(result[col])

    filter_list = list(dict.fromkeys(filter_list))
    
    return filter_list

def build_plot_list(results,plot_name):
    plot_list = []
    if plot_name == 'Industry' :
        col = 3
    if plot_name == 'State' :
        col = 5
    if plot_name == 'City' :
        col = 7
    if plot_name == 'Founded' :
        col = 8
    if plot_name == 'Years_on_List' :
        col = 11
    for result in results:
        if result[col] != None:
            plot_list.append(result[col])

    label_list = list(dict.fromkeys(plot_list))
    value_list = []
    for i in range((len(label_list)-1)):
        value_list.append(plot_list.count(label_list[i]))
    label_value_list = [label_list[:-1],value_list]
    return label_value_list
    
    


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/table")
def table():
    return render_template("table.html")

@app.route("/profiles")
def profiles():
    return render_template("profiles.html")


@app.route("/map_full")
def map_full():
    return render_template("map_full.html")

@app.route("/map_full_rev")
def map_full_rev():
    return render_template("map_full_rev.html")


@app.route("/map_geo")
def map_geo():
    return render_template("map_geo.html")

@app.route("/industry_charts")
def industry_charts():
    return render_template("industry_charts.html")

@app.route("/location_charts")
def location_charts():
    return render_template("location_charts.html")





@app.route("/2018metadata")
def inc_metadata():

# Use Pandas to perform the sql query
    results = session.query(*sel_all).all()
    inc_jsondata_list = []
    results_list = build_metadata_list(inc_jsondata_list,results)
    
    return jsonify(results_list)

@app.route("/industry_growth_rev")
def industry_growth_query():
    results = session.query(Inc2018_data.industry,func.avg(Inc2018_data.growth),func.avg(Inc2018_data.revenue)/1000000,func.count(Inc2018_data.industry)).group_by(Inc2018_data.industry).order_by(desc(func.avg(Inc2018_data.growth))).all()
    results_Transpose = list(map(list,zip(*results)))
    return jsonify(results_Transpose)

@app.route("/topten_cities")
def topten_cities_query():
    results = session.query(Inc2018_data.city,func.count(Inc2018_data.company),func.avg(Inc2018_data.growth)).group_by(Inc2018_data.city).order_by(desc(func.count(Inc2018_data.company))).all()
    results_ten = results[:10]
    results_Transpose = list(map(list,zip(*results_ten)))
    return jsonify(results_Transpose)

@app.route("/topten_companies")
def topten_companies_query():
    results = session.query(*sel_all).all()
    results_ten = results[:10]
    results_Transpose = list(map(list,zip(*results_ten)))
    reseults_for_plot = [results_Transpose[12],results_Transpose[2],results_Transpose[4]]
    reseults_for_plot[2] = [i/1000 for i in reseults_for_plot[2]]
    return jsonify(reseults_for_plot)



@app.route("/growth_rev_state")
def inc_growth_rev_state():

# Use Pandas to perform the sql query
    
    results = session.query(Inc2018_data.state_l,func.avg(Inc2018_data.growth),func.avg(Inc2018_data.revenue)/10000000,func.count(Inc2018_data.company)).group_by(Inc2018_data.state_l).order_by(func.avg(Inc2018_data.growth)).all()
    results_Transpose = list(map(list,zip(*results)))
    return jsonify(results_Transpose)


@app.route("/2018metadata/pages/<num>")
def inc_metadata_bypage(num):

# Use Pandas to perform the sql query
    table_list_num = int(num)*10
    results = session.query(*sel_all).limit(table_list_num).all()
    inc_jsondata_list = []
    results_list = build_metadata_list(inc_jsondata_list,results)
    
    return jsonify(results_list[(table_list_num-10):])


@app.route("/2018metadata/<filter_name>")
def inc_metadata_industry_names(filter_name):

# Use Pandas to perform the sql query
    results = session.query(*sel_all).all()
    results_list = build_filter_list(results,filter_name)
    
    return jsonify(results_list)


@app.route("/2018metadata/plot/<plot_name>")
def inc_metadata_plot_list(plot_name):

# Use Pandas to perform the sql query
    results = session.query(*sel_all).all()
    results_list = build_plot_list(results,plot_name)
    
    return jsonify(results_list)



@app.route("/rank/<ranking_number>")
def ranking(ranking_number):
    """Return a list of Ranking # Company Information."""
    num = int(ranking_number)
    results = session.query(*sel_all).filter(Inc2018_data.rank == num).all() 
    inc_jsondata_list = []

    results_list = build_metadata_list(inc_jsondata_list,results)
    
    return jsonify(results_list)


@app.route("/state_s/<state_s>")
def state_s_query(state_s):
    """Return a list of Ranking # Company Information."""
    state_s = state_s.upper()
    results = session.query(*sel_all).filter(Inc2018_data.state_s == state_s).all() 
    inc_jsondata_list = []

    results_list = build_metadata_list(inc_jsondata_list,results)
    
    return jsonify(results_list)

@app.route("/state_l/<state_l>/<page_num>")
def state_l_query(state_l,page_num):
    """Return a list of Ranking # Company Information."""

    page_num = int(page_num)
    if page_num == 0:
        results = session.query(*sel_all).filter(Inc2018_data.state_l == state_l).all() 
        inc_jsondata_list = []
        results_list = build_metadata_list(inc_jsondata_list,results)
        return jsonify(results_list)
    else:
        table_list_num = int(page_num)*10
        results = session.query(*sel_all).filter(Inc2018_data.state_l == state_l).limit(table_list_num).all() 
        inc_jsondata_list = []
        results_list = build_metadata_list(inc_jsondata_list,results)
        return jsonify(results_list[(table_list_num-10):])

@app.route("/city/<city>/<page_num>")
def city_query(city,page_num):
    """Return a list of Ranking # Company Information."""

    page_num = int(page_num)
    if page_num == 0:
        results = session.query(*sel_all).filter(Inc2018_data.city == city).all() 
        inc_jsondata_list = []
        results_list = build_metadata_list(inc_jsondata_list,results)
        return jsonify(results_list)
    else:
        table_list_num = int(page_num)*10
        results = session.query(*sel_all).filter(Inc2018_data.city == city).limit(table_list_num).all() 
        inc_jsondata_list = []
        results_list = build_metadata_list(inc_jsondata_list,results)
        return jsonify(results_list[(table_list_num-10):])

@app.route("/industry/<industry>/<page_num>")
def industry_query(industry,page_num):
    """Return a list of Ranking # Company Information."""

    page_num = int(page_num)
    if page_num == 0:
        results = session.query(*sel_all).filter(Inc2018_data.industry == industry).all() 
        inc_jsondata_list = []
        results_list = build_metadata_list(inc_jsondata_list,results)
        return jsonify(results_list)
    else:
        table_list_num = int(page_num)*10
        results = session.query(*sel_all).filter(Inc2018_data.industry == industry).limit(table_list_num).all() 
        inc_jsondata_list = []
        results_list = build_metadata_list(inc_jsondata_list,results)
        return jsonify(results_list[(table_list_num-10):])


@app.route("/years_on/<yrs_on_list>/<page_num>")
def yrs_on_list_query(yrs_on_list,page_num):
    """Return a list of Ranking # Company Information."""
    yrs_on_list = int(yrs_on_list)
    page_num = int(page_num)
    if page_num == 0:
        results = session.query(*sel_all).filter(Inc2018_data.yrs_on_list == yrs_on_list).all() 
        inc_jsondata_list = []
        results_list = build_metadata_list(inc_jsondata_list,results)
        return jsonify(results_list)
    else:
        table_list_num = int(page_num)*10
        results = session.query(*sel_all).filter(Inc2018_data.yrs_on_list == yrs_on_list).limit(table_list_num).all() 
        inc_jsondata_list = []
        results_list = build_metadata_list(inc_jsondata_list,results)
        return jsonify(results_list[(table_list_num-10):])


    
@app.route("/founded_year/<founded>/<page_num>")
def founded_query(founded,page_num):
    """Return a list of Ranking # Company Information."""
    founded = int(founded)
    page_num = int(page_num)
    if page_num == 0:
        results = session.query(*sel_all).filter(Inc2018_data.founded == founded).all() 
        inc_jsondata_list = []
        results_list = build_metadata_list(inc_jsondata_list,results)
        return jsonify(results_list)
    else:
        table_list_num = int(page_num)*10
        results = session.query(*sel_all).filter(Inc2018_data.founded == founded).limit(table_list_num).all() 
        inc_jsondata_list = []
        results_list = build_metadata_list(inc_jsondata_list,results)
        return jsonify(results_list[(table_list_num-10):])



@app.route('/favicon.ico') 
def favicon(): 
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')

###############################################################
    
if __name__ == "__main__":
    app.run(debug=True)
