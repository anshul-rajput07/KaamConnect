
from supabase_client import supabase


# ---------------- WORKER OPERATIONS ----------------

def register_worker(name, phone, role, city,
                    experience=0, skills=""):

    worker_data = {
        "name": name,
        "phone": phone,
        "role": role,
        "city": city,
        "experience": experience,
        "skills": skills
    }

    result = supabase.table("workers").insert(
        worker_data
    ).execute()

    return result.data


def get_workers(role=None, city=None):

    query = supabase.table("workers").select("*")

    if role:
        query = query.ilike("role", f"%{role}%")

    if city:
        query = query.ilike("city", f"%{city}%")

    result = query.execute()

    return result.data


# ---------------- JOB OPERATIONS ----------------

def post_job(title, company, city, salary,
             job_type="", description="", shift=""):

    job_data = {
        "title": title,
        "company": company,
        "city": city,
        "salary": salary,
        "job_type": job_type,
        "description": description,
        "shift": shift
    }

    result = supabase.table("jobs").insert(
        job_data
    ).execute()

    return result.data


def get_jobs(title=None, city=None):

    query = supabase.table("jobs").select("*")

    if title:
        query = query.ilike("title", f"%{title}%")

    if city:
        query = query.ilike("city", f"%{city}%")

    result = query.execute()

    return result.data
