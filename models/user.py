#!/usr/bin/python3
"""Module to define User Class"""

import models
from models.base_model import BaseModel, Base
import sqlalchemy
from sqlalchemy import Column, String, Boolean


class User(BaseModel, Base):
    """User Class defition"""
    __tablename__ = 'users'
    name = Column(String(128), nullable=False)
    status = Column(Boolean)

    def __init__(self, *args, **kwargs):
        """initialize user"""
        super().__init__(*args, **kwargs)