from pydantic import BaseModel, EmailStr


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str = "Candidate"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str
    role: str
    target_companies: str
    language: str


class ResumeAnalysisOut(BaseModel):
    skills: list[str]
    technologies: list[str]
    projects: list[str]
    experience: list[str]
    certifications: list[str]
    topics: list[str]
    ats_score: int


class InterviewStartIn(BaseModel):
    mode: str
    company: str = "Amazon"
    topics: list[str] = []


class ChatTurn(BaseModel):
    role: str
    content: str
    feedback: dict | None = None


class InterviewStartOut(BaseModel):
    session_id: str
    turn: ChatTurn


class InterviewAnswerIn(BaseModel):
    answer: str


class CodeEvaluationIn(BaseModel):
    language: str
    code: str
    problem: str


class CodingQuestionOut(BaseModel):
    index: int
    topic: str
    title: str
    description: str
    starter_code: str
