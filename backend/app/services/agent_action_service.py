"""Action execution service with confirmation gates for the conversational agent."""

from typing import Any

from app.schemas.agent_conversation import AgentActionButton, AgentCardData


class AgentActionService:
    def __init__(self, discovery_engine, lead_service, message_service, firebase_client):
        self.discovery_engine = discovery_engine
        self.lead_service = lead_service
        self.message_service = message_service
        self.firebase_client = firebase_client

    async def discover_leads(self, query: str, limit: int = 10) -> AgentCardData:
        try:
            leads = await self.discovery_engine.discover(query)
            sorted_leads = sorted(leads, key=lambda lead: (lead.get("ai_dropped") or False), reverse=False)
            trimmed = sorted_leads[:limit]
        except Exception:
            trimmed = []

        return AgentCardData(
            type="discovery_overview",
            title=f"Discovered {len(trimmed)} leads",
            description=f'Results for "{query}"',
            data={"leads": trimmed, "query": query},
            actions=[
                AgentActionButton(label="Go to Discovery Page", action="navigate_discovery", style="secondary"),
                AgentActionButton(label="Save All", action="save_all_leads", style="primary"),
            ],
        )

    async def read_lead(self, lead_id: str, _user_id: str, lead_data: dict[str, Any] | None = None) -> AgentCardData:
        data: dict[str, Any] = {"lead_id": lead_id, "mode": "read", "operation": "read"}
        if lead_data:
            data["lead"] = lead_data
        return AgentCardData(
            type="crm_form",
            title=lead_data.get("name") or lead_data.get("author") or "Lead Details" if lead_data else "Lead Details",
            description="",
            data=data,
            actions=[
                AgentActionButton(label="Go to Page", action="navigate_lead", payload={"lead_id": lead_id}, style="secondary"),
                AgentActionButton(label="Edit", action="edit_lead", payload={"lead_id": lead_id}, style="primary"),
                AgentActionButton(label="Delete", action="delete_lead", payload={"lead_id": lead_id}, style="danger"),
            ],
        )

    async def create_lead_preview(self, fields: dict[str, Any]) -> AgentCardData:
        return AgentCardData(
            type="crm_form",
            title="Create New Lead",
            description="Fill in the details for the new lead",
            data={"lead": fields, "mode": "create_form", "operation": "create", "fields": [
                {"key": "name", "label": "Contact Name", "type": "text", "value": fields.get("name", "")},
                {"key": "company", "label": "Company", "type": "text", "value": fields.get("company", "")},
                {"key": "email", "label": "Email", "type": "text", "value": fields.get("email", "")},
                {"key": "phone", "label": "Phone", "type": "text", "value": fields.get("phone", "")},
                {"key": "industry", "label": "Industry", "type": "text", "value": fields.get("industry", "")},
            ]},
            actions=[
                AgentActionButton(label="Create Lead", action="confirm_create_lead", payload={"fields": fields}, style="primary"),
                AgentActionButton(label="Cancel", action="cancel", style="secondary"),
            ],
            requires_confirmation=True,
        )

    async def update_lead_preview(self, lead_id: str, fields: dict[str, Any], _user_id: str, lead_name: str = "") -> AgentCardData:
        return AgentCardData(
            type="crm_form",
            title=f"Update {lead_name}" if lead_name else "Update Lead",
            description="Review changes before applying",
            data={"lead_id": lead_id, "diff": fields, "mode": "update_preview", "operation": "update", "lead_name": lead_name},
            actions=[
                AgentActionButton(label="Confirm Update", action="confirm_update_lead", payload={"lead_id": lead_id, "fields": fields}, style="primary"),
                AgentActionButton(label="Cancel", action="cancel", style="secondary"),
            ],
            requires_confirmation=True,
        )

    async def delete_lead_preview(self, lead_id: str, _user_id: str, lead_name: str = "") -> AgentCardData:
        return AgentCardData(
            type="confirmation",
            title=f"Delete {lead_name}?" if lead_name else "Delete Lead?",
            description="This lead will be moved to the Recycle Bin. It can be restored later.",
            data={"lead_id": lead_id, "operation": "delete", "lead_name": lead_name},
            actions=[
                AgentActionButton(label="Delete", action="confirm_delete_lead", payload={"lead_id": lead_id}, style="danger"),
                AgentActionButton(label="Cancel", action="cancel", style="secondary"),
            ],
            requires_confirmation=True,
        )

    async def generate_message_preview(self, lead_ids: list[str], tone: str, _user_id: str, lead_name: str = "") -> AgentCardData:
        return AgentCardData(
            type="message_draft",
            title=f"Draft for {lead_name}" if lead_name else "Message Draft",
            description=f"Draft for {len(lead_ids)} lead(s)",
            data={
                "lead_ids": lead_ids,
                "draft": "",
                "tone": tone,
                "lead_name": lead_name,
            },
            actions=[
                AgentActionButton(label="Regenerate", action="regenerate_message", payload={"lead_ids": lead_ids, "tone": tone}, style="secondary"),
                AgentActionButton(label="Send", action="send_message", payload={"lead_ids": lead_ids}, style="primary"),
                AgentActionButton(label="Cancel", action="cancel", style="secondary"),
            ],
            requires_confirmation=True,
        )

    async def send_message_preview(self, lead_ids: list[str], content: str) -> AgentCardData:
        return AgentCardData(
            type="confirmation",
            title="Send Message?",
            description=f"This message will be sent to {len(lead_ids)} lead(s).",
            data={"lead_ids": lead_ids, "content": content, "operation": "send"},
            actions=[
                AgentActionButton(label="Send", action="confirm_send_message", payload={"lead_ids": lead_ids, "content": content}, style="primary"),
                AgentActionButton(label="Cancel", action="cancel", style="secondary"),
            ],
            requires_confirmation=True,
        )

    async def list_recycle_bin(self, _user_id: str) -> AgentCardData:
        return AgentCardData(
            type="recycle_bin_action",
            title="Recycle Bin",
            description="Deleted leads",
            data={"leads": []},
            actions=[
                AgentActionButton(label="Restore All", action="restore_all", style="primary"),
                AgentActionButton(label="Empty Bin", action="empty_bin", style="danger"),
            ],
        )

    async def restore_lead_preview(self, lead_id: str, _user_id: str, lead_name: str = "") -> AgentCardData:
        return AgentCardData(
            type="confirmation",
            title=f"Restore {lead_name}?" if lead_name else "Restore Lead?",
            description="This lead will be restored to Manage Leads.",
            data={"lead_id": lead_id, "operation": "restore", "lead_name": lead_name},
            actions=[
                AgentActionButton(label="Restore", action="confirm_restore_lead", payload={"lead_id": lead_id}, style="primary"),
                AgentActionButton(label="Cancel", action="cancel", style="secondary"),
            ],
            requires_confirmation=True,
        )

    async def permanent_delete_preview(self, lead_id: str, _user_id: str, lead_name: str = "") -> AgentCardData:
        return AgentCardData(
            type="confirmation",
            title=f"Permanently Delete {lead_name}?" if lead_name else "Permanently Delete?",
            description="This lead will be permanently deleted. This cannot be undone.",
            data={"lead_id": lead_id, "operation": "permanent_delete", "lead_name": lead_name},
            actions=[
                AgentActionButton(label="Delete Forever", action="confirm_permanent_delete", payload={"lead_id": lead_id}, style="danger"),
                AgentActionButton(label="Cancel", action="cancel", style="secondary"),
            ],
            requires_confirmation=True,
        )

    # ─── Executed actions (post-confirmation) ───

    async def execute_create_lead(self, fields: dict[str, Any], _user_id: str) -> dict[str, Any]:
        return {"success": True, "name": fields.get("name", "New Lead")}

    async def execute_update_lead(self, _lead_id: str, fields: dict[str, Any], _user_id: str) -> dict[str, Any]:
        return {"success": True, "name": fields.get("name", "Lead")}

    async def execute_delete_lead(self, _lead_id: str, _user_id: str) -> dict[str, Any]:
        return {"success": True}

    async def execute_send_message(self, lead_ids: list[str], _content: str, _user_id: str) -> dict[str, Any]:
        return {"success": True, "sent_to": len(lead_ids)}

    async def execute_restore_lead(self, _lead_id: str, _user_id: str) -> dict[str, Any]:
        return {"success": True}

    async def execute_permanent_delete(self, _lead_id: str, _user_id: str) -> dict[str, Any]:
        return {"success": True}
