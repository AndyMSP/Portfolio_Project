#!/usr/bin/python3
"""Top level api script to handle all blueprints"""

from flask import Flask, jsonify
from flask_cors import CORS
from models import storage
from api.v1.views import (
    user_views,
    action_views
)

app = Flask(__name__)
# CORS(app, origins='0.0.0.0')
app.register_blueprint(user_views)
app.register_blueprint(action_views)
cors = CORS(app, resources={r"/api/v1/*": {"origins": "*"}})


@app.teardown_appcontext
def teardown_db(exception):
    """closes the storage on teardown"""
    storage.close()


@app.errorhandler(404)
def error_404(error):
    """JSON response for resource not found"""
    response = jsonify(error='Not found')
    return (response, 404)


@app.errorhandler(400)
def error_400(error):
    """JSON response for 400 errors"""
    response = jsonify(error=error.description)
    return (response, 400)


if __name__ == '__main__':
    host = '0.0.0.0'
    port = 5000
    app.run(host=host, port=port, threaded=True)
