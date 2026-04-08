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
    name: "THRONE DEVELOPER LLP",
    company: "THRONE DEVELOPER LLP",
    email: "",
    phone: "090471 34000",
    status: "new",
    pipelineStage: "NEW",
    isDeleted: false,
    deletedAt: null,
    source: "manual",
    notes: "Real estate developer in Coimbatore",
    tags: ["real_estate", "developer"],
    budgetEstimate: 15000,
    score: 85,
    urgency: "high",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
    // CSV fields
    category: "establishment",
    rating: 4.7,
    reviewCount: 111,
    address: "RTO Office Rd, WOMENS, Coimbatore, Tamil Nadu 641018, India",
    websiteUrl: "",
    openNow: false,
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Google&query_place_id=ChIJYS4xeLJZqDsRjvhbWpajfzo",
  },
  {
    name: "Bestreality",
    company: "Bestreality",
    email: "",
    phone: "076675 47691",
    status: "contacted",
    pipelineStage: "CONTACTED",
    isDeleted: false,
    deletedAt: null,
    source: "manual",
    notes: "Real estate services in Ganapathy",
    tags: ["real_estate"],
    budgetEstimate: 25000,
    score: 72,
    urgency: "medium",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
    // CSV fields
    category: "establishment",
    rating: 4.9,
    reviewCount: 12,
    address: "15 h, Natesa Gounder St, Lakshmipuram, Ganapathy, Coimbatore, Tamil Nadu 641027, India",
    websiteUrl: "",
    openNow: null,
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Google&query_place_id=ChIJGXtbi1lYqDsRKAP2Y7rTO6Q",
  },
  {
    name: "Avini Properties Pvt Ltd",
    company: "Avini Properties Pvt Ltd",
    email: "",
    phone: "072001 12300",
    status: "new",
    pipelineStage: "QUALIFIED",
    isDeleted: false,
    deletedAt: null,
    source: "manual",
    notes: "Property management company",
    tags: ["real_estate", "properties"],
    budgetEstimate: 8000,
    score: 68,
    urgency: "low",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
    // CSV fields
    category: "establishment",
    rating: 5,
    reviewCount: 42,
    address: "37, 3rd WEST CROSS STREET, STV Nagar, Coimbatore, Tamil Nadu 641004, India",
    websiteUrl: "",
    openNow: false,
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Google&query_place_id=ChIJU7OIeJj3qDsRsd2N7DqhMQE",
  },
  {
    name: "Karpagavruksha Real Estate",
    company: "Karpagavruksha Real Estate",
    email: "",
    phone: "095147 78726",
    status: "proposal",
    pipelineStage: "RESPONDED",
    isDeleted: false,
    deletedAt: null,
    source: "manual",
    notes: "Real estate near Nagas Tattoo",
    tags: ["real_estate", "proposal"],
    budgetEstimate: 35000,
    score: 90,
    urgency: "high",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
    // CSV fields
    category: "establishment",
    rating: 5,
    reviewCount: 22,
    address: "No531, near Nagas Tattoo, Coimbatore, Tamil Nadu 641012, India",
    websiteUrl: "",
    openNow: false,
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Google&query_place_id=ChIJPXzRMwdZqDsR-tlvxpVvq7E",
  },
  {
    name: "Property @ Coimbatore",
    company: "Property @ Coimbatore",
    email: "",
    phone: "094420 06187",
    status: "proposal",
    pipelineStage: "NEGOTIATION",
    isDeleted: false,
    deletedAt: null,
    source: "manual",
    notes: "Property consultants in Koundampalayam",
    tags: ["real_estate", "enterprise", "negotiation"],
    budgetEstimate: 50000,
    score: 95,
    urgency: "high",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastActivityAt: Timestamp.now(),
    // CSV fields
    category: "establishment",
    rating: 5,
    reviewCount: 6,
    address: "No.3, Street No. 1, Sridevi Nagar, Giri Nagar, Koundampalayam, Coimbatore, Tamil Nadu 641030, India",
    websiteUrl: "",
    openNow: true,
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Google&query_place_id=ChIJC0kF_utZqDsRCxYSF5Abz-I",
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
      {children}
    </AuthContext.Provider>
  );
};
