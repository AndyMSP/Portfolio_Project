#!/usr/bin/python3
"""module to import required blueprints"""

from flask import Blueprint

user_views = Blueprint('user_views', __name__, url_prefix='/api/v1')
action_views = Blueprint('action_views', __name__, url_prefix='/api/v1')

from api.v1.views.users import *
from api.v1.views.actions import *