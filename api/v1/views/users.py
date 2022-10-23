from api.v1.views import user_views
from flask import jsonify, abort, request
import requests
from models.user import User
from models import storage

@user_views.route('/users', methods=['GET'], strict_slashes=False)
def all_users():
    """returns all users in json format"""
    list_users = []
    users_v = storage.all(User).values()
    for user in users_v:
        list_users.append(user.to_dict())
    response = (jsonify(list_users), 200)
    return (response)


@user_views.route('/users/<user_id>/status', methods=['GET'], strict_slashes=False)
def user_status_get(user_id):
    u = storage.get(User, user_id)
    if u is None:
        abort(404)
    else:
        response = (jsonify({'status': u.status}), 200)
    return (response)

@user_views.route('/users/<user_id>/status_update/<status>', methods=['GET'], strict_slashes=False)
def user_status_update(user_id, status):
    u = storage.get(User, user_id)
    if u is None:
        abort(404)
    else:
        u.status = status
        u.save()
        response = (jsonify({'status': u.status}), 200)
    return (response)


@user_views.route('/users/<user_id>/call>', methods=['GET'], strict_slashes=False)
def user_status_update(user_id, status):
    u = storage.get(User, user_id)
    if u is None:
        abort(404)
    else:
        url = u.pitunnel_url + 'incoming_call'
        msg = requests.get(url)
        response = jsonify({'msg': msg}, 200)
    return (response)