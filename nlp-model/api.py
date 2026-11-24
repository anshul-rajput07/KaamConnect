
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

from conversation_engine import KaamConnectAssistant
from db_operations import (
    register_worker,
    get_workers,
    post_job,
    get_jobs
)

app = FastAPI(title="KaamConnect API")

assistant = KaamConnectAssistant()


# ---------------- REQUEST MODELS ----------------

class ChatRequest(BaseModel):
    message: str


class WorkerRequest(BaseModel):
    name: str
    phone: str
    role: str
    city: str
    experience: int = 0
    skills: str = ""


class JobRequest(BaseModel):
    title: str
    company: str
    city: str
    salary: str
    job_type: str = ""
    description: str = ""
    shift: str = ""


# ---------------- HOME ----------------

@app.get("/")
def home():
    return {"message": "KaamConnect API is running"}


# ---------------- CHATBOT ----------------

@app.post("/chat")
def chat(request: ChatRequest):
    try:
        response = assistant.respond(request.message)

        jobs = []

        # Search actual jobs after collecting all details
        if (
            assistant.context["intent"] == "search_job"
            and assistant.awaiting is None
        ):
            role = assistant.context["role"]
            city = assistant.context["location"]
            shift = assistant.context["shift"]

            jobs = get_jobs(role, city)

            # Filter by shift
            if shift:
                normalized_shift = shift.lower().replace("-", "").replace(" ", "")

                jobs = [
                    job for job in jobs
                    if job.get("shift", "").lower().replace("-", "").replace(" ", "")
                    == normalized_shift
                ]

            if jobs:
                response = f"Great! I found {len(jobs)} matching job(s):"

                for index, job in enumerate(jobs, start=1):
                    response += (
                        f"\n\n{index}. {job['title']}"
                        f"\nCompany: {job['company']}"
                        f"\nLocation: {job['city']}"
                        f"\nSalary: ₹{job['salary']}"
                        f"\nType: {job['job_type']}"
                        f"\nShift: {job['shift']}"
                        f"\nDescription: {job['description']}"
                    )

            else:
                response = (
                    "Sorry, I couldn't find any jobs matching "
                    "your role, location and shift. "
                    "Try another city or shift."
                )

        return {
            "response": response,
            "context": assistant.context,
            "awaiting": assistant.awaiting,
            "jobs": jobs
        }

    except Exception as e:
        print("Chat error:", e)
        raise HTTPException(
            status_code=500,
            detail="Chat request failed"
        )


# ---------------- WORKER REGISTRATION ----------------

@app.post("/workers")
def create_worker(request: WorkerRequest):
    try:
        result = register_worker(
            request.name,
            request.phone,
            request.role,
            request.city,
            request.experience,
            request.skills
        )

        return {
            "success": True,
            "message": "Worker registered successfully",
            "worker": result
        }

    except Exception as e:
        print("Worker registration error:", e)
        raise HTTPException(
            status_code=500,
            detail="Unable to register worker"
        )


# ---------------- SEARCH WORKERS ----------------

@app.get("/workers")
def search_workers(
    role: Optional[str] = None,
    city: Optional[str] = None
):
    try:
        result = get_workers(role, city)

        return {
            "success": True,
            "count": len(result),
            "workers": result
        }

    except Exception as e:
        print("Worker search error:", e)
        raise HTTPException(
            status_code=500,
            detail="Unable to search workers"
        )


# ---------------- POST JOB ----------------

@app.post("/jobs")
def create_job(request: JobRequest):
    try:
        result = post_job(
            request.title,
            request.company,
            request.city,
            request.salary,
            request.job_type,
            request.description,
            request.shift
        )

        return {
            "success": True,
            "message": "Job posted successfully",
            "job": result
        }

    except Exception as e:
        print("Job posting error:", e)
        raise HTTPException(
            status_code=500,
            detail="Unable to post job"
        )


# ---------------- SEARCH JOBS ----------------

@app.get("/jobs")
def search_jobs(
    title: Optional[str] = None,
    city: Optional[str] = None
):
    try:
        result = get_jobs(title, city)

        return {
            "success": True,
            "count": len(result),
            "jobs": result
        }

    except Exception as e:
        print("Job search error:", e)
        raise HTTPException(
            status_code=500,
            detail="Unable to search jobs"
        )
