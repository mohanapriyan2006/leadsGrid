from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.firebase.firebase_client import FirebaseClient
from app.services.agent_executor import AgentExecutor
from app.services.aggregator import LeadAggregator
from app.services.ai_router import AIRouter
from app.services.email_service import EmailService


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.debug)

    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        version="0.1.0",
    )

    firebase_client = FirebaseClient(settings)
    firebase_client.initialize()

    lead_aggregator = LeadAggregator(
        source_limit=settings.source_limit_default,
        timeout_seconds=settings.request_timeout_seconds,
    )
    ai_router = AIRouter()
    email_service = EmailService(settings)
    agent_executor = AgentExecutor(
        aggregator=lead_aggregator,
        ai_router=ai_router,
        email_service=email_service,
        firebase_client=firebase_client,
    )

    app.state.settings = settings
    app.state.firebase_client = firebase_client
    app.state.lead_aggregator = lead_aggregator
    app.state.email_service = email_service
    app.state.agent_executor = agent_executor

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)
    app.include_router(api_router, prefix=settings.api_prefix)

    return app


app = create_app()
