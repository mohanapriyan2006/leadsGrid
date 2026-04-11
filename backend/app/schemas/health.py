from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str


class ReadinessResponse(BaseModel):
    status: str
    firebaseEnabled: bool
    smtpEnabled: bool
    environment: str
