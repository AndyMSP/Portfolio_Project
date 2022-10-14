#!/usr/bin/python3
"""Initialize models package"""

from models.engine.storage import DBStorage
storage = DBStorage()
storage.reload()