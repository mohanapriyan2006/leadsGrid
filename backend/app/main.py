from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from app.api.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.firebase.firebase_client import FirebaseClient
from app.services.agent_executor import AgentExecutor
from app.services.agent_action_service import AgentActionService
from app.services.agent_conversation_service import AgentConversationService
from app.services.ai_router import AIRouter
from app.services.context_enhancer import ContextEnhancer
from app.services.discovery_engine import LeadDiscoveryEngine
from app.services.email_service import EmailService
from app.services.agent_run_service import AgentRunService
from app.services.ai_prompts_service import ai_prompts_service
from app.services.step_evaluator import StepEvaluator


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.debug)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        try:
            yield
        finally:
            await discovery_engine.aclose()
            await ai_prompts_service.aclose()

    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        version="0.1.0",
        default_response_class=ORJSONResponse,
        lifespan=lifespan,
    )

    firebase_client = FirebaseClient(settings)
    firebase_client.initialize()

    discovery_engine = LeadDiscoveryEngine(
        source_limit=settings.source_limit_default,
        timeout_seconds=settings.request_timeout_seconds,
    )
    ai_router = AIRouter()
    context_enhancer = ContextEnhancer()
    step_evaluator = StepEvaluator()
    email_service = EmailService(settings)
    agent_executor = AgentExecutor(
        aggregator=discovery_engine,
        ai_router=ai_router,
        email_service=email_service,
        firebase_client=firebase_client,
    )
    agent_run_service = AgentRunService(agent_executor, step_evaluator)
    agent_action_service = AgentActionService(
        discovery_engine=discovery_engine,
        lead_service=None,
        message_service=email_service,
        firebase_client=firebase_client,
    )
    agent_conversation_service = AgentConversationService(agent_action_service)

    app.state.settings = settings
    app.state.firebase_client = firebase_client
    app.state.discovery_engine = discovery_engine
    app.state.lead_aggregator = discovery_engine  # backwards compat for any legacy code
    app.state.email_service = email_service
    app.state.agent_executor = agent_executor
    app.state.agent_run_service = agent_run_service
    app.state.agent_action_service = agent_action_service
    app.state.agent_conversation_service = agent_conversation_service
    app.state.context_enhancer = context_enhancer
    app.state.step_evaluator = step_evaluator

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
