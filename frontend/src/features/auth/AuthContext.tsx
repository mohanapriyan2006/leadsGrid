import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { db, getFirebaseAuth, isFirebaseConfigured } from "../../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, Timestamp } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Sample leads data for new users
const SAMPLE_LEADS = [
  {
    name: "Sarah Johnson",
    company: "TechStart Inc",
    email: "sarah.j@techstart.com",
    phone: "+1-555-0123",
    status: "new",
    pipelineStage: "NEW",
    isDeleted: false,
    deletedAt: null,
    source: "manual",
    notes: "Interested in web development services",
    tags: ["hot", "website"],
    budgetEstimate: 15000,
    score: 85,
    urgency: "high",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
  },
  {
    name: "Michael Chen",
    company: "GrowthLabs",
    email: "m.chen@growthlabs.io",
    phone: "+1-555-0456",
    status: "contacted",
    pipelineStage: "CONTACTED",
    isDeleted: false,
    deletedAt: null,
    source: "manual",
    notes: "Follow-up scheduled for next week",
    tags: ["warm"],
    budgetEstimate: 25000,
    score: 72,
    urgency: "medium",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
  },
  {
    name: "Emily Rodriguez",
    company: "Design Studio Pro",
    email: "emily@designstudio.pro",
    phone: null,
    status: "new",
    pipelineStage: "QUALIFIED",
    isDeleted: false,
    deletedAt: null,
    source: "manual",
    notes: "Looking for AI integration solutions",
    tags: ["ai", "qualified"],
    budgetEstimate: 8000,
    score: 68,
    urgency: "low",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
  },
  {
    name: "David Park",
    company: "StartupXYZ",
    email: "david@startupxyz.com",
    phone: "+1-555-0789",
    status: "proposal",
    pipelineStage: "RESPONDED",
    isDeleted: false,
    deletedAt: null,
    source: "manual",
    notes: "Sent proposal, waiting for feedback",
    tags: ["proposal", "hot"],
    budgetEstimate: 35000,
    score: 90,
    urgency: "high",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
  },
  {
    name: "Lisa Thompson",
    company: "Enterprise Solutions",
    email: "lisa.t@enterprise.com",
    phone: "+1-555-0321",
    status: "proposal",
    pipelineStage: "NEGOTIATION",
    isDeleted: false,
    deletedAt: null,
    source: "manual",
    notes: "Final negotiation stage",
    tags: ["enterprise", "negotiation"],
    budgetEstimate: 50000,
    score: 95,
    urgency: "high",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
  },
];

const createSampleLeads = async (userId: string) => {
  try {
    const leadsRef = collection(db, "users", userId, "leads");
    for (const lead of SAMPLE_LEADS) {
      await addDoc(leadsRef, lead);
    }
    console.log("Sample leads created successfully");
  } catch (error) {
    console.error("Failed to create sample leads:", error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Automatically create user profile document when first seen in Firestore.
          const userRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            await setDoc(userRef, {
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              createdAt: serverTimestamp(),
              plan: "free",
            });
            // Create sample leads for new user
            await createSampleLeads(firebaseUser.uid);
          }
        }
      } catch (error) {
        console.error("Failed to sync Firebase user profile", error);
      } finally {
        setUser(firebaseUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
