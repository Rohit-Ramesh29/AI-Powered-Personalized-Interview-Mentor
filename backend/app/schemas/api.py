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


class ExampleCase(BaseModel):
    input: str
    output: str
    explanation: str = ""


class TestCase(BaseModel):
    input: str
    expected: str


class TestResult(BaseModel):
    case: int
    input: str
    expected: str
    actual: str
    passed: bool
    runtime_ms: float | None = None


class CodeEvaluationIn(BaseModel):
    language: str
    code: str
    problem: str
    test_cases: list[TestCase] = []
    topic: str = ""
    question_index: int = -1


class QuestionListItem(BaseModel):
    index: int
    title: str
    difficulty: int
    topic: str


class CodingQuestionOut(BaseModel):
    index: int
    topic: str
    title: str
    description: str
    examples: list[ExampleCase] = []
    constraints: list[str] = []
    time_complexity: str = ""
    space_complexity: str = ""
    test_cases: list[TestCase] = []
    starter_code: str
    difficulty: int = 0
