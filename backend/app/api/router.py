from fastapi import APIRouter

from app.api.routes import ai, auth, crm, leads, manage_leads


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
api_router.include_router(manage_leads.router, prefix="/leads/manage", tags=["manage-leads"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(crm.router, prefix="/crm", tags=["crm"])
