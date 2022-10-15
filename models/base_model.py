#!/usr/bin/python3
""" Module to define BaseModel class inherited by other models"""

from datetime import datetime
import models
import sqlalchemy
from sqlalchemy import Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class BaseModel:
    """ BaseModel which all other classes will inherit from """
    id = Column(String(60), primary_key=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __init__(self, *args, **kwargs):
        """ Initializes the base model """
        if kwargs:
            for key, value in kwargs.items():
                if key != '__class__':
                    setattr(self, key, value)
            if kwargs.get('created_at', None) and type(self.created_at) is str:
                self.created_at = datetime.fromisoformat(kwargs["created_at"])
            else:
                self.created_at = datetime.utcnow()
            if kwargs.get('updated_at', None) and type(self.updated_at) is str:
                self.updated_at = datetime.fromisoformat(kwargs['updated_at'])
            else:
                self.updated_at = datetime.utcnow()
            if kwargs.get('id', None) is None:
                self.id = str(uuid.uuid4())
        else:
            self.id = str(uuid.uuid4())
            self.created_at = datetime.utcnow()
            self.updated_at = self.created_at

    def __str__(self):
        """String representation of basemodel class"""
        return f'[{self.__class__.__name__}] ({self.id}) {self.__dict__}'
    
    def save(self):
        """updates updated_at attribute"""
        self.updated_at = datetime.utcnow()
        models.storage.new(self)
        models.storage.save()
    
    def to_dict(self):
        """return dictionary representation of object"""
        new_dict = self.__dict__.copy()
        if 'created_at' in new_dict:
            new_dict['created_at'] = datetime.isoformat(new_dict['created_at'])
        if 'updated_at' in new_dict:
            new_dict['updated_at'] = datetime.isoformat(new_dict['updated_at'])
        new_dict['__class__'] = self.__class__.__name__
        if '_sa_instance_state' in new_dict:
            del new_dict['_sa_instance_state']
        return new_dict

    def delete(self):
        """delete the current instance from storage"""
        models.storage.delete(self)