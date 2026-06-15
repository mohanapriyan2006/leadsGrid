"""Conversational agent: intent detection, context tracking, multi-turn flow."""

import re
import uuid
from datetime import datetime
from typing import Any

from app.schemas.agent_conversation import (
    AgentActionButton,
    AgentCardData,
    AgentChatRequest,
    AgentChatResponse,
    AgentConversationState,
    AgentIntent,
    AgentMessage,
)
from app.services.agent_action_service import AgentActionService


class AgentConversationService:
    def __init__(self, action_service: AgentActionService):
        self.action_service = action_service
        self._sessions: dict[str, AgentConversationState] = {}

    # ─── Session helpers ───

    def _create_session(self) -> AgentConversationState:
        sid = str(uuid.uuid4())
        state = AgentConversationState(session_id=sid)
        self._sessions[sid] = state
        return state

    def _get_session(self, session_id: str | None) -> AgentConversationState:
        if session_id and session_id in self._sessions:
            return self._sessions[session_id]
        return self._create_session()

    # ─── Intent detection ───

    def _detect_intent(self, message: str) -> AgentIntent:
        lower = message.lower()

        discovery_keywords = [
            "find", "search", "discover", "hunt", "scout", "source",
            "new leads", "prospects", "opportunities",
        ]
        crm_keywords = [
            "create lead", "add lead", "new lead",
            "update lead", "edit lead", "change stage", "move to",
            "delete lead", "remove lead",
            "view lead", "show lead", "lead details",
            "crm", "pipeline", "stage", "manage leads",
        ]
        message_keywords = [
            "draft", "message", "email", "outreach", "send",
            "write to", "contact", "follow up", "follow-up",
        ]
        recycle_keywords = [
            "recycle", "bin", "deleted", "restore", "trash",
            "permanently delete", "hard delete",
        ]

        scores = {
            "leads_discovery": sum(1 for k in discovery_keywords if k in lower),
            "crm_operations": sum(1 for k in crm_keywords if k in lower),
            "message_generation": sum(1 for k in message_keywords if k in lower),
            "recycle_bin": sum(1 for k in recycle_keywords if k in lower),
        }

        best = max(scores, key=scores.get)  # type: ignore[arg-type]
        if scores[best] == 0:
            return "unknown"
        return best  # type: ignore[return-value]

    def _extract_lead_ids(self, message: str) -> list[str]:
        # Match UUID-like or alphanumeric IDs
        patterns = re.findall(r"\b[0-9a-fA-F\-]{20,}\b", message)
        return patterns

    def _extract_lead_name(self, message: str) -> str | None:
        # Simple heuristic: look for quoted names or capitalized words after "for" / "named"
        match = re.search(r'(?:for|named)\s+"?([A-Z][a-zA-Z\s]+)"?', message)
        if match:
            return match.group(1).strip().rstrip('"')
        return None

    def _extract_field_value(self, message: str, field_name: str) -> str | None:
        """Extract a field value like 'stage to Negotiation' or 'status to Hot'."""
        pattern = rf"{field_name}\s+(?:to|=)\s+([A-Za-z\s]+)"
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            return match.group(1).strip().rstrip('"').strip(".")
        return None

    def _fuzzy_match_attached_lead(self, message: str, attached_leads: list[dict[str, Any]]) -> dict[str, Any] | None:
        """Fuzzy-match a lead name in the message against attached leads."""
        if not attached_leads:
            return None
        name = self._extract_lead_name(message)
        if not name:
            return None
        lower_name = name.lower()
        for lead in attached_leads:
            lead_name = (lead.get("name") or lead.get("author") or "").lower()
            company = (lead.get("company") or "").lower()
            if lower_name in lead_name or lead_name in lower_name or lower_name in company:
                return lead
        return None

    def _resolve_target_lead(
        self,
        state: AgentConversationState,
        message: str,
        attached_lead_ids: list[str],
    ) -> dict[str, Any] | None:
        """Determine the target lead from context: explicit ID, fuzzy name match, or single attached lead."""
        # 1. Explicit lead IDs in message
        lead_ids = self._extract_lead_ids(message)
        if lead_ids:
            return {"id": lead_ids[0], "resolved_by": "message_id"}

        # 2. Fuzzy name match against attached leads
        if state.resolved_attached_leads:
            matched = self._fuzzy_match_attached_lead(message, state.resolved_attached_leads)
            if matched:
                return matched

        # 3. Single attached lead = implicit target
        if len(attached_lead_ids) == 1:
            lead_id = attached_lead_ids[0]
            for lead in state.resolved_attached_leads:
                if lead.get("id") == lead_id:
                    return lead
            return {"id": lead_id, "resolved_by": "single_attached"}

        return None

    def _build_context(self, state: AgentConversationState, request: AgentChatRequest) -> None:
        """Store attached lead IDs and any resolved lead data in session state."""
        if request.attached_lead_ids:
            existing = set(state.selected_lead_ids)
            for lid in request.attached_lead_ids:
                if lid not in existing:
                    state.selected_lead_ids.append(lid)

    # ─── Main chat handler ───

    async def chat(self, request: AgentChatRequest, user_id: str) -> AgentChatResponse:
        state = self._get_session(request.session_id)
        state.last_message = request.message
        state.updated_at = datetime.utcnow()

        self._build_context(state, request)

        # Handle explicit confirmations / cancellations
        if request.confirmed_action:
            return await self._handle_confirmed_action(state, request.confirmed_action, user_id)

        intent = self._detect_intent(request.message)
        state.intent = intent

        # Route to domain handler
        if intent == "leads_discovery":
            return await self._handle_discovery(state, request.message, user_id, request.attached_lead_ids)
        if intent == "crm_operations":
            return await self._handle_crm(state, request.message, user_id, request.attached_lead_ids)
        if intent == "message_generation":
            return await self._handle_message(state, request.message, user_id, request.attached_lead_ids)
        if intent == "recycle_bin":
            return await self._handle_recycle_bin(state, request.message, user_id, request.attached_lead_ids)

        # Fallback / general
        return self._text_response(
            state,
            "I'm your LeadsGrid agent. I can help you:\n"
            "• Discover new leads\n"
            "• Manage leads & CRM\n"
            "• Draft & send messages\n"
            "• Restore or delete leads from Recycle Bin\n\n"
            "What would you like to do?",
        )

    # ─── Domain handlers ───

    async def _handle_discovery(
        self, state: AgentConversationState, message: str, user_id: str, attached_lead_ids: list[str]
    ) -> AgentChatResponse:
        # Extract search query
        query = message
        for prefix in ["find", "search", "discover", "for", "discover leads"]:
            if query.lower().startswith(prefix):
                query = re.sub(rf"^{prefix}\s+", "", query, flags=re.IGNORECASE)

        # If query is vague, show a discovery filter form
        vague_terms = ["find leads", "search leads", "discover", "find new leads", "", "leads"]
        if query.lower().strip() in vague_terms or len(query.strip()) < 3:
            return self._card_response(
                state,
                AgentCardData(
                    type="agent_form",
                    title="Discovery Filters",
                    description="What type of leads are you looking for?",
                    data={
                        "fields": [
                            {"key": "industry", "label": "Industry", "type": "text", "placeholder": "e.g. SaaS, Real Estate"},
                            {"key": "location", "label": "Location", "type": "text", "placeholder": "e.g. USA, Europe"},
                            {"key": "budget", "label": "Budget", "type": "select", "options": ["Any", "<$1k", "$1k-$5k", "$5k-$20k", ">$20k"]},
                        ],
                        "form_action": "discover_with_filters",
                    },
                    actions=[
                        AgentActionButton(label="Search", action="discover_with_filters", style="primary"),
                        AgentActionButton(label="Cancel", action="cancel", style="secondary"),
                    ],
                ),
                "Let me know what you're looking for:",
            )

        card = await self.action_service.discover_leads(query, limit=10)
        return AgentChatResponse(
            agent_message=AgentMessage(
                id=str(uuid.uuid4()),
                role="agent",
                type="discovery_overview",
                content=f"Here are the top leads I found for \"{query}\":",
                card=card,
            ),
            session_id=state.session_id,
            requires_confirmation=False,
        )

    async def _handle_crm(
        self, state: AgentConversationState, message: str, user_id: str, attached_lead_ids: list[str]
    ) -> AgentChatResponse:
        lower = message.lower()
        target_lead = self._resolve_target_lead(state, message, attached_lead_ids)

        # Delete
        if any(k in lower for k in ["delete", "remove"]):
            if target_lead:
                lead_id = target_lead.get("id", "")
                lead_name = target_lead.get("name") or target_lead.get("author") or lead_id
                state.pending_action = {"type": "delete", "lead_id": lead_id}
                card = await self.action_service.delete_lead_preview(lead_id, user_id, lead_name=lead_name)
                return self._card_response(state, card, f"Review before deleting **{lead_name}**:")
            return self._text_response(
                state,
                "Which lead would you like to delete? Attach a lead or provide the lead name/ID."
            )

        # Update
        if any(k in lower for k in ["update", "edit", "change", "move to", "set"]):
            if target_lead:
                lead_id = target_lead.get("id", "")
                lead_name = target_lead.get("name") or target_lead.get("author") or lead_id
                new_stage = self._extract_field_value(message, "stage")
                new_status = self._extract_field_value(message, "status")
                fields: dict[str, Any] = {}
                if new_stage:
                    fields["stage"] = new_stage
                if new_status:
                    fields["status"] = new_status
                if fields:
                    card = await self.action_service.update_lead_preview(lead_id, fields, user_id, lead_name=lead_name)
                    state.pending_action = {"type": "update", "lead_id": lead_id, "fields": fields}
                    return self._card_response(
                        state, card, f"Review changes for **{lead_name}** before applying:"
                    )
                card = await self.action_service.read_lead(lead_id, user_id, lead_data=target_lead)
                return self._card_response(state, card, f"Here's **{lead_name}**. Click Edit to modify:")
            return self._text_response(
                state,
                "Which lead would you like to update? Attach a lead or say something like "
                '\"Update Bestrealty\'s stage to Negotiating\".',
            )

        # Create
        if any(k in lower for k in ["create", "add", "new lead"]):
            name_match = re.search(r'(?:named?|called?)\s+"?([A-Z][a-zA-Z\s]+)"?', message)
            company_match = re.search(r'(?:at|from|company)\s+"?([A-Z][a-zA-Z\s]+)"?', message)
            fields = {
                "name": name_match.group(1).strip().rstrip('"') if name_match else "",
                "company": company_match.group(1).strip().rstrip('"') if company_match else "",
                "email": "",
                "phone": "",
                "industry": "",
            }
            card = await self.action_service.create_lead_preview(fields)
            state.pending_action = {"type": "create", "fields": fields}
            return self._card_response(state, card, "Fill in the details for the new lead:")

        # Read / view
        if target_lead:
            lead_id = target_lead.get("id", "")
            lead_name = target_lead.get("name") or target_lead.get("author") or lead_id
            card = await self.action_service.read_lead(lead_id, user_id, lead_data=target_lead)
            return self._card_response(state, card, f"Here's **{lead_name}**:")

        return self._text_response(
            state,
            "I can help with CRM operations. Try saying:\n"
            "• \"Create a lead named John at Acme Inc\"\n"
            "• \"Update Bestrealty's stage to Negotiating\"\n"
            "• \"Delete Bestrealty\"\n"
            "• \"Show lead details for Bestrealty\"",
        )

    async def _handle_message(
        self, state: AgentConversationState, message: str, user_id: str, attached_lead_ids: list[str]
    ) -> AgentChatResponse:
        # If leads are already selected in session, proceed to draft
        if state.selected_lead_ids:
            card = await self.action_service.generate_message_preview(
                state.selected_lead_ids, "professional", user_id
            )
            state.pending_action = {"type": "message_draft", "lead_ids": state.selected_lead_ids}
            return self._card_response(state, card, "Here's a draft message for your selected leads:")

        # If 1 attached lead, auto-select it
        if len(attached_lead_ids) == 1:
            state.selected_lead_ids = attached_lead_ids
            lead_id = attached_lead_ids[0]
            lead_name = lead_id
            for lead in state.resolved_attached_leads:
                if lead.get("id") == lead_id:
                    lead_name = lead.get("name") or lead.get("author") or lead_id
                    break
            card = await self.action_service.generate_message_preview(
                attached_lead_ids, "professional", user_id, lead_name=lead_name
            )
            state.pending_action = {"type": "message_draft", "lead_ids": attached_lead_ids}
            return self._card_response(
                state, card, f"Using attached lead **{lead_name}**. Here's a draft message:"
            )

        # If multiple attached leads, show lead picker
        if len(attached_lead_ids) > 1:
            return self._card_response(
                state,
                AgentCardData(
                    type="lead_picker",
                    title="Select Leads",
                    description="You have multiple leads attached. Choose which ones to message:",
                    data={
                        "leads": [
                            {
                                "id": lead.get("id"),
                                "name": lead.get("name") or lead.get("author") or "Unknown",
                                "company": lead.get("company") or "",
                            }
                            for lead in state.resolved_attached_leads
                        ],
                    },
                    actions=[
                        AgentActionButton(label="Continue", action="select_leads_for_message", style="primary"),
                        AgentActionButton(label="Cancel", action="cancel", style="secondary"),
                    ],
                ),
                "You have multiple leads attached. Which ones should I draft a message for?",
            )

        # Try to extract lead IDs from message
        lead_ids = self._extract_lead_ids(message)
        if lead_ids:
            state.selected_lead_ids = lead_ids
            card = await self.action_service.generate_message_preview(lead_ids, "professional", user_id)
            state.pending_action = {"type": "message_draft", "lead_ids": lead_ids}
            return self._card_response(state, card, "Here's a draft message:")

        # Otherwise ask to select leads
        return self._text_response(
            state,
            "To draft a message, please attach a lead or specify which one. "
            "You can say:\n"
            '• \"Draft a message for my hot leads\"\n'
            '• \"Send follow-up to lead [ID]\"',
        )

    async def _handle_recycle_bin(
        self, state: AgentConversationState, message: str, user_id: str, attached_lead_ids: list[str]
    ) -> AgentChatResponse:
        lower = message.lower()
        target_lead = self._resolve_target_lead(state, message, attached_lead_ids)

        # Restore
        if "restore" in lower:
            if target_lead:
                lead_id = target_lead.get("id", "")
                lead_name = target_lead.get("name") or target_lead.get("author") or lead_id
                state.pending_action = {"type": "restore", "lead_id": lead_id}
                card = await self.action_service.restore_lead_preview(lead_id, user_id, lead_name=lead_name)
                return self._card_response(state, card, f"Restore **{lead_name}**?")
            return self._text_response(
                state, "Which lead would you like to restore? Attach a lead or provide the ID/name."
            )

        # Permanent delete
        if any(k in lower for k in ["permanently delete", "hard delete", "delete forever"]):
            if target_lead:
                lead_id = target_lead.get("id", "")
                lead_name = target_lead.get("name") or target_lead.get("author") or lead_id
                state.pending_action = {"type": "permanent_delete", "lead_id": lead_id}
                card = await self.action_service.permanent_delete_preview(lead_id, user_id, lead_name=lead_name)
                return self._card_response(state, card, f"Permanently delete **{lead_name}**?")
            return self._text_response(
                state, "Which lead would you like to permanently delete? Attach a lead or provide the ID/name."
            )

        # Default: list recycle bin
        card = await self.action_service.list_recycle_bin(user_id)
        return self._card_response(state, card, "Here are your deleted leads:")

    # ─── Confirmation handler ───

    async def _handle_confirmed_action(
        self, state: AgentConversationState, confirmed: dict[str, Any], user_id: str
    ) -> AgentChatResponse:
        action = confirmed.get("action")

        if action == "confirm_create_lead":
            fields = confirmed.get("payload", {}).get("fields", {})
            result = await self.action_service.execute_create_lead(fields, user_id)
            return self._text_response(state, f"✅ Lead created successfully: {result.get('name', 'New Lead')}")

        if action == "confirm_update_lead":
            payload = confirmed.get("payload", {})
            result = await self.action_service.execute_update_lead(payload["lead_id"], payload["fields"], user_id)
            return self._text_response(state, f"✅ Lead updated successfully: {result.get('name', 'Lead')}")

        if action == "confirm_delete_lead":
            lead_id = confirmed.get("payload", {}).get("lead_id")
            await self.action_service.execute_delete_lead(lead_id, user_id)
            return self._text_response(state, "✅ Lead moved to Recycle Bin.")

        if action == "confirm_send_message":
            payload = confirmed.get("payload", {})
            await self.action_service.execute_send_message(payload["lead_ids"], payload["content"], user_id)
            return self._text_response(state, f"✅ Message sent to {len(payload['lead_ids'])} lead(s).")

        if action == "confirm_restore_lead":
            lead_id = confirmed.get("payload", {}).get("lead_id")
            await self.action_service.execute_restore_lead(lead_id, user_id)
            return self._text_response(state, "✅ Lead restored successfully.")

        if action == "confirm_permanent_delete":
            lead_id = confirmed.get("payload", {}).get("lead_id")
            await self.action_service.execute_permanent_delete(lead_id, user_id)
            return self._text_response(state, "🗑️ Lead permanently deleted.")

        if action == "cancel":
            state.pending_action = None
            return self._text_response(state, "Action cancelled. What would you like to do next?")

        return self._text_response(state, "Unknown action. How can I help you?")

    # ─── Response builders ───

    def _text_response(self, state: AgentConversationState, content: str) -> AgentChatResponse:
        return AgentChatResponse(
            agent_message=AgentMessage(
                id=str(uuid.uuid4()),
                role="agent",
                type="text",
                content=content,
            ),
            session_id=state.session_id,
            requires_confirmation=False,
        )

    def _card_response(self, state: AgentConversationState, card: AgentCardData, content: str) -> AgentChatResponse:
        return AgentChatResponse(
            agent_message=AgentMessage(
                id=str(uuid.uuid4()),
                role="agent",
                type=card.type,
                content=content,
                card=card,
            ),
            session_id=state.session_id,
            requires_confirmation=card.requires_confirmation,
        )
