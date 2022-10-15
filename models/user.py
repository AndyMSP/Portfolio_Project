#!/usr/bin/python3
"""Module to define User Class"""

import models
from models.base_model import BaseModel, Base
import sqlalchemy
from sqlalchemy import Column, String


class User(BaseModel, Base):
    """User Class defition"""
    __tablename__ = 'users'
    uname = Column(String(128), nullable=False, unique=True)
    name = Column(String(128), nullable=False)
    call_url = Column(String(128), nullable=False)
    status = Column(String(128), nullable=False)

    def __init__(self, *args, **kwargs):
        """initialize user"""
        super().__init__(*args, **kwargs)