#!/usr/bin/python3
""" Flask Web App for generating webpages """

import models
from models import storage
from models.user import User
from flask import Flask, render_template
import uuid

app = Flask(__name__)

@app.teardown_appcontext
def close_db(error):
    """ Close current SQLAlchemy Session"""
    storage.close()


@app.route('/call/pi/<uname>', strict_slashes=False)
def user_page(uname):
    """Generates webpage for user"""
    u = storage.get_user_by_uname(uname)
    if u is None:
        u_agora_uid = None
    else:
        u_agora_uid = u.id
        pitunnel_url = u.pitunnel_url
    page = render_template(
        'user_page.html',
        u_agora_uid=u_agora_uid,
        pitunnel_url=pitunnel_url
        )
    return (page)


@app.route('/call/<uname>', strict_slashes=False)
def participant_page(uname):
    """Generates webpage for partipant"""
    u = storage.get_user_by_uname(uname)
    if u is None:
        u_agora_uid = None
    else:
        u_agora_uid = u.id
        pitunnel_url = u.pitunnel_url
    p_agora_uid = str(uuid.uuid4())
    page = render_template(
        'participant_page.html',
        u_agora_uid = u_agora_uid,
        p_agora_uid = p_agora_uid,
        pitunnel_url = pitunnel_url
    )
    return (page)



if __name__ == '__main__':
    """ Run app if called directly """
    app.run(host='0.0.0.0', port=5000, debug=True)