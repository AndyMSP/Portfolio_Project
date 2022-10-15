#!/usr/bin/python3
"""DBStorage Class Module"""

import models
from models.base_model import BaseModel, Base
from models.user import User
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

classes = {'User': User}

class DBStorage:
    """Class definition to interact with MySQL database"""

    __engine = None
    __session = None

    def __init__(self):
        """Instantiate new instance"""
        MYSQL_USER = 'IGN_dev'
        MYSQL_PWD = 'IGN_dev_pwd'
        MYSQL_HOST = 'localhost'
        MYSQL_DB = 'IGN_db'
        self.__engine = create_engine('mysql+mysqldb://{}:{}@{}/{}'.
        format(
            MYSQL_USER,
            MYSQL_PWD,
            MYSQL_HOST,
            MYSQL_DB
            )
        )

    def reload(self):
        """reloads data from the database"""
        Base.metadata.create_all(self.__engine)
        sess_factory = sessionmaker(bind=self.__engine, expire_on_commit=False)
        Session=scoped_session(sess_factory)
        self.__session = Session

    def all(self, cls=None):
        """query on current database session"""
        new_dict = {}
        for clss in classes:
            if cls is None or cls is classes[clss] or cls is clss:
                objs = self.__session.query(classes[clss]).all()
                for obj in objs:
                    key = obj.__class__.__name__ + '.' + obj.id
                    new_dict[key] = obj
        return (new_dict)

    def new(self, obj):
        """add object to current database session"""
        self.__session.add(obj)

    def save(self):
        """commit all changes of the current database session"""
        self.__session.commit()

    def delete(self, obj=None):
        """delete from the current database session if obj is not None"""
        if obj is not None:
            self.__session.delete(obj)

    def close(self):
        """call remove method on the private session attribute"""
        self.__session.remove()

    def get(self, cls, id):
        """Returns object based on class name and id or None if not found"""
        if cls not in classes.values():
            return None
        all_cls = models.storage.all(cls)
        for value in all_cls.values():
            if (value.id == id):
                return value
        return None

    def get_user_by_uname(self, uname):
        """Returns user object based on unique uname"""
        u = self.__session.query(User).filter(User.uname == uname).first()
        return (u)

    def count(self, cls=None):
        """count the number of objects in storage"""
        all_class = classes.values()

        if not cls:
            count = 0
            for clas in all_class:
                count += len(models.storage.all(clas).values())
        else:
            count = len(models.storage.all(cls).values())
        return count