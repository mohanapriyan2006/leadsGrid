from dataclasses import dataclass
from uuid import uuid4


JobStatus = str


@dataclass
class JobState:
    id: str
    status: JobStatus
    detail: str | None = None


class JobService:
    def __init__(self) -> None:
        self._jobs: dict[str, JobState] = {}

    def create_job(self) -> JobState:
        job = JobState(id=str(uuid4()), status="queued")
        self._jobs[job.id] = job
        return job

    def set_running(self, job_id: str) -> None:
        self._jobs[job_id] = JobState(id=job_id, status="running")

    def set_done(self, job_id: str) -> None:
        self._jobs[job_id] = JobState(id=job_id, status="done")

    def set_failed(self, job_id: str, detail: str) -> None:
        self._jobs[job_id] = JobState(id=job_id, status="failed", detail=detail)

    def get_job(self, job_id: str) -> JobState | None:
        return self._jobs.get(job_id)


job_service = JobService()
