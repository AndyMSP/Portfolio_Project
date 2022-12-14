from api.v1.views import action_views
from flask import jsonify, abort, request
import requests
from models.user import User
from models import storage



@action_views.route('/users/<user_id>/call', methods=['GET'], strict_slashes=False)
def call_user(user_id):
    u = storage.get(User, user_id)
    if u is None:
        abort(404)
    else:
        url = u.pitunnel_url + 'incoming_call'
        requests.get(url)
        response = jsonify(({'OK': '200'}), 200)
    return (response)


@action_views.route('/users/<user_id>/end_call', methods=['GET'], strict_slashes=False)
def end_call(user_id):
    u = storage.get(User, user_id)
    if u is None:
        abort(404)
    else:
        url = u.pitunnel_url + 'end_call'
        requests.get(url)
        response = jsonify(({'OK': '200'}), 200)
    return (response)