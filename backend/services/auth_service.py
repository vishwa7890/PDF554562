from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from decouple import config
import uuid

from models import User
from schemas import UserCreate, UserLogin, UserResponse, Token

class AuthService:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = config("SECRET_KEY", default="your-secret-key-here")
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30

    def _truncate_password(self, password: str) -> str:
        """Truncate password to 72 bytes for bcrypt compatibility.
        
        Args:
            password: The password to truncate
            
        Returns:
            str: The truncated password
        """
        if not password:
            return password
        # Encode to bytes to handle non-ASCII characters correctly
        encoded = password.encode('utf-8')
        if len(encoded) > 72:
            # Truncate to 72 bytes and decode back to string
            return encoded[:72].decode('utf-8', 'ignore')
        return password

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a hash.
        
        Args:
            plain_password: The plain text password
            hashed_password: The hashed password to verify against
            
        Returns:
            bool: True if the password matches, False otherwise
        """
        if not plain_password or not hashed_password:
            return False
        plain_password = self._truncate_password(plain_password)
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Generate a password hash.
        
        Args:
            password: The password to hash
            
        Returns:
            str: The hashed password
            
        Raises:
            HTTPException: If password is empty or too long after truncation
        """
        if not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password cannot be empty"
            )
            
        original_length = len(password.encode('utf-8'))
        if original_length > 100:  # Arbitrary large number to prevent DOS
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is too long"
            )
            
        password = self._truncate_password(password)
        return self.pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: timedelta = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    async def register_user(self, user_data: UserCreate, db: Session) -> UserResponse:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.username == user_data.username) | (User.email == user_data.email)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
        
        # Create new user
        hashed_password = self.get_password_hash(user_data.password)
        db_user = User(
            id=str(uuid.uuid4()),
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return UserResponse.from_orm(db_user)

    async def authenticate_user(self, user_data: UserLogin, db: Session) -> Token:
        user = db.query(User).filter(User.username == user_data.username).first()
        
        if not user or not self.verify_password(user_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        access_token_expires = timedelta(minutes=self.access_token_expire_minutes)
        access_token = self.create_access_token(
            data={"sub": user.username, "user_id": user.id},
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=self.access_token_expire_minutes * 60,
            user=UserResponse.from_orm(user)
        )

    async def get_current_user(self, token: str, db: Session) -> User:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            username: str = payload.get("sub")
            if username is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception
        
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise credentials_exception
        
        return user