# 🐍 Python Guide for Pennywise Backend

## 📚 Table of Contents
1. [Python Basics](#python-basics)
2. [Object-Oriented Programming](#object-oriented-programming)
3. [Functions and Decorators](#functions-and-decorators)
4. [Modules and Imports](#modules-and-imports)
5. [Type Hints](#type-hints)
6. [Async Programming](#async-programming)
7. [Web Development Concepts](#web-development-concepts)
8. [Database Concepts](#database-concepts)
9. [Project-Specific Concepts](#project-specific-concepts)
10. [Common Python Patterns](#common-python-patterns)

---

## 🎯 Python Basics

### Variables and Data Types
```python
# Strings - text data
name = "John Doe"
email = 'john@example.com'

# Numbers
age = 25                    # Integer
height = 5.9               # Float (decimal)
is_active = True           # Boolean

# Lists - ordered collections
users = ["Alice", "Bob", "Charlie"]
numbers = [1, 2, 3, 4, 5]

# Dictionaries - key-value pairs
user = {
    "name": "John",
    "email": "john@example.com",
    "age": 25
}

# None - represents "nothing" or "null"
empty_value = None
```

### String Operations
```python
# String concatenation
first_name = "John"
last_name = "Doe"
full_name = first_name + " " + last_name  # "John Doe"

# String formatting (f-strings - Python 3.6+)
age = 25
message = f"Hello, I am {age} years old"

# String methods
text = "  hello world  "
cleaned = text.strip()      # "hello world"
uppercase = text.upper()    # "  HELLO WORLD  "
```

### Control Flow
```python
# If statements
age = 18
if age >= 18:
    print("Adult")
elif age >= 13:
    print("Teenager")
else:
    print("Child")

# Loops
# For loop
for i in range(5):
    print(i)  # Prints 0, 1, 2, 3, 4

# For loop with list
users = ["Alice", "Bob", "Charlie"]
for user in users:
    print(f"Hello, {user}")

# While loop
count = 0
while count < 3:
    print(count)
    count += 1
```

---

## 🏗️ Object-Oriented Programming

### Classes and Objects
```python
# Class definition
class User:
    # Constructor method (runs when creating a new User)
    def __init__(self, name, email):
        self.name = name      # Instance variable
        self.email = email    # Instance variable
    
    # Instance method
    def greet(self):
        return f"Hello, my name is {self.name}"
    
    def get_email(self):
        return self.email

# Creating objects (instances)
user1 = User("John", "john@example.com")
user2 = User("Jane", "jane@example.com")

# Using methods
print(user1.greet())  # "Hello, my name is John"
print(user2.get_email())  # "jane@example.com"
```

### Inheritance
```python
class Person:
    def __init__(self, name):
        self.name = name
    
    def greet(self):
        return f"Hello, I'm {self.name}"

# Admin inherits from Person
class Admin(Person):
    def __init__(self, name, permissions):
        super().__init__(name)  # Call parent constructor
        self.permissions = permissions
    
    def has_permission(self, permission):
        return permission in self.permissions

# Usage
admin = Admin("John", ["read", "write", "delete"])
print(admin.greet())  # "Hello, I'm John"
print(admin.has_permission("read"))  # True
```

---

## 🔧 Functions and Decorators

### Basic Functions
```python
# Simple function
def greet(name):
    return f"Hello, {name}!"

# Function with default parameters
def create_user(name, email, age=18):
    return {
        "name": name,
        "email": email,
        "age": age
    }

# Function with multiple return values
def get_user_info(user_id):
    if user_id == 1:
        return "John", "john@example.com", 25
    else:
        return None, None, None

# Usage
result = greet("Alice")  # "Hello, Alice!"
user = create_user("Bob", "bob@example.com")  # age defaults to 18
name, email, age = get_user_info(1)
```

### Decorators
Decorators are functions that modify other functions. They use the `@` syntax.

```python
# Simple decorator
def log_function(func):
    def wrapper(*args, **kwargs):
        print(f"Calling function: {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Function {func.__name__} completed")
        return result
    return wrapper

# Using decorator
@log_function
def add_numbers(a, b):
    return a + b

# This is equivalent to:
# add_numbers = log_function(add_numbers)

result = add_numbers(5, 3)
# Output:
# Calling function: add_numbers
# Function add_numbers completed
```

### FastAPI Decorators
```python
from fastapi import APIRouter

router = APIRouter()

# @router.post("/users") is a decorator that:
# 1. Registers this function to handle POST requests to /users
# 2. Automatically generates API documentation
# 3. Handles request/response serialization

@router.post("/users")
async def create_user(user_data: dict):
    return {"message": "User created", "data": user_data}

@router.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id, "name": "John Doe"}
```

---

## 📦 Modules and Imports

### Import Basics
```python
# Import entire module
import fastapi
import sqlalchemy

# Import specific items from module
from fastapi import FastAPI, APIRouter
from sqlalchemy import create_engine

# Import with alias
import fastapi as fp
from sqlalchemy import create_engine as create_db

# Import from your own modules
from app.core.config import settings
from app.models.user import User
```

### Module Structure
```python
# File: app/core/config.py
class Settings:
    def __init__(self):
        self.app_name = "Pennywise"

# File: app/main.py
from app.core.config import Settings  # Import the class

settings = Settings()  # Create an instance
```

### Package Structure
```
app/
├── __init__.py          # Makes 'app' a Python package
├── main.py
├── core/
│   ├── __init__.py      # Makes 'core' a package
│   └── config.py
└── api/
    ├── __init__.py
    └── endpoints/
        ├── __init__.py
        └── auth.py
```

---

## 🏷️ Type Hints

Type hints help you specify what type of data a function expects or returns.

### Basic Type Hints
```python
# Function with type hints
def greet(name: str) -> str:
    return f"Hello, {name}!"

def calculate_age(birth_year: int) -> int:
    return 2024 - birth_year

def get_user_info(user_id: int) -> tuple[str, str, int]:
    return "John", "john@example.com", 25

# Variables with type hints
age: int = 25
name: str = "John"
is_active: bool = True
```

### Complex Types
```python
from typing import List, Dict, Optional, Union

# List of strings
def get_user_names() -> List[str]:
    return ["Alice", "Bob", "Charlie"]

# Dictionary with string keys and any values
def get_user_data() -> Dict[str, any]:
    return {
        "name": "John",
        "age": 25,
        "active": True
    }

# Optional parameter (can be None)
def create_user(name: str, email: Optional[str] = None) -> Dict[str, str]:
    return {"name": name, "email": email or "default@example.com"}

# Union type (can be one of several types)
def process_data(data: Union[str, int, float]) -> str:
    return str(data)
```

---

## ⚡ Async Programming

### What is Async?
Async programming allows your application to handle multiple tasks without blocking.

### Sync vs Async
```python
# Synchronous (blocking) function
def sync_function():
    # This blocks until complete
    time.sleep(2)
    return "Done"

# Asynchronous (non-blocking) function
async def async_function():
    # This doesn't block other operations
    await asyncio.sleep(2)
    return "Done"
```

### Async Functions in FastAPI
```python
from fastapi import APIRouter

router = APIRouter()

# Async endpoint - can handle multiple requests simultaneously
@router.get("/users")
async def get_users():
    # Simulate database query
    await asyncio.sleep(0.1)
    return [
        {"id": 1, "name": "John"},
        {"id": 2, "name": "Jane"}
    ]

# Async function with database operations
async def create_user(user_data: dict):
    # This won't block other requests
    user = await database.create_user(user_data)
    return user
```

### Await Keyword
```python
async def process_user(user_id: int):
    # await means "wait for this to complete"
    user = await database.get_user(user_id)
    profile = await database.get_profile(user_id)
    
    return {
        "user": user,
        "profile": profile
    }
```

---

## 🌐 Web Development Concepts

### HTTP Methods
```python
# GET - Retrieve data
@router.get("/users")
async def get_users():
    return {"users": ["John", "Jane"]}

# POST - Create new data
@router.post("/users")
async def create_user(user_data: dict):
    return {"message": "User created", "data": user_data}

# PUT - Update existing data
@router.put("/users/{user_id}")
async def update_user(user_id: int, user_data: dict):
    return {"message": "User updated", "id": user_id}

# DELETE - Remove data
@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    return {"message": "User deleted", "id": user_id}
```

### Request/Response Cycle
```
1. Client sends HTTP request
   GET /api/v1/users HTTP/1.1
   Host: localhost:8000

2. FastAPI receives request
   - Parses URL path
   - Identifies matching endpoint
   - Extracts parameters

3. Function executes
   async def get_users():
       return {"users": [...]}

4. FastAPI sends response
   HTTP/1.1 200 OK
   Content-Type: application/json
   {"users": [...]}
```

### URL Parameters
```python
# Path parameters
@router.get("/users/{user_id}")
async def get_user(user_id: int):  # FastAPI converts to int
    return {"user_id": user_id}

# Query parameters
@router.get("/users")
async def get_users(page: int = 1, limit: int = 10):
    return {"page": page, "limit": limit}

# Usage: /users?page=2&limit=20
```

---

## 🗄️ Database Concepts

### ORM (Object-Relational Mapping)
ORM lets you work with databases using Python objects instead of SQL.

```python
# Without ORM (raw SQL)
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
user_data = cursor.fetchone()

# With ORM (SQLAlchemy)
user = session.query(User).filter(User.id == user_id).first()
```

### SQLAlchemy Models
```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<User(name='{self.name}', email='{self.email}')>"
```

### Database Operations
```python
# Create
new_user = User(name="John", email="john@example.com")
session.add(new_user)
session.commit()

# Read
user = session.query(User).filter(User.email == "john@example.com").first()

# Update
user.name = "John Doe"
session.commit()

# Delete
session.delete(user)
session.commit()
```

---

## 🎯 Project-Specific Concepts

### Pydantic Models (Data Validation)
```python
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    age: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models

# Usage in FastAPI
@router.post("/users", response_model=UserResponse)
async def create_user(user_data: UserCreate):
    # user_data is automatically validated
    user = User(**user_data.dict())
    return user
```

### Environment Variables
```python
# .env file
DATABASE_URL=postgresql://user:pass@localhost/db
JWT_SECRET_KEY=my_secret_key

# Python code
import os
from dotenv import load_dotenv

load_dotenv()  # Load .env file

database_url = os.getenv("DATABASE_URL")
secret_key = os.getenv("JWT_SECRET_KEY")
```

### JWT (JSON Web Tokens)
```python
import jwt
from datetime import datetime, timedelta

# Create token
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Verify token
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
```

---

## 🔄 Common Python Patterns

### Context Managers (with statement)
```python
# File handling
with open("file.txt", "r") as file:
    content = file.read()
# File automatically closes

# Database sessions
with Session() as session:
    user = session.query(User).first()
    # Session automatically closes
```

### List Comprehensions
```python
# Traditional way
numbers = [1, 2, 3, 4, 5]
squares = []
for num in numbers:
    squares.append(num ** 2)

# List comprehension
squares = [num ** 2 for num in numbers]

# With condition
even_squares = [num ** 2 for num in numbers if num % 2 == 0]
```

### Dictionary Comprehensions
```python
# Traditional way
users = ["Alice", "Bob", "Charlie"]
user_dict = {}
for user in users:
    user_dict[user] = len(user)

# Dictionary comprehension
user_dict = {user: len(user) for user in users}
```

### Error Handling
```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    print("This always runs")

# Custom exceptions
class UserNotFoundError(Exception):
    pass

def get_user(user_id: int):
    if user_id not in users:
        raise UserNotFoundError(f"User {user_id} not found")
    return users[user_id]
```

---

## 🚀 Running Your First FastAPI App

### Step-by-Step Setup
```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install fastapi uvicorn

# 4. Create main.py
```

### Simple FastAPI App
```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id, "name": "John Doe"}

# Run with: uvicorn main:app --reload
```

### Testing Your App
```python
# test_main.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

# Run tests: pytest test_main.py
```

---

## 📚 Additional Resources

### Python Official Documentation
- [Python Tutorial](https://docs.python.org/3/tutorial/)
- [Python Standard Library](https://docs.python.org/3/library/)

### FastAPI Documentation
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [FastAPI Advanced](https://fastapi.tiangolo.com/advanced/)

### SQLAlchemy Documentation
- [SQLAlchemy Tutorial](https://docs.sqlalchemy.org/en/14/orm/tutorial.html)

### Practice Exercises
1. Create a simple calculator API
2. Build a todo list with CRUD operations
3. Implement user authentication
4. Create a simple blog API

---

## 🎯 Key Takeaways

1. **Python is readable**: Code should be self-explanatory
2. **Indentation matters**: Use 4 spaces (not tabs)
3. **Everything is an object**: Functions, classes, modules are all objects
4. **Type hints help**: They make code more maintainable
5. **Async is powerful**: Use it for I/O operations
6. **Libraries are your friends**: Don't reinvent the wheel
7. **Testing is important**: Write tests for your code
8. **Documentation matters**: Comment your code and write docstrings

Remember: **Practice makes perfect!** Start with simple examples and gradually build up to more complex applications. 