import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// AI generation using callable function (replaces FastAPI AI generation)
export const generateDraft = onCall(async (request) => {
  const { leadId, prompt, tone } = request.data;
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Must be logged in to generate messages.");
  }

  // Example integration placeholder for OpenAI
  console.log(`Generating message for ${leadId} by user ${uid} with tone ${tone}`);
  const draftContent = `Hi ${leadId},\n\nWe noticed you might need help with ${prompt}.\n\nBest,`;
  
  return { generatedContent: draftContent };
});

// Auto status update on lead create
export const onLeadCreate = onDocumentCreated("leads/{leadId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const data = snapshot.data();
  console.log(`New lead created: ${data.name} for user ${data.userId}`);
  
  // Logic: e.g. run light-weight scoring if not present
  if (data.score === undefined) {
    await snapshot.ref.update({
      score: Math.floor(Math.random() * 100),
      is_going_cold: false
    });
  }
});
