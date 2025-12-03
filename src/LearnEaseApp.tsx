import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import ReactDOM from "react-dom"; // Added for Modal Portal
import { create as createZustand } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  XCircle,
  MapPin,
  Medal,
  Star,
  Users,
  Heart,
  Sparkles,
  CheckCircle,
  X,
  Upload,
  Video,
  LayoutDashboard,
  Calendar,
  Edit2,
  MessageCircle,
  MessageSquare,
  User,
  Settings,
  Menu,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Search,
  Bell,
  Coins,
  Clock,
  Clock3,
  ArrowLeft,
  ArrowRight,
  ArrowUpCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Plus,
  Activity,
  Target,
  BookOpen,
  Folder,
  FileText,
  Layers,
  Download,
  Award,
  CheckCircle2,
  Info,
  Send,
  LifeBuoy,
  Paperclip,
  Smile,
  Rocket,
  Home,
  Shield,
  CreditCard,
  Camera,
  Mail,
  Zap,
  Key,
  Smartphone,
  Crown,
  List,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { format, formatDistanceToNow, isFuture, parseISO } from "date-fns";
import Prism from "./Prism";
import PixelBlast from "./PixelBlast";

type AvailabilityMap = Record<string, string[]>;

type MatchStatus = "pending" | "accepted" | "rejected";

interface ProfileData {
  userId: string;
  name: string;
  headline: string;
  avatarUrl: string;
  bio: string;
  teach: string[];
  learn: string[];
  availability: AvailabilityMap;
  coins: number;
  badges: string[];
  rating: number;
  sessionsCompleted: number;
  hoursTeaught: number;
  hoursLearned: number;
  joinedDate: string;
  coverUrl?: string;
  location?: string;
  status?: string;
  role: "student" | "university";
  department?: string;
  universityId?: string;
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
    twoFactorEnabled?: boolean;
  };
}

interface Match {
  id: string;
  timestamp: string;
  status: MatchStatus;
  userId: string;
  score?: number;
  user?: ProfileData;
  iLearn?: string[];
  iTeach?: string[];
  availabilityOverlap?: number;
}

interface SkillSwapRequest {
  id: string;
  initiatorId: string;
  targetId: string;
  offerSkill: string;
  requestSkill: string;
  note?: string;
  status: MatchStatus;
  createdAt: string;
  resolvedAt?: string;
}

type EnrichedSkillSwap = SkillSwapRequest & {
  partnerProfile?: ProfileData;
  isInitiator: boolean;
};

type DoubtTicketStatus = "pending" | "assigned" | "resolved";

interface DoubtTicket {
  id: string;
  studentId: string;
  teacherId: string;
  topic: string;
  details: string;
  status: DoubtTicketStatus;
  createdAt: string;
  updatedAt: string;
}

type EnrichedDoubtTicket = DoubtTicket & {
  teacherProfile?: ProfileData;
};

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  participantIds: string[];
  createdAt: string;
  lastMessage: Message | null;
  lastMessageTimestamp: string;
  unreadCount: Record<string, number>;
  messages: Message[];
  otherUser?: ProfileData;
}

interface ClubEvent {
  id: string;
  title: string;
  date: string;
  attendees: number;
}

interface PostComment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

interface Post {
  id: string;
  authorId: string;
  clubId?: string;
  timestamp: string;
  content: string;
  likes: string[];
  comments: PostComment[];
}

interface SessionData {
  id: string;
  studentId: string;
  teacherId: string;
  skill: string;
  scheduledTime: string;
  duration: number;
  status: string;
  notes?: string;
  rating?: number;
  cost?: number;
}

interface BadgeData {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface LedgerEntry {
  id: string;
  userId?: string;
  type: "earn" | "spend";
  amount: number;
  description: string;
  timestamp: string;
  sessionId?: string;
}

interface Club {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  members: string[];
  ownerId: string;
  category: string;
  coverUrl: string;
  events: ClubEvent[];
  posts: string[];
}

interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  createdBy: string;
  hostClubId?: string;
  coverUrl: string;
  createdAt: string;
  attendees: string[];
}

interface ProjectApplicant {
  userId: string;
  note?: string;
  appliedAt: string;
}

interface ProjectOpportunity {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  status: string;
  ownerId: string;
  applicants: ProjectApplicant[];
  createdAt: string;
}

interface QuestionAnswer {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  votes: number;
}

interface QuestionThread {
  id: string;
  title: string;
  content: string;
  tags: string[];
  votes: number;
  authorId: string;
  createdAt: string;
  answers: QuestionAnswer[];
}

type EnrichedPost = Post & { author: ProfileData };
type EnrichedEvent = CampusEvent & {
  hostProfile: ProfileData;
  hostClub?: Club;
};
type EnrichedProject = ProjectOpportunity & {
  owner?: ProfileData;
  ownerProfile?: ProfileData;
  applicantsDetailed?: ProfileData[];
};
type EnrichedQuestion = QuestionThread & {
  author: ProfileData;
  answers: Array<QuestionAnswer & { author: ProfileData }>;
};

const TYPOGRAPHY = {
  sans: ["'Space Grotesk'", "'Satoshi'", "sans-serif"],
  mono: ["'IBM Plex Mono'", "monospace"],
};

const DESIGN_SYSTEM = {
  palette: {
    background: "#020308",
    surface: "rgba(255,255,255,0.02)",
    border: "rgba(255,255,255,0.08)",
    textPrimary: "#F5F5F5",
    textMuted: "rgba(255,255,255,0.6)",
    accent: "#C5FF64",
    accentSoft: "rgba(197,255,100,0.12)",
  },
};

const GLASS_CHIP =
  "backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)]";
const SECTION_PANEL =
  "bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10";
const HERO_PANEL =
  "bg-white/10 backdrop-blur-[40px] rounded-[36px] border border-white/10";
const PAGE_SHELL = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8";

interface Notification {
  id: string;
  timestamp: string;
  text: string;
  read: boolean;
}

interface UserData {
  id: string;
  email: string;
  password?: string;
  createdAt: string;
}

interface MockDatabase {
  users: Record<string, UserData>;
  profiles: Record<string, ProfileData>;
  matches: Record<string, Match[]>;
  conversations: Record<string, Conversation>;
  posts: Record<string, Post>;
  sessions: Record<string, SessionData>;
  ledgers: Record<string, LedgerEntry[]>;
  badges: Record<string, BadgeData>;
  notifications: Record<string, Notification[]>;
  clubs: Record<string, Club>;
  events: Record<string, CampusEvent>;
  projects: Record<string, ProjectOpportunity>;
  questions: Record<string, QuestionThread>;
  skillSwaps: Record<string, SkillSwapRequest>;
  doubtTickets: Record<string, DoubtTicket>;
}

type AuthenticatedUser = ProfileData & {
  id: string;
  email: string;
  createdAt: string;
};

// *** RENAMED ***
const DB_KEY = "LEARNEASE_DB_V2";

/**
 * Manages all data persistence in localStorage.
 */
class MockDB {
  private db: MockDatabase;

  constructor() {
    this.db = this.load();
  }

  /**
   * Loads the database from localStorage. If empty, seeds it.
   */
  load(): MockDatabase {
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return this.ensureSeedCoverage(parsed);
      } else {
        const seededDb = SEED_DATA;
        this.save(seededDb);
        return seededDb;
      }
    } catch (e) {
      console.error("Failed to load DB, resetting...", e);
      const seededDb = SEED_DATA;
      this.save(seededDb);
      return seededDb;
    }
  }

  /**
   * Ensures newly added seed accounts exist even if older DB snapshots persist.
   */
  private ensureSeedCoverage(dbState: MockDatabase): MockDatabase {
    const nextDb = { ...dbState };
    let changed = false;

    // 1. Ensure all top-level keys exist
    (Object.keys(SEED_DATA) as Array<keyof MockDatabase>).forEach((key) => {
      if (!nextDb[key]) {
        // @ts-expect-error - Dynamic assignment
        nextDb[key] = SEED_DATA[key];
        changed = true;
      }
    });

    // 2. Ensure seed users exist
    const nextUsers = { ...nextDb.users };
    const nextProfiles = { ...nextDb.profiles };

    const emailSet = new Set(
      Object.values(nextUsers).map((user) => user.email.toLowerCase())
    );

    Object.values(SEED_DATA.users).forEach((seedUser) => {
      if (emailSet.has(seedUser.email.toLowerCase())) {
        return;
      }

      let targetId = seedUser.id;
      if (nextUsers[targetId]) {
        targetId = `seed-${targetId}`;
      }

      nextUsers[targetId] = { ...seedUser, id: targetId };

      const seedProfile = SEED_DATA.profiles[seedUser.id];
      if (seedProfile) {
        nextProfiles[targetId] = { ...seedProfile, userId: targetId };
      }

      emailSet.add(seedUser.email.toLowerCase());
      changed = true;
    });

    nextDb.users = nextUsers;
    nextDb.profiles = nextProfiles;

    // 3. Ensure other seed entities exist (Clubs, Events, Projects, Questions, Posts)
    const collectionsToMerge: Array<keyof MockDatabase> = [
      "clubs",
      "events",
      "projects",
      "questions",
      "posts",
    ];

    collectionsToMerge.forEach((collectionKey) => {
      const seedCollection = SEED_DATA[collectionKey];
      const currentCollection = nextDb[collectionKey] || {};
      let collectionChanged = false;

      // @ts-expect-error - Dynamic access
      Object.values(seedCollection).forEach((item: unknown) => {
        // @ts-expect-error - Dynamic access
        if (!currentCollection[item.id]) {
          // @ts-expect-error - Dynamic access
          currentCollection[item.id] = item;
          collectionChanged = true;
          changed = true;
        }
      });

      if (collectionChanged) {
        // @ts-expect-error - Dynamic assignment
        nextDb[collectionKey] = currentCollection;
      }
    });

    if (changed) {
      this.save(nextDb);
      return nextDb;
    }

    return dbState;
  }

  /**
   * Saves the current in-memory DB to localStorage.
   */
  save(db: MockDatabase) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      this.db = db;
    } catch (e) {
      console.error("Failed to save DB", e);
    }
  }

  /**
   * Resets the database to the initial seed data.
   */
  reset() {
    const seededDb = { ...SEED_DATA };
    // Deep copy objects to prevent mutation of the constant
    seededDb.users = { ...SEED_DATA.users };
    seededDb.profiles = { ...SEED_DATA.profiles };
    seededDb.conversations = { ...SEED_DATA.conversations };
    //... etc. for all top-level keys
    this.save(seededDb);
    console.log("Database has been reset to seed data.");
  }

  /**
   * Exports the entire DB as a JSON string.
   */
  export(): string {
    return JSON.stringify(this.db, null, 2);
  }

  /**
   * Imports a new DB state from a JSON string.
   */
  import(json: string): boolean {
    try {
      const importedDb = JSON.parse(json);
      // Add basic validation here if needed
      this.save(importedDb);
      return true;
    } catch (e) {
      console.error("Failed to import DB", e);
      return false;
    }
  }

  /**
   * Gets the current database state.
   */
  get(): MockDatabase {
    return this.db;
  }

  /**
   * Updates the database and saves it.
   * This is the primary "write" operation.
   */
  update(mutator: (db: MockDatabase) => MockDatabase) {
    const newDb = mutator(this.db);
    this.save(newDb);
  }
}

// --- (3) MOCK SEED DATA (/mock/seed.ts) ---
// 6 demo users and their data.

const SEED_DATA: MockDatabase = {
  users: {
    "user-1": {
      id: "user-1",
      email: "arun.kumar@srmap.edu.in",
      password: "password",
      createdAt: "2025-10-01T09:00:00Z",
    },
    "user-2": {
      id: "user-2",
      email: "priya.sharma@srmap.edu.in",
      password: "password",
      createdAt: "2024-10-02T10:00:00Z",
    },
    "user-3": {
      id: "user-3",
      email: "nikhil.patel@srmap.edu.in",
      password: "password",
      createdAt: "2024-10-03T11:00:00Z",
    },
    "user-4": {
      id: "user-4",
      email: "rahul.singh@srmap.edu.in",
      password: "password",
      createdAt: "2024-10-04T12:00:00Z",
    },
    "user-5": {
      id: "user-5",
      email: "anjali.verma@srmap.edu.in",
      password: "password",
      createdAt: "2024-10-05T13:00:00Z",
    },
    "user-6": {
      id: "user-6",
      email: "vikram.reddy@srmap.edu.in",
      password: "password",
      createdAt: "2024-10-06T14:00:00Z",
    },
  },
  clubs: {
    "club-1": {
      id: "club-1",
      name: "React Developers",
      description:
        "A community for React enthusiasts to share knowledge, tips, and tricks.",
      memberCount: 1240,
      members: ["user-1", "user-2"],
      ownerId: "user-1",
      category: "Technology",
      coverUrl:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800",
      events: [
        {
          id: "event-1",
          title: "React 19 Features Deep Dive",
          date: "2025-12-15T18:00:00Z",
          attendees: 45,
        },
      ],
      posts: [],
    },
    "club-2": {
      id: "club-2",
      name: "UI/UX Design Hub",
      description:
        "Discuss design trends, tools, and share your portfolio for feedback.",
      memberCount: 850,
      members: ["user-2", "user-1"],
      ownerId: "user-2",
      category: "Design",
      coverUrl:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800",
      events: [],
      posts: [],
    },
    "club-3": {
      id: "club-3",
      name: "Pythonistas",
      description: "From scripting to AI, everything Python happens here.",
      memberCount: 2100,
      members: ["user-3"],
      ownerId: "user-3",
      category: "Technology",
      coverUrl:
        "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=800",
      events: [],
      posts: [],
    },
    "club-4": {
      id: "club-4",
      name: "SRM Aces Dance Crew",
      description:
        "Classical, contemporary, and hip-hop performers representing SRM AP at every fest.",
      memberCount: 185,
      members: ["user-2", "user-5"],
      ownerId: "user-5",
      category: "Cultural",
      coverUrl:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800",
      events: [
        {
          id: "event-dance-1",
          title: "Classical Fusion Practice",
          date: "2025-12-02T17:00:00Z",
          attendees: 32,
        },
      ],
      posts: [],
    },
    "club-5": {
      id: "club-5",
      name: "Zephyr Music Collective",
      description:
        "Choir, acapella, and indie bands collaborating for campus concerts and open mics.",
      memberCount: 140,
      members: ["user-1", "user-2"],
      ownerId: "user-2",
      category: "Music",
      coverUrl:
        "https://images.unsplash.com/photo-1485579149621-3123dd979885?q=80&w=800",
      events: [],
      posts: [],
    },
    "club-6": {
      id: "club-6",
      name: "Warhawks Esports",
      description:
        "Valorant and BGMI competitive squads scrimming nightly out of the Turing esports lab.",
      memberCount: 220,
      members: ["user-3", "user-4"],
      ownerId: "user-4",
      category: "Gaming",
      coverUrl:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800",
      events: [],
      posts: [],
    },
    "club-7": {
      id: "club-7",
      name: "SRM Strikers Cricket",
      description:
        "Trial squads, weekend nets, and analytics-backed game reviews for cricket at SRM AP.",
      memberCount: 260,
      members: ["user-6", "user-4"],
      ownerId: "user-6",
      category: "Sports",
      coverUrl:
        "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=800",
      events: [],
      posts: [],
    },
    "club-8": {
      id: "club-8",
      name: "NSS SRM AP",
      description:
        "Social impact initiatives, eco drives, and literacy programs powered by NSS volunteers.",
      memberCount: 320,
      members: ["user-5", "user-2", "user-3"],
      ownerId: "user-5",
      category: "Social",
      coverUrl:
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800",
      events: [],
      posts: [],
    },
  },
  profiles: {
    "user-1": {
      userId: "user-1",
      name: "Arun Kumar",
      headline: "CSE Student | Web Dev Enthusiast",
      avatarUrl:
        "https://images.unsplash.com/photo-1509967419530-da38b4704BC6?q=80&w=400",
      bio: "Sophomore at SRM AP. Passionate about building web applications with React. Have completed several projects and want to share knowledge with juniors.",
      teach: ["React", "JavaScript", "HTML/CSS", "Web Development"],
      learn: ["UI/UX Design", "Mobile App Development", "System Design"],
      availability: {
        mon: ["17:00-19:00"],
        wed: ["17:00-19:00"],
        fri: ["16:00-18:00"],
      },
      coins: 280,
      badges: ["user-badge-1", "user-badge-2"],
      rating: 4.9,
      sessionsCompleted: 12,
      hoursTeaught: 18,
      hoursLearned: 5,
      joinedDate: "2024-02-15",
      role: "student",
    },
    "user-2": {
      userId: "user-2",
      name: "Priya Sharma",
      headline: "ECE Student | Design Lover",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
      bio: "Junior at SRM AP studying Electronics. I love UI/UX design and have been learning Figma. Happy to teach design basics and learn programming in return.",
      teach: [
        "Figma Basics",
        "UI Design Principles",
        "Design Thinking",
        "Adobe XD",
      ],
      learn: ["Python", "JavaScript", "Web Development"],
      availability: {
        tue: ["18:00-20:00"],
        thu: ["18:00-20:00"],
        sat: ["14:00-16:00"],
      },
      coins: 150,
      badges: ["user-badge-3"],
      rating: 4.8,
      sessionsCompleted: 8,
      hoursTeaught: 12,
      hoursLearned: 8,
      joinedDate: "2024-03-10",
    },
    "user-3": {
      userId: "user-3",
      name: "Nikhil Patel",
      headline: "Mech Student | Data Enthusiast",
      avatarUrl:
        "https://images.unsplash.com/photo-1542909168-82c3e7fd053b?q=80&w=400",
      bio: "Mechanical Engineering student at SRM AP. Learning Python and data analysis for research projects. Want to help others with MATLAB and data visualization.",
      teach: ["Python", "Data Analysis", "MATLAB", "Excel Advanced"],
      learn: ["Machine Learning", "Deep Learning", "IoT"],
      availability: {
        mon: ["19:00-21:00"],
        tue: ["19:00-21:00"],
      },
      coins: 200,
      badges: [],
      rating: 4.7,
      sessionsCompleted: 10,
      hoursTeaught: 15,
      hoursLearned: 4,
      joinedDate: "2024-01-22",
    },
    "user-4": {
      userId: "user-4",
      name: "Rahul Singh",
      headline: "IT Student | Tech Enthusiast",
      avatarUrl:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400",
      bio: "Final year IT student at SRM AP. Strong in DSA and competitive programming. Looking to learn web development.",
      teach: [
        "Data Structures",
        "Algorithms",
        "Problem Solving",
        "Competitive Programming",
      ],
      learn: ["Web Development", "Python", "Cloud Computing"],
      availability: {
        mon: ["16:00-18:00"],
        thu: ["16:00-18:00"],
      },
      coins: 120,
      badges: ["user-badge-4"],
      rating: 4.6,
      sessionsCompleted: 5,
      hoursTeaught: 6,
      hoursLearned: 9,
      joinedDate: "2024-04-05",
    },
    "user-5": {
      userId: "user-5",
      name: "Anjali Verma",
      headline: "BSc Student | Writer & Communicator",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
      bio: "Science student at SRM AP with passion for writing and communication. Help with English and soft skills.",
      teach: ["English Communication", "Technical Writing", "Public Speaking"],
      learn: ["Web Development", "Data Science", "Digital Marketing"],
      availability: {
        tue: ["17:00-19:00"],
        thu: ["17:00-19:00"],
      },
      coins: 175,
      badges: ["user-badge-2"],
      rating: 4.95,
      sessionsCompleted: 9,
      hoursTeaught: 14,
      hoursLearned: 3,
      joinedDate: "2024-02-28",
    },
    "user-6": {
      userId: "user-6",
      name: "Vikram Reddy",
      headline: "Mech Student | Robotics Lead",
      avatarUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cb45f1d?q=80&w=400",
      bio: "Mechanical Engineering at SRM AP. Leading robotics club. Strong in CAD, mechanical design, and automation concepts.",
      teach: ["MATLAB", "CAD Design", "Robotics Basics", "AutoCAD"],
      learn: ["Embedded Systems", "IoT", "Python for Automation"],
      availability: {
        mon: ["15:00-17:00"],
        wed: ["15:00-17:00"],
      },
      coins: 300,
      badges: [],
      rating: 4.85,
      sessionsCompleted: 15,
      hoursTeaught: 22,
      hoursLearned: 6,
      joinedDate: "2024-01-10",
      role: "student",
    },
  },
  matches: {
    // Pre-seeded matches for demo
    "user-1": [
      {
        id: "match-1",
        timestamp: "2024-10-10T09:00:00Z",
        status: "pending",
        userId: "user-2", // Priya
        score: 100, // Perfect reciprocal match
        iTeach: ["React"],
        iLearn: ["Figma Prototyping"],
        availabilityOverlap: 2, // e.g., 2 hours
      },
      {
        id: "match-2",
        timestamp: "2024-10-10T09:05:00Z",
        status: "pending",
        userId: "user-5", // Anjali
        score: 50,
        iTeach: ["React"],
        iLearn: [], // Anjali doesn't teach what Arun wants
        availabilityOverlap: 1,
      },
    ],
  },
  conversations: {
    "convo-1": {
      id: "convo-1",
      participantIds: ["user-1", "user-2"],
      createdAt: "2024-10-10T10:00:00Z",
      lastMessage: {
        id: "msg-2",
        senderId: "user-2",
        text: "Hi Arun! Absolutely. Your profile is impressive. I_d love to swap skills. Are you free next Saturday?",
        timestamp: "2024-10-10T10:05:00Z",
      },
      lastMessageTimestamp: "2024-10-10T10:05:00Z",
      unreadCount: { "user-1": 0, "user-2": 0 },
      messages: [
        {
          id: "msg-1",
          senderId: "user-1",
          text: "Hey Priya! Saw we were a match. Your Figma skills look amazing. I am a React dev and saw you wanted to learn.",
          timestamp: "2024-10-10T10:01:00Z",
        },
        {
          id: "msg-2",
          senderId: "user-2",
          text: "Hi Arun! Absolutely. Your profile is impressive. I_d love to swap skills. Are you free next Saturday?",
          timestamp: "2024-10-10T10:05:00Z",
        },
      ],
    },
    "convo-2": {
      id: "convo-2",
      participantIds: ["user-3", "user-5"],
      createdAt: "2024-10-18T08:00:00Z",
      lastMessage: {
        id: "msg-5",
        senderId: "user-5",
        text: "Pushing the piano practise playlist tonight. Drop feedback on tempo cues?",
        timestamp: "2024-10-18T22:15:00Z",
      },
      lastMessageTimestamp: "2024-10-18T22:15:00Z",
      unreadCount: { "user-3": 1, "user-5": 0 },
      messages: [
        {
          id: "msg-3",
          senderId: "user-3",
          text: "Loved the session today. Can we get metronome counts for the new jazz piece?",
          timestamp: "2024-10-18T20:05:00Z",
        },
        {
          id: "msg-4",
          senderId: "user-5",
          text: "Uploading now. Also adding fingering notes so you don't lose pace midway.",
          timestamp: "2024-10-18T21:40:00Z",
        },
        {
          id: "msg-5",
          senderId: "user-5",
          text: "Pushing the piano practise playlist tonight. Drop feedback on tempo cues?",
          timestamp: "2024-10-18T22:15:00Z",
        },
      ],
    },
    "convo-3": {
      id: "convo-3",
      participantIds: ["user-4", "user-6"],
      createdAt: "2024-10-17T06:30:00Z",
      lastMessage: {
        id: "msg-8",
        senderId: "user-6",
        text: "Booked Maker Lab slot Sunday 9 AM. Bring the carbon fiber rods!",
        timestamp: "2024-10-17T15:20:00Z",
      },
      lastMessageTimestamp: "2024-10-17T15:20:00Z",
      unreadCount: { "user-4": 0, "user-6": 0 },
      messages: [
        {
          id: "msg-6",
          senderId: "user-4",
          text: "Need your CAD to finalize the drivetrain cutouts. Can you send STEP files?",
          timestamp: "2024-10-17T07:00:00Z",
        },
        {
          id: "msg-7",
          senderId: "user-6",
          text: "Check Drive > Robotics > LineBot > rev3. Added annotations on bearing spacing.",
          timestamp: "2024-10-17T08:45:00Z",
        },
        {
          id: "msg-8",
          senderId: "user-6",
          text: "Booked Maker Lab slot Sunday 9 AM. Bring the carbon fiber rods!",
          timestamp: "2024-10-17T15:20:00Z",
        },
      ],
    },
  },
  posts: {
    "post-1": {
      id: "post-1",
      authorId: "user-1",
      timestamp: "2024-10-22T14:00:00Z",
      content:
        "Just completed my first React+Figma swap with @Priya! We covered component patterns and prototyping workflows. Highly recommend! #learnease #skillswap",
      likes: ["user-2", "user-4", "user-5", "user-3"],
      comments: [
        {
          id: "comment-1",
          authorId: "user-2",
          text: "Arun was an amazing teacher! Learned so much about React best practices. Already applying it to my projects.",
          createdAt: "2024-10-22T14:05:00Z",
        },
        {
          id: "comment-11",
          authorId: "user-4",
          text: "This is what LearnEase is all about! Love seeing people connect and grow.",
          createdAt: "2024-10-22T14:25:00Z",
        },
      ],
    },
    "post-2": {
      id: "post-2",
      authorId: "user-3",
      timestamp: "2024-10-21T09:30:00Z",
      content:
        "Started learning piano with @Anjali today! I was skeptical about teaching myself music, but the structured approach Anjali provided is game-changing. Already excited for our next session!",
      likes: ["user-5", "user-1"],
      comments: [
        {
          id: "comment-2",
          authorId: "user-5",
          text: "Nikhil, I'm so glad you're enjoying it! Your dedication to learning is inspiring. Can't wait for our next lesson!",
          createdAt: "2024-10-21T10:00:00Z",
        },
      ],
    },
    "post-3": {
      id: "post-3",
      authorId: "user-1",
      clubId: "club-1",
      timestamp: "2024-10-20T10:00:00Z",
      content:
        "The React compiler is finally out of beta! Game changer for performance optimization. Has anyone started migrating their apps?",
      likes: ["user-2", "user-3", "user-4"],
      comments: [
        {
          id: "comment-3",
          authorId: "user-2",
          text: "Not yet, but planning to test it on our next project. Have you already integrated it?",
          createdAt: "2024-10-20T10:15:00Z",
        },
      ],
    },
    "post-4": {
      id: "post-4",
      authorId: "user-2",
      clubId: "club-2",
      timestamp: "2024-10-19T11:00:00Z",
      content:
        "New resource: I created a comprehensive Figma accessibility checklist plugin. Helps you catch WCAG violations early in design. Free for the community!",
      likes: ["user-1", "user-5", "user-3"],
      comments: [],
    },
    "post-5": {
      id: "post-5",
      authorId: "user-5",
      timestamp: "2024-10-18T16:30:00Z",
      content:
        "Teaching online has been such a rewarding experience. My students are making incredible progress. Looking forward to building my online studio with web development skills. Who wants to collaborate?",
      likes: ["user-1", "user-3"],
      comments: [
        {
          id: "comment-5",
          authorId: "user-1",
          text: "Anjali, I'd love to help you build a website for your studio! Let's connect.",
          createdAt: "2024-10-18T17:00:00Z",
        },
      ],
    },
    "post-6": {
      id: "post-6",
      authorId: "user-4",
      timestamp: "2024-10-17T09:00:00Z",
      content:
        "Data analysis is changing my SEO strategy. Started learning SQL with @Rahul, and I can now pull custom reports directly from Google Analytics. Efficiency +200%!",
      likes: ["user-1"],
      comments: [],
    },
    "post-7": {
      id: "post-7",
      authorId: "user-3",
      timestamp: "2024-10-16T07:15:00Z",
      content:
        "Finished wiring Supabase realtime charts for our sustainability dashboard. DM if you want a walkthrough on using Row Level Security for clubs.",
      likes: ["user-1", "user-6"],
      comments: [
        {
          id: "comment-7",
          authorId: "user-6",
          text: "Need this for the solar bench monitor project. Thanks for sharing!",
          createdAt: "2024-10-16T07:45:00Z",
        },
      ],
    },
    "post-8": {
      id: "post-8",
      authorId: "user-2",
      clubId: "club-2",
      timestamp: "2024-10-15T18:20:00Z",
      content:
        "Dropped a mini SRM component library (buttons, cards, nav) built in Figma with Auto Layout 5. Clone link inside the club wiki!",
      likes: ["user-1", "user-3", "user-5"],
      comments: [
        {
          id: "comment-8",
          authorId: "user-1",
          text: "Imported it into my Next.js starter already. Lifesaver!",
          createdAt: "2024-10-15T19:10:00Z",
        },
      ],
    },
    "post-9": {
      id: "post-9",
      authorId: "user-6",
      clubId: "club-6",
      timestamp: "2024-10-14T21:00:00Z",
      content:
        "Robotics squad shipped a new drivetrain for the line follower Bot. Posting CAD + BOM for anyone replicating it for Tech Fest.",
      likes: ["user-3", "user-4"],
      comments: [],
    },
  },
  sessions: {
    "session-1": {
      id: "session-1",
      studentId: "user-2",
      teacherId: "user-1",
      skill: "React",
      scheduledTime: "2024-10-19T10:00:00Z",
      duration: 60,
      status: "completed",
      notes:
        "Covered hooks (useState, useEffect) and component lifecycle. Priya is a quick learner!",
      rating: 5,
      cost: 60,
    },
    "session-2": {
      id: "session-2",
      studentId: "user-3",
      teacherId: "user-5",
      skill: "Piano",
      scheduledTime: "2024-10-21T15:00:00Z",
      duration: 45,
      status: "completed",
      notes:
        "Worked on scales and basic chord progressions. Nikhil has great rhythm!",
      rating: 5,
      cost: 45,
    },
    "session-3": {
      id: "session-3",
      studentId: "user-4",
      teacherId: "user-3",
      skill: "Python & Data Analysis",
      scheduledTime: "2024-10-18T14:00:00Z",
      duration: 90,
      status: "completed",
      notes:
        "Python fundamentals and SQL basics. Rahul is already building his first data pipeline!",
      rating: 5,
      cost: 90,
    },
    "session-4": {
      id: "session-4",
      studentId: "user-1",
      teacherId: "user-2",
      skill: "Figma Prototyping",
      scheduledTime: "2024-10-20T18:30:00Z",
      duration: 60,
      status: "completed",
      notes: "Advanced prototyping techniques and design systems in Figma.",
      rating: 5,
      cost: 60,
    },
    "session-5": {
      id: "session-5",
      studentId: "user-2",
      teacherId: "user-3",
      skill: "Data Visualization",
      scheduledTime: "2024-10-22T09:00:00Z",
      duration: 60,
      status: "completed",
      notes: "Built Supabase charts + layered dashboards in Plotly.",
      rating: 5,
      cost: 60,
    },
    "session-6": {
      id: "session-6",
      studentId: "user-1",
      teacherId: "user-5",
      skill: "Public Speaking",
      scheduledTime: "2024-10-18T07:30:00Z",
      duration: 45,
      status: "completed",
      notes: "Storytelling frameworks for club demos + vocal warmups.",
      rating: 4.5,
      cost: 45,
    },
    "session-7": {
      id: "session-7",
      studentId: "user-6",
      teacherId: "user-4",
      skill: "Algorithm Design",
      scheduledTime: "2024-10-17T06:00:00Z",
      duration: 75,
      status: "completed",
      notes: "Reviewed graph heuristics for robotics path planning.",
      rating: 4.8,
      cost: 75,
    },
  },
  ledgers: {
    "user-1": [
      {
        id: "ledger-1",
        timestamp: "2024-10-19T11:00:00Z",
        type: "earn",
        amount: 60,
        description: "Taught React session to @Priya",
        sessionId: "session-1",
      },
      {
        id: "ledger-12",
        timestamp: "2024-10-18T08:30:00Z",
        type: "spend",
        amount: -45,
        description: "Learned public speaking from @Anjali",
        sessionId: "session-6",
      },
      {
        id: "ledger-7",
        timestamp: "2024-10-20T19:30:00Z",
        type: "spend",
        amount: -60,
        description: "Learned Figma from @Priya",
        sessionId: "session-4",
      },
    ],
    "user-2": [
      {
        id: "ledger-2",
        timestamp: "2024-10-19T11:00:00Z",
        type: "spend",
        amount: -60,
        description: "Learned React from @Arun",
        sessionId: "session-1",
      },
      {
        id: "ledger-10",
        timestamp: "2024-10-22T10:05:00Z",
        type: "spend",
        amount: -60,
        description: "Learned dashboards from @Nikhil",
        sessionId: "session-5",
      },
      {
        id: "ledger-8",
        timestamp: "2024-10-20T19:30:00Z",
        type: "earn",
        amount: 60,
        description: "Taught Figma to @Arun",
        sessionId: "session-4",
      },
    ],
    "user-3": [
      {
        id: "ledger-3",
        timestamp: "2024-10-21T15:45:00Z",
        type: "spend",
        amount: -45,
        description: "Learned Piano from @Anjali",
        sessionId: "session-2",
      },
      {
        id: "ledger-9",
        timestamp: "2024-10-18T15:30:00Z",
        type: "earn",
        amount: 90,
        description: "Taught Python to @Rahul",
        sessionId: "session-3",
      },
      {
        id: "ledger-11",
        timestamp: "2024-10-22T10:00:00Z",
        type: "earn",
        amount: 60,
        description: "Taught data viz to @Priya",
        sessionId: "session-5",
      },
    ],
    "user-4": [
      {
        id: "ledger-4",
        timestamp: "2024-10-18T15:30:00Z",
        type: "spend",
        amount: -90,
        description: "Learned Python from @Nikhil",
        sessionId: "session-3",
      },
      {
        id: "ledger-15",
        timestamp: "2024-10-17T07:30:00Z",
        type: "earn",
        amount: 75,
        description: "Taught algorithms to @Vikram",
        sessionId: "session-7",
      },
    ],
    "user-5": [
      {
        id: "ledger-5",
        timestamp: "2024-10-21T15:45:00Z",
        type: "earn",
        amount: 45,
        description: "Taught Piano to @Nikhil",
        sessionId: "session-2",
      },
      {
        id: "ledger-13",
        timestamp: "2024-10-18T08:15:00Z",
        type: "earn",
        amount: 45,
        description: "Coached public speaking for @Arun",
        sessionId: "session-6",
      },
    ],
    "user-6": [
      {
        id: "ledger-14",
        timestamp: "2024-10-17T07:00:00Z",
        type: "spend",
        amount: -75,
        description: "Learned algorithms from @Rahul",
        sessionId: "session-7",
      },
    ],
  },
  badges: {
    "user-badge-1": { id: "user-badge-1", name: "First Swap", icon: Medal },
    "user-badge-2": { id: "user-badge-2", name: "Teacher", icon: Star },
    "user-badge-3": { id: "user-badge-3", name: "Pioneer", icon: Users },
    "user-badge-4": { id: "user-badge-4", name: "Community Star", icon: Heart },
    "badge-top-mentor": {
      id: "badge-top-mentor",
      name: "Top Mentor",
      icon: Medal,
    },
    "badge-skill-streak": {
      id: "badge-skill-streak",
      name: "Skill Streak",
      icon: Sparkles,
    },
    "badge-helpful-teacher": {
      id: "badge-helpful-teacher",
      name: "Helpful Teacher",
      icon: Star,
    },
  },
  notifications: {
    "user-1": [
      {
        id: "notif-1",
        timestamp: "2024-10-22T09:00:00Z",
        text: "New match! @Rahul wants to learn React from you. Check their profile!",
        read: false,
      },
      {
        id: "notif-2",
        timestamp: "2024-10-20T19:31:00Z",
        text: "Priya rated your Figma lesson 5 stars! Great work!",
        read: true,
      },
      {
        id: "notif-3",
        timestamp: "2024-10-19T10:05:00Z",
        text: "New message from @Priya: 'Great session today!'",
        read: true,
      },
      {
        id: "notif-4",
        timestamp: "2024-10-19T11:01:00Z",
        text: "You earned 60 Skill Coins for teaching React!",
        read: true,
      },
    ],
    "user-2": [
      {
        id: "notif-5",
        timestamp: "2024-10-22T08:30:00Z",
        text: "Your session with @Arun is confirmed for tomorrow at 10 AM",
        read: false,
      },
      {
        id: "notif-6",
        timestamp: "2024-10-20T19:31:00Z",
        text: "Arun rated your React lesson 5 stars!",
        read: true,
      },
      {
        id: "notif-7",
        timestamp: "2024-10-19T10:05:00Z",
        text: "New message from @Arun: 'Ready for our lesson?'",
        read: true,
      },
      {
        id: "notif-8",
        timestamp: "2024-10-19T11:01:00Z",
        text: "You earned 60 Skill Coins for teaching Figma!",
        read: true,
      },
    ],
    "user-3": [
      {
        id: "notif-9",
        timestamp: "2024-10-21T14:00:00Z",
        text: "Your piano session with @Anjali starts in 1 hour!",
        read: true,
      },
      {
        id: "notif-10",
        timestamp: "2024-10-20T10:00:00Z",
        text: "Your post 'Started learning piano' got 4 likes!",
        read: true,
      },
    ],
  },
  events: {
    "event-innovation-sprint": {
      id: "event-innovation-sprint",
      title: "AI/ML Innovation Sprint",
      description:
        "48-hour rapid prototyping sprint hosted by the AI/ML community with mentors from SRM AP research labs.",
      category: "Technical",
      location: "Innovation Tower LT-4",
      date: "2025-12-05T10:00:00Z",
      createdBy: "user-3",
      hostClubId: "club-3",
      coverUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200",
      createdAt: "2024-10-22T09:00:00Z",
      attendees: ["user-1", "user-3", "user-4"],
    },
    "event-valorant-major": {
      id: "event-valorant-major",
      title: "Valorant LAN Major",
      description:
        "Warhawks Esports is hosting a LAN qualifier with shoutcasters, strategy labs, and sponsor giveaways.",
      category: "Gaming",
      location: "Turing Block - Esports Lab",
      date: "2025-12-08T19:00:00Z",
      createdBy: "user-4",
      hostClubId: "club-6",
      coverUrl:
        "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1200",
      createdAt: "2024-10-18T12:00:00Z",
      attendees: ["user-3", "user-4"],
    },
    "event-dance-auditions": {
      id: "event-dance-auditions",
      title: "SRM Aces Dance Auditions",
      description:
        "Open slots for freshers to join the cultural contingent across classical, hip-hop, and fusion styles.",
      category: "Cultural",
      location: "Performing Arts Studio",
      date: "2025-12-03T17:30:00Z",
      createdBy: "user-5",
      hostClubId: "club-4",
      coverUrl:
        "https://images.unsplash.com/photo-1489348611450-4c0d746d949b?q=80&w=1200",
      createdAt: "2024-10-15T08:00:00Z",
      attendees: ["user-2", "user-5"],
    },
    "event-cricket-tryouts": {
      id: "event-cricket-tryouts",
      title: "Cricket Trials - Winter Roster",
      description:
        "Fast bowling nets, fielding analytics, and strength testing for the winter cricket squad.",
      category: "Sports",
      location: "Main Ground Nets",
      date: "2025-12-10T06:30:00Z",
      createdBy: "user-6",
      hostClubId: "club-7",
      coverUrl:
        "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?q=80&w=1200",
      createdAt: "2024-10-12T06:00:00Z",
      attendees: ["user-4", "user-6"],
    },
    "event-product-lab": {
      id: "event-product-lab",
      title: "Product Lab Demo Day",
      description:
        "Showcase student-built SaaS ideas with live demos, jury feedback, and on-the-spot mentorship signups.",
      category: "Startup",
      location: "Research Park Auditorium",
      date: "2025-12-12T14:30:00Z",
      createdBy: "user-1",
      hostClubId: "club-1",
      coverUrl:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200",
      createdAt: "2024-10-11T09:00:00Z",
      attendees: ["user-1", "user-2", "user-3"],
    },
    "event-green-drive": {
      id: "event-green-drive",
      title: "Green Drive x NSS",
      description:
        "Campus-wide eco audit, sapling plantation, and solar bench maintenance sprint hosted by NSS SRM AP.",
      category: "Social Impact",
      location: "Innovation Tower Foyer",
      date: "2025-12-06T08:00:00Z",
      createdBy: "user-5",
      hostClubId: "club-8",
      coverUrl:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200",
      createdAt: "2024-10-09T07:00:00Z",
      attendees: ["user-2", "user-5", "user-6"],
    },
    "event-midnight-maker": {
      id: "event-midnight-maker",
      title: "Midnight Maker Garage",
      description:
        "All-night rapid prototyping lab with soldering bays, 3D printers, and mentor pit-stops from Robotics Club.",
      category: "Makerspace",
      location: "Maker Lab 2F",
      date: "2025-12-14T22:00:00Z",
      createdBy: "user-6",
      hostClubId: "club-6",
      coverUrl:
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200",
      createdAt: "2024-10-08T20:00:00Z",
      attendees: ["user-3", "user-6"],
    },
  },
  projects: {
    "project-eco-app": {
      id: "project-eco-app",
      title: "Eco Map - Campus Sustainability App",
      description:
        "Building a Flutter app that maps dustbins, solar benches, and reports plastic usage across SRM AP.",
      requiredSkills: ["Flutter", "Firebase", "UI/UX"],
      status: "Hiring",
      ownerId: "user-1",
      applicants: [
        {
          userId: "user-2",
          note: "I can lead the UI mocks and build micro-interactions in Figma.",
          appliedAt: "2024-10-22T11:00:00Z",
        },
      ],
      createdAt: "2024-10-20T07:00:00Z",
    },
    "project-dance-film": {
      id: "project-dance-film",
      title: "Dance Club Showcase Film",
      description:
        "Looking for cinematographers and video editors to shoot the SRM Aces year-end film.",
      requiredSkills: ["Video Editing", "Color Grading", "After Effects"],
      status: "Hiring",
      ownerId: "user-5",
      applicants: [],
      createdAt: "2024-10-18T16:00:00Z",
    },
    "project-robotics-bot": {
      id: "project-robotics-bot",
      title: "Line Following Bot for Tech Fest",
      description:
        "Mechanical + coding collab to build an autonomous bot with ROS and 3D-printed chassis.",
      requiredSkills: ["CAD", "Arduino", "Python"],
      status: "In Progress",
      ownerId: "user-6",
      applicants: [
        {
          userId: "user-3",
          note: "Can handle sensor fusion and data logging.",
          appliedAt: "2024-10-21T09:15:00Z",
        },
      ],
      createdAt: "2024-10-10T12:00:00Z",
    },
    "project-campus-guide": {
      id: "project-campus-guide",
      title: "Campus Guide Progressive Web App",
      description:
        "Create a PWA that maps lecture halls, food courts, and shuttle timings with offline support.",
      requiredSkills: ["Next.js", "Tailwind", "Contentful"],
      status: "Hiring",
      ownerId: "user-2",
      applicants: [
        {
          userId: "user-1",
          note: "Can wire up the CMS + map animations.",
          appliedAt: "2024-10-19T08:30:00Z",
        },
      ],
      createdAt: "2024-10-18T10:00:00Z",
    },
    "project-solar-monitor": {
      id: "project-solar-monitor",
      title: "Solar Bench Health Monitor",
      description:
        "Instrument the solar benches around SRM AP with ESP32 boards to log energy output and failures.",
      requiredSkills: ["IoT", "PCB Design", "TypeScript"],
      status: "In Progress",
      ownerId: "user-6",
      applicants: [
        {
          userId: "user-3",
          note: "Can stream telemetry to Supabase and build dashboard.",
          appliedAt: "2024-10-16T14:12:00Z",
        },
        {
          userId: "user-5",
          note: "Happy to write comms + launch story when we deploy.",
          appliedAt: "2024-10-17T11:45:00Z",
        },
      ],
      createdAt: "2024-10-14T09:20:00Z",
    },
    "project-podcast-lab": {
      id: "project-podcast-lab",
      title: "Student Podcast Lab",
      description:
        "Set up a Notion + Riverside workflow so clubs can record, edit, and publish 15-min campus podcasts weekly.",
      requiredSkills: ["Audio Editing", "Notion", "Branding"],
      status: "Completed",
      ownerId: "user-5",
      applicants: [
        {
          userId: "user-4",
          note: "Handled automation with Zapier + analytics dashboard.",
          appliedAt: "2024-10-05T07:30:00Z",
        },
      ],
      createdAt: "2024-10-04T16:00:00Z",
    },
  },
  questions: {
    "question-lab-access": {
      id: "question-lab-access",
      title: "How to book late-night access to the electronics lab?",
      content:
        "ECE juniors keep asking about lab access for IoT builds. What's the process for approvals after 8 PM?",
      tags: ["ece", "labs", "process"],
      votes: 18,
      authorId: "user-2",
      createdAt: "2024-10-19T05:00:00Z",
      answers: [
        {
          id: "answer-lab-1",
          authorId: "user-3",
          content:
            "Submit the Google Form from the HoD mailer + get a TA signature. Security clears it within 24 hrs.",
          createdAt: "2024-10-19T06:10:00Z",
          votes: 4,
        },
      ],
    },
    "question-dance-openmic": {
      id: "question-dance-openmic",
      title: "Can non-members perform at Zephyr open mic?",
      content:
        "I am from Mechanical but love singing. Do I need to audition or can I drop in for the next open mic?",
      tags: ["music", "clubs", "cultural"],
      votes: 9,
      authorId: "user-4",
      createdAt: "2024-10-18T12:30:00Z",
      answers: [
        {
          id: "answer-openmic-1",
          authorId: "user-2",
          content:
            "Just DM Zephyr on LearnEase and fill the slot form - first come first serve.",
          createdAt: "2024-10-18T13:00:00Z",
          votes: 3,
        },
      ],
    },
    "question-project-hiring": {
      id: "question-project-hiring",
      title: "Looking for a Flutter dev for Smart Shuttle app",
      content:
        "Need help building the UI for our Smart Shuttle tracker. Any club that has Flutter mentors?",
      tags: ["projects", "flutter", "transport"],
      votes: 14,
      authorId: "user-1",
      createdAt: "2024-10-17T09:45:00Z",
      answers: [
        {
          id: "answer-project-1",
          authorId: "user-2",
          content:
            "Join the SRM Skills mentoring queue - we have two Flutter mentors free next week.",
          createdAt: "2024-10-17T10:15:00Z",
          votes: 5,
        },
      ],
    },
    "question-hostel-meals": {
      id: "question-hostel-meals",
      title: "Any hacks for getting healthier hostel meals?",
      content:
        "Mess 2 late dinners are getting repetitive. Anyone coordinating salad bowls or pre-ordering from the food trucks?",
      tags: ["hostel", "food", "student-life"],
      votes: 7,
      authorId: "user-5",
      createdAt: "2024-10-16T18:10:00Z",
      answers: [
        {
          id: "answer-hostel-1",
          authorId: "user-1",
          content:
            "Grab the Saturday farmer's market produce + split a community fridge in Block D. We prep sandwiches for the week.",
          createdAt: "2024-10-16T19:00:00Z",
          votes: 2,
        },
      ],
    },
    "question-robotics-fabrication": {
      id: "question-robotics-fabrication",
      title: "Where can we laser-cut custom plates for the robotics bot?",
      content:
        "Need acrylic plates with precise tolerances. Does the maker lab accept weekend jobs or should we go off-campus?",
      tags: ["robotics", "fabrication", "maker"],
      votes: 11,
      authorId: "user-6",
      createdAt: "2024-10-15T08:40:00Z",
      answers: [
        {
          id: "answer-robotics-1",
          authorId: "user-3",
          content:
            "Drop a ticket on the Maker Slack channel before Thursday noon. They batch jobs Friday nights, pickup Saturday 10 AM.",
          createdAt: "2024-10-15T09:05:00Z",
          votes: 4,
        },
      ],
    },
  },
  skillSwaps: {},
  doubtTickets: {},
};

// --- (4) MOCK API LAYER (/mock/api.ts) ---
// The asynchronous functions that simulate a real backend.
// All functions read/write from the MockDB instance.
// Gemini API integration starts here.

const db = new MockDB();

const notifyDbChange = () => {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event("learnease:db-updated"));
  } catch (error) {
    console.warn("Failed to notify db update", error);
  }
};

/**
 * Simulates network latency.
 */
const simulateLatency = (ms = Math.random() * 800 + 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gemini API service with real LLM calls.
 */
const geminiApi = {
  /**
   * Performs the actual fetch call to the Gemini API with exponential backoff.
   * @param payload Payload sent to Gemini
   * @param retries Number of retries remaining
   * @param delay Current backoff delay
   */
  generateContentWithRetry: async (
    payload: Record<string, unknown>,
    retries = 3,
    delay = 1000
  ): Promise<string> => {
    const apiKey = ""; // Keep empty for local mock
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Gemini responded with ${response.status}`);
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts ?? [];
      const text = parts
        .map((part: { text?: string }) => part?.text ?? "")
        .join("\n")
        .trim();

      if (!text) {
        throw new Error("Gemini returned an empty response");
      }

      return text;
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return geminiApi.generateContentWithRetry(
          payload,
          retries - 1,
          delay * 2
        );
      }

      console.error("Gemini API failed", error);
      return "The monochrome AI desk is offline right now. Try again in a bit.";
    }
  },
};

const SESSION_TOKEN_KEY = "LEARNEASE_SESSION_TOKEN";

const createSessionToken = (userId: string) =>
  `sess::${userId}::${Date.now()}::${Math.random().toString(36).slice(2, 8)}`;

const extractUserIdFromToken = (token: string) => {
  const parts = token.split("::");
  return parts.length >= 2 ? parts[1] : null;
};

const persistSessionToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_TOKEN_KEY, token);
};

const readSessionToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
};

const clearSessionToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_TOKEN_KEY);
};

const mockApi = {
  auth: {
    checkSession: async () => {
      await simulateLatency(150);
      const token = readSessionToken();
      if (!token) return null;

      const userId = extractUserIdFromToken(token);
      if (!userId) {
        clearSessionToken();
        return null;
      }

      const dbState = db.get();
      const user = dbState.users[userId];
      const profile = dbState.profiles[userId];

      if (!user || !profile) {
        clearSessionToken();
        return null;
      }

      return {
        token,
        user: { ...profile, ...user, role: profile.role || "student" },
      };
    },
    login: async (email: string, password: string) => {
      await simulateLatency(400);
      const dbState = db.get();
      const userRecord = Object.values(dbState.users).find(
        (record) => record.email.toLowerCase() === email.toLowerCase()
      );

      if (!userRecord || userRecord.password !== password) {
        throw new Error("Invalid credentials");
      }

      const profile = dbState.profiles[userRecord.id];
      if (!profile) {
        throw new Error("Profile not found for this account");
      }

      const token = createSessionToken(userRecord.id);
      persistSessionToken(token);

      // Ensure role exists, default to student for legacy users
      const userWithRole = {
        ...profile,
        ...userRecord,
        role: profile.role || "student",
      };

      return { token, user: userWithRole };
    },
    signup: async (
      email: string,
      password: string,
      name: string,
      role: "student" | "university"
    ) => {
      await simulateLatency(600);
      const dbState = db.get();
      const exists = Object.values(dbState.users).some(
        (record) => record.email.toLowerCase() === email.toLowerCase()
      );

      if (exists) {
        throw new Error("Account already exists for this email");
      }

      const userId = `user-${uuidv4()}`;
      const newUser: UserData = {
        id: userId,
        email,
        password,
        createdAt: new Date().toISOString(),
      };

      const defaultProfile: ProfileData = {
        userId,
        name,
        headline:
          role === "university" ? "University Admin" : "Learner @ SRM AP",
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          name || email
        )}`,
        bio:
          role === "university"
            ? "Official University Account"
            : "Building my monochrome HQ on LearnEase.",
        teach: [],
        learn: [],
        availability: {},
        coins: 120,
        badges: [],
        rating: 5,
        sessionsCompleted: 0,
        hoursTeaught: 0,
        hoursLearned: 0,
        joinedDate: new Date().toISOString(),
        role,
      };

      db.update((currentDb) => ({
        ...currentDb,
        users: { ...currentDb.users, [userId]: newUser },
        profiles: { ...currentDb.profiles, [userId]: defaultProfile },
      }));
      notifyDbChange();

      const token = createSessionToken(userId);
      persistSessionToken(token);

      return { token, user: { ...defaultProfile, ...newUser } };
    },
    logout: async () => {
      await simulateLatency(100);
      clearSessionToken();
    },
  },

  users: {
    /**
     * Gets a single user profile.
     */
    getProfile: async (userId: string) => {
      await simulateLatency();
      const dbState = db.get();
      const user = dbState.users[userId];
      const profile = dbState.profiles[userId];
      if (!user || !profile) {
        throw new Error("User not found");
      }
      return { ...user, ...profile, role: profile.role || "student" };
    },

    /**
     * Updates a user profile.
     */
    updateProfile: async (userId: string, data: Partial<ProfileData>) => {
      await simulateLatency();
      db.update((currentDb) => {
        const currentProfile = currentDb.profiles[userId];
        return {
          ...currentDb,
          profiles: {
            ...currentDb.profiles,
            [userId]: {
              ...currentProfile,
              ...data,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
      const newProfile = db.get().profiles[userId];
      const user = db.get().users[userId];
      return { ...user, ...newProfile, role: newProfile.role || "student" };
    },
  },

  matchmaking: {
    /**
     * Finds matches based on reciprocal logic.
     */
    findMatches: async (userId: string) => {
      await simulateLatency(1000);
      const dbState = db.get();
      const currentUser = dbState.profiles[userId];
      if (!currentUser) throw new Error("Current user not found");

      const myLearns = new Set(
        currentUser.learn.map((s: string) => s.toLowerCase())
      );
      const myTeaches = new Set(
        currentUser.teach.map((s: string) => s.toLowerCase())
      );

      const allUsers = Object.values(dbState.profiles);
      const matches: Match[] = [];

      for (const otherUser of allUsers) {
        if (otherUser.userId === userId) continue;

        const theirTeaches = new Set(
          otherUser.teach.map((s: string) => s.toLowerCase())
        );
        const theirLearns = new Set(
          otherUser.learn.map((s: string) => s.toLowerCase())
        );

        const iLearnFromO: string[] = [];
        const iTeachToO: string[] = [];

        // Check: What I can learn from them
        myLearns.forEach((skill) => {
          if (theirTeaches.has(skill)) {
            iLearnFromO.push(skill);
          }
        });

        // Check: What I can teach them
        myTeaches.forEach((skill) => {
          if (theirLearns.has(skill)) {
            iTeachToO.push(skill);
          }
        });

        // **MODIFIED SCORING**
        // Reciprocal matches are worth *way* more
        const reciprocalScore =
          iLearnFromO.length > 0 && iTeachToO.length > 0 ? 50 : 0;
        const learnScore = iLearnFromO.length * 10;
        const teachScore = iTeachToO.length * 5; // Learning is weighted higher
        const score = reciprocalScore + learnScore + teachScore;

        if (score > 0) {
          // TODO: Compute availability overlap
          matches.push({
            id: `match-${uuidv4()}`,
            userId: otherUser.userId,
            timestamp: new Date().toISOString(),
            status: "pending",
            user: otherUser,
            score,
            iLearn: iLearnFromO,
            iTeach: iTeachToO,
            availabilityOverlap: 2, // Mocked
          });
        }
      }

      // Return ranked matches
      return matches.sort((a, b) => (b.score || 0) - (a.score || 0));
    },
  },

  skillSwap: {
    listByUser: async (userId: string): Promise<EnrichedSkillSwap[]> => {
      await simulateLatency(200);
      const dbState = db.get();
      return Object.values(dbState.skillSwaps || {})
        .filter(
          (swap) => swap.initiatorId === userId || swap.targetId === userId
        )
        .map((swap) => ({
          ...swap,
          partnerProfile:
            dbState.profiles[
              swap.initiatorId === userId ? swap.targetId : swap.initiatorId
            ],
          isInitiator: swap.initiatorId === userId,
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },
    request: async (params: {
      initiatorId: string;
      targetId: string;
      offerSkill: string;
      requestSkill: string;
      note?: string;
    }): Promise<SkillSwapRequest> => {
      await simulateLatency(250);
      const { initiatorId, targetId, offerSkill, requestSkill, note } = params;
      if (initiatorId === targetId) {
        throw new Error("Cannot swap skills with yourself");
      }
      if (!offerSkill || !requestSkill) {
        throw new Error("Select both skills to swap");
      }

      const dbState = db.get();
      const duplicate = Object.values(dbState.skillSwaps || {}).find(
        (swap) =>
          swap.status === "pending" &&
          ((swap.initiatorId === initiatorId && swap.targetId === targetId) ||
            (swap.initiatorId === targetId && swap.targetId === initiatorId))
      );
      if (duplicate) {
        throw new Error("You already have a pending swap with this student");
      }

      const id = `swap-${uuidv4()}`;
      const newSwap: SkillSwapRequest = {
        id,
        initiatorId,
        targetId,
        offerSkill,
        requestSkill,
        note,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      db.update((currentDb) => {
        const skillSwaps: Record<string, SkillSwapRequest> =
          currentDb.skillSwaps ? { ...currentDb.skillSwaps } : {};
        skillSwaps[id] = newSwap;
        return {
          ...currentDb,
          skillSwaps,
        };
      });
      notifyDbChange();
      return newSwap;
    },
    respond: async (
      swapId: string,
      responderId: string,
      action: "accept" | "decline"
    ): Promise<SkillSwapRequest> => {
      await simulateLatency(200);
      let updated: SkillSwapRequest | undefined;
      db.update((currentDb) => {
        const container: Record<string, SkillSwapRequest> = currentDb.skillSwaps
          ? { ...currentDb.skillSwaps }
          : {};
        const existing = container[swapId];
        if (!existing) {
          throw new Error("Swap not found");
        }
        if (
          existing.initiatorId !== responderId &&
          existing.targetId !== responderId
        ) {
          throw new Error("You are not part of this swap");
        }
        const nextStatus: MatchStatus =
          action === "accept" ? "accepted" : "rejected";
        const nextSwap: SkillSwapRequest = {
          ...existing,
          status: nextStatus,
          resolvedAt: new Date().toISOString(),
        };
        updated = nextSwap;
        const nextSkillSwaps = { ...container, [swapId]: nextSwap };
        return {
          ...currentDb,
          skillSwaps: nextSkillSwaps,
        };
      });
      if (!updated) {
        throw new Error("Swap not found");
      }
      notifyDbChange();
      return updated;
    },
  },

  chat: {
    /**
     * Gets all conversations for a user.
     */
    getConversations: async (userId: string) => {
      await simulateLatency();
      const dbState = db.get();
      const allConvos = Object.values(dbState.conversations);
      const userConvos = allConvos.filter((convo) =>
        convo.participantIds.includes(userId)
      );

      // Enrich with "other user" data
      return userConvos
        .map((convo) => {
          const otherId = convo.participantIds.find(
            (id: string) => id !== userId
          );
          const otherUser = otherId ? dbState.profiles[otherId] : undefined;
          const lastMessage = convo.messages[convo.messages.length - 1] || null;
          return {
            ...convo,
            otherUser,
            lastMessage,
          };
        })
        .sort((a, b) => {
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return (
            new Date(b.lastMessage.timestamp).getTime() -
            new Date(a.lastMessage.timestamp).getTime()
          );
        });
    },

    /**
     * *** NEW FUNCTION ***
     * Gets a convo between two users, or creates one if it doesn't exist.
     */
    getOrCreateConversation: async (userIdA: string, userIdB: string) => {
      await simulateLatency(150);
      const dbState = db.get();

      // Find existing
      let convo = Object.values(dbState.conversations).find(
        (c) =>
          c.participantIds.includes(userIdA) &&
          c.participantIds.includes(userIdB)
      );

      if (convo) {
        console.log("Found existing convo:", convo.id);
      } else {
        // Create new
        console.log("Creating new convo...");
        const convoId = `convo-${uuidv4()}`;
        convo = {
          id: convoId,
          participantIds: [userIdA, userIdB],
          messages: [], // Start with no messages
          unreadCount: {},
          lastMessage: null,
          lastMessageTimestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        db.update((currentDb) => ({
          ...currentDb,
          conversations: { ...currentDb.conversations, [convoId]: convo! },
        }));
      }

      // Enrich and return
      const otherId = convo!.participantIds.find(
        (id: string) => id !== userIdA
      );
      const otherUser = otherId ? dbState.profiles[otherId] : undefined;
      const lastMessage = convo!.messages[convo!.messages.length - 1] || null;

      return {
        ...convo!,
        otherUser,
        lastMessage,
      };
    },

    /**
     * Sends a message.
     */
    sendMessage: async (
      conversationId: string,
      senderId: string,
      text: string
    ) => {
      await simulateLatency(100);
      const newMessage = {
        id: `msg-${uuidv4()}`,
        senderId,
        text,
        timestamp: new Date().toISOString(),
      };

      db.update((currentDb) => {
        const convo = currentDb.conversations[conversationId];
        if (convo) {
          convo.messages.push(newMessage);
          return {
            ...currentDb,
            conversations: {
              ...currentDb.conversations,
              [conversationId]: convo,
            },
          };
        }
        return currentDb;
      });
      return newMessage;
    },
  },

  sessions: {
    /**
     * Creates a new session.
     */
    create: async (data: {
      studentId: string;
      teacherId: string;
      skill: string;
      scheduledTime: string;
      duration: number;
    }) => {
      await simulateLatency();
      // Prevent scheduling if learner doesn't have enough coins (MVP rule)
      const dbStateCheck = db.get();
      const studentProfileCheck = dbStateCheck.profiles[data.studentId];
      if (!studentProfileCheck) throw new Error("Student profile not found");
      if ((studentProfileCheck.coins || 0) < 10) {
        throw new Error(
          "Insufficient Skill Coins to schedule a session (need at least 10)."
        );
      }

      const sessionId = `session-${uuidv4()}`;
      const newSession = {
        id: sessionId,
        ...data,
        status: "scheduled" as const,
        createdAt: new Date().toISOString(),
        cost: 10,
      };

      db.update((currentDb) => ({
        ...currentDb,
        sessions: { ...currentDb.sessions, [sessionId]: newSession },
      }));
      return newSession;
    },

    /**
     * Completes a session, adds rating, and moves coins.
     */
    complete: async (sessionId: string, rating: number, notes: string) => {
      await simulateLatency(1000);
      const dbState = db.get();
      const session = dbState.sessions[sessionId];
      if (!session) throw new Error("Session not found");

      // MVP coin model: fixed 10 coins per session (teacher +10, learner -10)
      const cost = 10;

      db.update((currentDb) => {
        // 1. Update session
        session.status = "completed";
        session.rating = rating;
        session.notes = notes;
        session.cost = cost; // Ensure cost is saved

        // 2. Adjust coins for student (spend)
        const studentProfile = currentDb.profiles[session.studentId];
        studentProfile.coins -= cost;

        // 3. Adjust coins for teacher (earn)
        const teacherProfile = currentDb.profiles[session.teacherId];
        teacherProfile.coins += cost;

        const now = new Date().toISOString();

        // 4. Create ledger for student
        const studentLedger = currentDb.ledgers[session.studentId] || [];
        studentLedger.push({
          id: `ledger-${uuidv4()}`,
          timestamp: now,
          type: "spend",
          amount: -cost,
          description: `Learned 1hr ${session.skill} from @${
            teacherProfile.name.split(" ")[0]
          }`,
          sessionId,
        });

        // 5. Create ledger for teacher
        const teacherLedger = currentDb.ledgers[session.teacherId] || [];
        teacherLedger.push({
          id: `ledger-${uuidv4()}`,
          timestamp: now,
          type: "earn",
          amount: cost,
          description: `Taught 1hr ${session.skill} to @${
            studentProfile.name.split(" ")[0]
          }`,
          sessionId,
        });

        // 6. Update teacher rating and badges (simple rules)
        // Recompute teacher average rating from completed sessions
        const completedForTeacher = Object.values(currentDb.sessions).filter(
          (s): s is SessionData =>
            s.teacherId === session.teacherId && s.status === "completed"
        );
        const ratings = completedForTeacher.map(
          (s: SessionData) => s.rating || 0
        );
        const avgRating = ratings.length
          ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
          : 0;
        teacherProfile.rating = Math.round(avgRating * 10) / 10;

        // Badge awarding (MVP simple rules)
        const teacherCompletedCount = completedForTeacher.length;
        teacherProfile.badges = teacherProfile.badges || [];
        if (
          teacherCompletedCount >= 10 &&
          !teacherProfile.badges.includes("badge-top-mentor")
        ) {
          teacherProfile.badges.push("badge-top-mentor");
        }
        if (
          teacherCompletedCount >= 5 &&
          !teacherProfile.badges.includes("badge-skill-streak")
        ) {
          teacherProfile.badges.push("badge-skill-streak");
        }
        if (
          teacherProfile.rating > 4.5 &&
          !teacherProfile.badges.includes("badge-helpful-teacher")
        ) {
          teacherProfile.badges.push("badge-helpful-teacher");
        }

        return {
          ...currentDb,
          sessions: { ...currentDb.sessions, [sessionId]: session },
          profiles: {
            ...currentDb.profiles,
            [session.studentId]: studentProfile,
            [session.teacherId]: teacherProfile,
          },
          ledgers: {
            ...currentDb.ledgers,
            [session.studentId]: studentLedger,
            [session.teacherId]: teacherLedger,
          },
        };
      });

      notifyDbChange();

      return db.get().sessions[sessionId];
    },
  },

  doubts: {
    listByUser: async (userId: string): Promise<EnrichedDoubtTicket[]> => {
      await simulateLatency(200);
      const dbState = db.get();
      return Object.values(dbState.doubtTickets || {})
        .filter(
          (ticket) => ticket.studentId === userId || ticket.teacherId === userId
        )
        .map((ticket) => ({
          ...ticket,
          teacherProfile: dbState.profiles[ticket.teacherId],
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },
    createTicket: async (params: {
      studentId: string;
      topic: string;
      details: string;
    }): Promise<{ ticket: DoubtTicket; teacherProfile: ProfileData }> => {
      await simulateLatency(300);
      const { studentId, topic, details } = params;
      if (!topic?.trim()) {
        throw new Error("Pick a topic to discuss");
      }
      if (!details?.trim()) {
        throw new Error("Give mentors a short brief about your doubt");
      }
      const dbState = db.get();
      const topicLower = topic.toLowerCase();
      const candidates = Object.values(dbState.profiles).filter((profile) => {
        if (profile.userId === studentId) return false;
        const teaches = (profile.teach || []).map((s) => s.toLowerCase());
        return teaches.includes(topicLower);
      });
      const orderedCandidates = candidates.sort((a, b) => {
        const ratingA = typeof a.rating === "number" ? a.rating : 0;
        const ratingB = typeof b.rating === "number" ? b.rating : 0;
        return ratingB - ratingA;
      });
      const teacherProfile = orderedCandidates[0];
      if (!teacherProfile) {
        throw new Error("No mentors available for that topic right now");
      }
      const id = `doubt-${uuidv4()}`;
      const now = new Date().toISOString();
      const ticket: DoubtTicket = {
        id,
        studentId,
        teacherId: teacherProfile.userId,
        topic,
        details,
        status: "assigned",
        createdAt: now,
        updatedAt: now,
      };
      db.update((currentDb) => {
        const tickets: Record<string, DoubtTicket> = currentDb.doubtTickets
          ? { ...currentDb.doubtTickets }
          : {};
        tickets[id] = ticket;
        return {
          ...currentDb,
          doubtTickets: tickets,
        };
      });
      notifyDbChange();
      return { ticket, teacherProfile };
    },
    resolveTicket: async (ticketId: string, resolverId: string) => {
      await simulateLatency(150);
      db.update((currentDb) => {
        const ticket = currentDb.doubtTickets[ticketId];
        if (!ticket) {
          throw new Error("Ticket not found");
        }
        if (
          ticket.studentId !== resolverId &&
          ticket.teacherId !== resolverId
        ) {
          throw new Error("You cannot resolve this ticket");
        }
        const nextTicket = {
          ...ticket,
          status: "resolved" as DoubtTicketStatus,
          updatedAt: new Date().toISOString(),
        };
        const tickets: Record<string, DoubtTicket> = currentDb.doubtTickets
          ? { ...currentDb.doubtTickets }
          : {};
        tickets[ticketId] = nextTicket;
        return {
          ...currentDb,
          doubtTickets: tickets,
        };
      });
      notifyDbChange();
      return db.get().doubtTickets[ticketId];
    },
  },

  community: {
    /**
     * Gets all posts.
     */
    getPosts: async (clubId?: string): Promise<EnrichedPost[]> => {
      await simulateLatency();
      const dbState = db.get();
      const posts = Object.values(dbState.posts);
      const profiles = dbState.profiles;

      let filteredPosts = posts;
      if (clubId) {
        filteredPosts = posts.filter((p: Post) => p.clubId === clubId);
      } else {
        // Global feed shows posts without a clubId
        filteredPosts = posts.filter((p: Post) => !p.clubId);
      }

      // Enrich posts with author data
      return filteredPosts
        .map((post) => ({
          ...post,
          author: profiles[post.authorId],
        }))
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    },

    /**
     * Creates a new post.
     */
    createPost: async (
      authorId: string,
      content: string,
      clubId?: string
    ): Promise<EnrichedPost> => {
      await simulateLatency();
      const postId = `post-${uuidv4()}`;
      const newPost = {
        id: postId,
        authorId,
        clubId,
        timestamp: new Date().toISOString(),
        content,
        likes: [],
        comments: [],
      };

      db.update((currentDb) => {
        const posts = currentDb.posts ?? {};
        return {
          ...currentDb,
          posts: { ...posts, [postId]: newPost },
        };
      });

      const author = db.get().profiles[authorId];
      return { ...newPost, author };
    },

    // --- CLUBS ---
    getClubs: async () => {
      await simulateLatency(300);
      const clubs = Object.values(db.get().clubs || {});
      return clubs;
    },

    joinClub: async (clubId: string, userId: string) => {
      await simulateLatency(300);
      db.update((d) => {
        const club = d.clubs[clubId];
        if (club && !club.members.includes(userId)) {
          club.members.push(userId);
          club.memberCount++;
        }
        return d;
      });
      return db.get().clubs[clubId];
    },

    createClub: async (
      userId: string,
      clubData: Omit<
        Club,
        "id" | "memberCount" | "members" | "events" | "posts" | "ownerId"
      >
    ) => {
      await simulateLatency(500);
      const newClub = {
        id: uuidv4(),
        ...clubData,
        ownerId: userId,
        memberCount: 1,
        members: [userId],
        events: [],
        posts: [],
      };
      db.update((d) => {
        d.clubs = d.clubs || {};
        d.clubs[newClub.id] = newClub;
        return d;
      });
      return newClub;
    },

    createEvent: async (
      clubId: string,
      eventData: Omit<ClubEvent, "id" | "attendees">
    ) => {
      await simulateLatency(500);
      const newEvent = {
        id: `event-${uuidv4()}`,
        ...eventData,
        attendees: 0,
      };
      db.update((d) => {
        const club = d.clubs[clubId];
        if (club) {
          club.events.push(newEvent);
        }
        return d;
      });
      return newEvent;
    },
    getEvents: async (): Promise<EnrichedEvent[]> => {
      await simulateLatency(200);
      const dbState = db.get();
      const events = Object.values(dbState.events || {});
      return events
        .map((event) => ({
          ...event,
          hostProfile: dbState.profiles[event.createdBy],
          hostClub: event.hostClubId
            ? dbState.clubs[event.hostClubId]
            : undefined,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    },
    rsvpEvent: async (eventId: string, userId: string) => {
      await simulateLatency(150);
      let updatedEvent: CampusEvent | undefined;
      db.update((currentDb) => {
        const event = currentDb.events[eventId];
        if (!event) {
          throw new Error("Event not found");
        }
        if (!event.attendees.includes(userId)) {
          event.attendees = [...event.attendees, userId];
        }
        updatedEvent = event;
        return currentDb;
      });
      notifyDbChange();
      const dbState = db.get();
      return {
        ...updatedEvent!,
        hostProfile: dbState.profiles[updatedEvent!.createdBy],
        hostClub: updatedEvent!.hostClubId
          ? dbState.clubs[updatedEvent!.hostClubId]
          : undefined,
      };
    },
    createCampusEvent: async (
      eventData: Omit<CampusEvent, "id" | "createdAt" | "attendees">
    ) => {
      await simulateLatency(300);
      const id = `campus-event-${uuidv4()}`;
      const newEvent: CampusEvent = {
        id,
        ...eventData,
        attendees: [],
        createdAt: new Date().toISOString(),
      };
      db.update((currentDb) => {
        const events = currentDb.events ?? {};
        return {
          ...currentDb,
          events: { ...events, [id]: newEvent },
        };
      });
      notifyDbChange();
      const dbState = db.get();
      return {
        ...newEvent,
        hostProfile: dbState.profiles[newEvent.createdBy],
        hostClub: newEvent.hostClubId
          ? dbState.clubs[newEvent.hostClubId]
          : undefined,
      };
    },
    createProject: async (
      project: Omit<ProjectOpportunity, "id" | "applicants" | "createdAt">
    ) => {
      await simulateLatency(250);
      const id = `project-${uuidv4()}`;
      const newProject: ProjectOpportunity = {
        id,
        ...project,
        applicants: [],
        createdAt: new Date().toISOString(),
      };
      db.update((currentDb) => {
        const projects = currentDb.projects ?? {};
        return {
          ...currentDb,
          projects: { ...projects, [id]: newProject },
        };
      });
      notifyDbChange();
      const dbState = db.get();
      return {
        ...newProject,
        ownerProfile: dbState.profiles[newProject.ownerId],
      };
    },
    getProjects: async (): Promise<EnrichedProject[]> => {
      await simulateLatency(200);
      const dbState = db.get();
      return Object.values(dbState.projects || {})
        .map((project) => ({
          ...project,
          ownerProfile: dbState.profiles[project.ownerId],
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },
    applyProject: async (projectId: string, userId: string, note?: string) => {
      await simulateLatency(150);
      let updatedProject: ProjectOpportunity | undefined;
      db.update((currentDb) => {
        const project = currentDb.projects[projectId];
        if (!project) {
          throw new Error("Project not found");
        }
        const alreadyApplied = project.applicants.some(
          (applicant) => applicant.userId === userId
        );
        if (!alreadyApplied) {
          project.applicants.push({
            userId,
            note,
            appliedAt: new Date().toISOString(),
          });
        }
        updatedProject = project;
        return currentDb;
      });
      notifyDbChange();
      const dbState = db.get();
      return {
        ...updatedProject!,
        ownerProfile: dbState.profiles[updatedProject!.ownerId],
      };
    },
    askQuestion: async (question: {
      title: string;
      content: string;
      tags: string[];
      authorId: string;
    }) => {
      await simulateLatency(200);
      const id = `q-${uuidv4()}`;
      const newQuestion: QuestionThread = {
        id,
        ...question,
        votes: 0,
        answers: [],
        createdAt: new Date().toISOString(),
      };
      db.update((currentDb) => {
        currentDb.questions[id] = newQuestion;
        return currentDb;
      });
      notifyDbChange();
      const dbState = db.get();
      return {
        ...newQuestion,
        author: dbState.profiles[newQuestion.authorId],
        answers: [],
      };
    },
    getQuestions: async (): Promise<EnrichedQuestion[]> => {
      await simulateLatency(200);
      const dbState = db.get();
      return Object.values(dbState.questions || {})
        .map((question) => ({
          ...question,
          author: dbState.profiles[question.authorId],
          answers: question.answers.map((answer) => ({
            ...answer,
            author: dbState.profiles[answer.authorId],
          })),
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },
    answerQuestion: async (
      questionId: string,
      answer: { authorId: string; content: string }
    ) => {
      await simulateLatency(150);
      let updatedQuestion: QuestionThread | undefined;
      db.update((currentDb) => {
        const question = currentDb.questions[questionId];
        if (!question) {
          throw new Error("Question not found");
        }
        question.answers.push({
          id: `answer-${uuidv4()}`,
          authorId: answer.authorId,
          content: answer.content,
          createdAt: new Date().toISOString(),
          votes: 0,
        });
        updatedQuestion = question;
        return currentDb;
      });
      notifyDbChange();
      const dbState = db.get();
      return {
        ...updatedQuestion!,
        author: dbState.profiles[updatedQuestion!.authorId],
        answers: updatedQuestion!.answers.map((ans) => ({
          ...ans,
          author: dbState.profiles[ans.authorId],
        })),
      };
    },
    voteQuestion: async (questionId: string, delta: number) => {
      await simulateLatency(100);
      let updatedQuestion: QuestionThread | undefined;
      db.update((currentDb) => {
        const question = currentDb.questions[questionId];
        if (!question) {
          throw new Error("Question not found");
        }
        question.votes = (question.votes || 0) + delta;
        updatedQuestion = question;
        return currentDb;
      });
      notifyDbChange();
      const dbState = db.get();
      return {
        ...updatedQuestion!,
        author: dbState.profiles[updatedQuestion!.authorId],
        answers: updatedQuestion!.answers.map((ans) => ({
          ...ans,
          author: dbState.profiles[ans.authorId],
        })),
      };
    },
  },

  admin: {
    /**
     * Exports the DB.
     */
    exportDb: async () => {
      await simulateLatency(100);
      return db.export();
    },

    /**
     * Imports the DB.
     */
    importDb: async (json: string) => {
      await simulateLatency(100);
      const success = db.import(json);
      if (!success) throw new Error("Failed to import JSON.");
      return true;
    },

    /**
     * Resets the DB.
     */
    resetDb: async () => {
      await simulateLatency(100);
      db.reset();
      return true;
    },
  },

  notifications: {
    list: async (userId: string) => {
      await simulateLatency(200);
      const dbState = db.get();
      return (dbState.notifications[userId] || []).sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    markAsRead: async (userId: string, notificationId: string) => {
      await simulateLatency(100);
      db.update((currentDb) => {
        const userNotifs = currentDb.notifications[userId] || [];
        const updatedNotifs = userNotifs.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        return {
          ...currentDb,
          notifications: {
            ...currentDb.notifications,
            [userId]: updatedNotifs,
          },
        };
      });
      notifyDbChange();
    },
    markAllAsRead: async (userId: string) => {
      await simulateLatency(100);
      db.update((currentDb) => {
        const userNotifs = currentDb.notifications[userId] || [];
        const updatedNotifs = userNotifs.map((n) => ({ ...n, read: true }));
        return {
          ...currentDb,
          notifications: {
            ...currentDb.notifications,
            [userId]: updatedNotifs,
          },
        };
      });
      notifyDbChange();
    },
  },

  search: {
    global: async (query: string) => {
      await simulateLatency(300);
      const dbState = db.get();
      const q = query.toLowerCase();

      if (!q) return { users: [], clubs: [], events: [], projects: [] };

      const users = Object.values(dbState.profiles).filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.headline.toLowerCase().includes(q) ||
          p.teach.some((t) => t.toLowerCase().includes(q)) ||
          p.learn.some((l) => l.toLowerCase().includes(q))
      );

      const clubs = Object.values(dbState.clubs).filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );

      const events = Object.values(dbState.events).filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );

      const projects = Object.values(dbState.projects).filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );

      return { users, clubs, events, projects };
    },
  },

  /**
   * Gemini API mock endpoints.
   */
  ai: {
    generateBio: async (profileData: {
      name: string;
      headline: string;
      teach: string;
      learn: string;
    }) => {
      const systemPrompt = `You are a professional profile writer for a skill-sharing platform called LearnEase. Your tone is engaging, professional, and friendly. You write in the first person ("I").`; // Renamed

      const userQuery = `Write a 2-3 sentence bio for my profile.
      - My name is: ${profileData.name}
      - My headline is: ${profileData.headline}
      - I want to teach: ${profileData.teach}
      - I want to learn: ${profileData.learn}
      
      Combine this into a concise and compelling bio. Focus on the value I provide and my enthusiasm for learning.`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
      };

      return geminiApi.generateContentWithRetry(payload);
    },

    draftIntroduction: async (
      myProfile: ProfileData,
      otherProfile: ProfileData
    ) => {
      const systemPrompt = `You are a friendly and professional member of LearnEase, a skill-sharing platform. You draft concise, engaging, and personalized introduction messages to help users connect.`; // Renamed

      const userQuery = `Draft a short (2-3 sentence) introduction message from me (${
        myProfile.name
      }) to ${otherProfile.name}.
      
      My Profile:
      - I want to teach: ${myProfile.teach.join(", ")}
      - I want to learn: ${myProfile.learn.join(", ")}
      
      Their Profile:
      - Name: ${otherProfile.name}
      - Headline: ${otherProfile.headline}
      - They want to teach: ${otherProfile.teach.join(", ")}
      - They want to learn: ${otherProfile.learn.join(", ")}
      
      Find a specific, reciprocal skill match (e.g., I learn X from them, they learn Y from me) and mention it. Be friendly and suggest connecting.`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
      };

      return geminiApi.generateContentWithRetry(payload);
    },
  },
  /**
   * End Gemini API mock section.
   */
};

// --- (5) STATE MANAGEMENT (/store/auth.ts) ---
// Using Zustand for global auth state

type AuthState = {
  user: AuthenticatedUser | null;
  token: string | null;
  status: "idle" | "loading" | "authed" | "guest";
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthenticatedUser>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: "student" | "university"
  ) => Promise<AuthenticatedUser>;
  logout: () => Promise<void>;
  updateUser: (newUser: AuthenticatedUser) => void;
};

const useAuthStore = createZustand<AuthState>((set, get) => ({
  user: null,
  token: null,
  status: "idle",
  init: async () => {
    if (get().status === "authed") return;
    set({ status: "loading" });
    try {
      const session = await mockApi.auth.checkSession();
      if (session) {
        set({
          user: session.user,
          token: session.token,
          status: "authed",
        });
      } else {
        if (get().status !== "authed") {
          set({ user: null, token: null, status: "guest" });
        }
      }
    } catch (e) {
      console.error("Auth init error:", e);
      if (get().status !== "authed") {
        set({ user: null, token: null, status: "guest" });
      }
    }
  },
  login: async (email, password) => {
    set({ status: "loading" });
    try {
      const { user, token } = await mockApi.auth.login(email, password);
      set({ user, token, status: "authed" });
      return user;
    } catch (error: unknown) {
      console.error("Login failed:", error);
      set({ status: "guest" });
      throw error;
    }
  },
  signup: async (email, password, name, role) => {
    set({ status: "loading" });
    try {
      const { user, token } = await mockApi.auth.signup(
        email,
        password,
        name,
        role
      );
      set({ user, token, status: "authed" });
      return user;
    } catch (error: unknown) {
      console.error("Signup failed:", error);
      set({ status: "guest" });
      throw error;
    }
  },
  logout: async () => {
    await mockApi.auth.logout();
    set({ user: null, token: null, status: "guest" });
  },
  updateUser: (newUser) => {
    set((state) => ({
      user: { ...state.user, ...newUser },
    }));
  },
}));

// --- (A) CUSTOM TOAST SYSTEM ---
// Built-in Toast provider.

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  status: "success" | "error";
  icon?: React.ReactNode;
};
type ToastContextType = {
  add: (toast: Omit<ToastMessage, "id">) => void;
};

// Create context for toast
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook to access the toast 'add' function.
 */
const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

/**
 * Provides the toast context and renders the toast messages.
 */
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = uuidv4();
      setToasts((prev) => [...prev, { ...toast, id }]);
      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        remove(id);
      }, 5000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ add }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`w-80 bg-surface border border-border rounded-2xl p-4 flex items-start shadow-lg ${
                toast.status === "success" ? "border-accent" : "border-red-500"
              }`}
            >
              <div
                className={`mt-1 ${
                  toast.status === "success" ? "text-accent" : "text-red-500"
                }`}
              >
                {toast.icon ||
                  (toast.status === "success" ? <CheckCircle /> : <XCircle />)}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-text-primary font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className="text-text-muted text-sm mt-1">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => remove(toast.id)}
                className="ml-2 mt-1 text-text-muted hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// --- (B) CUSTOM MODAL COMPONENT ---
// Built-in Modal provider.
const Modal: React.FC<{
  children: React.ReactNode;
  title: string;
  isOpen: boolean; // Use isOpen to control
  onClose: () => void;
}> = ({ children, title, isOpen, onClose }) => {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // This ensures it only runs on the client, where document is available
    setPortalNode(document.body);
  }, []);

  if (!portalNode) {
    return null; // Don't render server-side or before mount
  }

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-surface/90 backdrop-blur-xl p-6 rounded-3xl max-w-lg w-full z-10 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portalNode
  );
};

// --- (6) STYLED UI COMPONENTS (/components/ui/) ---
// Custom-built components

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
  }
>(({ className, variant = "primary", size = "md", ...props }, ref) => {
  const baseStyle =
    "rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";

  const variants = {
    primary: `bg-gradient-to-r from-accent to-purple-600 text-white hover:shadow-[0_0_20px_rgba(124,93,255,0.4)] hover:scale-[1.02] active:scale-[0.98] border border-white/10`,
    secondary: `bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]`,
    ghost: `bg-transparent text-gray-400 hover:text-white hover:bg-white/5`,
  };

  const sizes = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg",
  };

  return (
    <button
      ref={ref}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
});

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(({ className, label, id, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label
        htmlFor={id}
        className="block text-sm font-medium text-text-muted mb-2"
      >
        {label}
      </label>
    )}
    <input
      ref={ref}
      id={id}
      className={`w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 focus:bg-white/10 transition-all ${className}`}
      {...props}
    />
  </div>
));

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    labelAction?: React.ReactNode;
  }
>(({ className, label, id, labelAction, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <div className="flex justify-between items-center mb-2">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-text-muted"
        >
          {label}
        </label>
        {labelAction}
      </div>
    )}
    <textarea
      ref={ref}
      id={id}
      className={`w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 px-4 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 focus:bg-white/10 transition-all ${className}`}
      {...props}
    />
  </div>
));

const Avatar = ({
  src,
  name,
  className,
}: {
  src?: string;
  name?: string;
  className?: string;
}) => {
  const [error, setError] = useState(false);
  const fallback = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-purple-600/20 border border-white/10 text-white font-bold overflow-hidden shadow-inner ${className}`}
    >
      {src && !error ? (
        <img
          src={src}
          alt={name || "avatar"}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
};

const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`bg-surface border border-border text-accent font-medium rounded-2xl px-3 py-1 text-sm ${className}`}
  >
    {children}
  </span>
);

const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`${SECTION_PANEL} border border-white/5 shadow-[0_25px_80px_rgba(0,0,0,0.55)] ${className}`}
  >
    {children}
  </div>
);

const PageHero = ({
  eyebrow,
  title,
  description,
  actions,
  stats,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  stats?: { label: string; value: string }[];
}) => (
  <div
    className={`${HERO_PANEL} border border-white/5 px-6 py-8 lg:px-10 lg:py-12 shadow-[0_35px_120px_rgba(0,0,0,0.65)]`}
  >
    <div className="relative z-10">
      {eyebrow && (
        <p className="text-[11px] tracking-[0.35em] uppercase text-text-muted/70 mb-4">
          {eyebrow}
        </p>
      )}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-text-muted max-w-2xl text-base leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-4"
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-text-muted/70 mb-2">
                {stat.label}
              </p>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/0" />
      <div className="absolute -top-10 right-0 h-40 w-40 bg-accent/20 blur-[120px]" />
      <div className="absolute -bottom-16 left-10 h-40 w-40 bg-purple-500/10 blur-[140px]" />
    </div>
  </div>
);

const ActionComposer = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Share something...",
  isSubmitting = false,
  ctaLabel = "Post",
  disabled = false,
  avatar,
  helperContent,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  placeholder?: string;
  isSubmitting?: boolean;
  ctaLabel?: string;
  disabled?: boolean;
  avatar?: { src?: string; name?: string };
  helperContent?: React.ReactNode;
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isSubmitting || !value.trim()) return;
    await onSubmit();
  };

  const isDisabled = disabled || !value.trim() || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit}
      className={`${SECTION_PANEL} border border-white/5 rounded-[28px] p-4 sm:p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] transition-colors focus-within:border-white/20`}
    >
      <div className="flex gap-4">
        {avatar && (
          <Avatar
            src={avatar.src}
            name={avatar.name}
            className="h-12 w-12 hidden sm:flex border border-white/10"
          />
        )}
        <div className="flex-1 space-y-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border-none text-lg text-text-primary placeholder:text-text-muted/70 resize-none focus:outline-none min-h-[68px]"
            rows={3}
          />
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 text-text-muted">
              {helperContent ?? (
                <>
                  <button
                    type="button"
                    className={`${GLASS_CHIP} p-2 rounded-full text-text-muted hover:text-text-primary transition`}
                  >
                    <Upload size={18} />
                  </button>
                  <button
                    type="button"
                    className={`${GLASS_CHIP} p-2 rounded-full text-text-muted hover:text-text-primary transition`}
                  >
                    <Video size={18} />
                  </button>
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={isDisabled}
              className="rounded-full px-6"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                ctaLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

const AuthScaffold = ({
  title,
  subtitle,
  children,
  footer,
  sideTitle,
  sideDescription,
  highlights,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  sideTitle?: string;
  sideDescription?: string;
  highlights?: { label: string; value: string }[];
}) => (
  <div className="min-h-screen relative overflow-hidden bg-[#03050A] text-white">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-32 -left-10 h-72 w-72 bg-accent/15 blur-[160px]" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] bg-purple-600/10 blur-[180px]" />
      <Prism
        animationType="rotate"
        timeScale={0.4}
        height={4}
        baseWidth={6}
        scale={3.2}
        hueShift={240}
        colorFrequency={0.5}
        noise={0.4}
        glow={0.6}
      />
    </div>
    <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
      <div className="flex-1 px-8 sm:px-12 py-12 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <img
              src="/LearnEase-Brand-Logo.png"
              alt="LearnEase"
              className="h-12 w-auto object-contain mix-blend-screen invert"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
            {sideTitle || title}
          </h1>
          <p className="text-text-muted/80 text-base max-w-lg mt-6">
            {sideDescription || subtitle}
          </p>
        </div>
        {highlights && highlights.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-12">
            {highlights.map((item) => (
              <div
                key={item.label}
                className={`${GLASS_CHIP} rounded-2xl border border-white/10 p-4`}
              >
                <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted/70 mb-2">
                  {item.label}
                </p>
                <p className="text-3xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="w-full max-w-lg mx-auto lg:mx-0 lg:mr-12 my-12">
        <div
          className={`${HERO_PANEL} border border-white/5 rounded-[32px] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.65)]`}
        >
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted/70">
              {title}
            </p>
            <h2 className="text-3xl font-semibold text-white mt-2">
              {subtitle}
            </h2>
          </div>
          {children}
          {footer && (
            <div className="mt-8 text-center text-sm text-text-muted">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// --- (7) LAYOUT COMPONENTS (/components/layout/) ---

const PageContext = createContext<{
  setPage: (page: string, params?: Record<string, unknown>) => void;
  page: string;
  params: Record<string, unknown>;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}>({
  setPage: () => {},
  page: "dashboard",
  params: {},
  isSidebarCollapsed: false,
  toggleSidebar: () => {},
});

const usePage = () => useContext(PageContext);

const Sidebar = () => {
  const {
    setPage,
    page: activePage,
    isSidebarCollapsed,
    toggleSidebar,
  } = usePage();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: "Home", icon: Home, page: "home" },
    { name: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
    { name: "Department", icon: BookOpen, page: "department" },
    { name: "Q&A", icon: MessageCircle, page: "qa" },
    { name: "Messages", icon: MessageSquare, page: "chat" },
    { name: "Leaderboard", icon: Medal, page: "leaderboard" },
    {
      name: "My Profile",
      icon: User,
      page: "profile",
      params: { id: user?.id },
    },
    { name: "Settings", icon: Settings, page: "settings" },
  ];

  const NavLinks = ({
    compact = false,
    onNavigate,
  }: {
    compact?: boolean;
    onNavigate?: () => void;
  }) => (
    <nav
      className={
        compact
          ? "flex-1 flex flex-col items-center gap-2 mt-6 px-2 overflow-y-auto min-h-0 scrollbar-hide"
          : "flex-1 px-4 space-y-1.5 mt-6 overflow-y-auto min-h-0 scrollbar-hide"
      }
    >
      {navItems.map((item) => {
        const isActive = activePage === item.page;

        return (
          <button
            key={item.name}
            onClick={() => {
              setPage(item.page, item.params);
              onNavigate?.();
            }}
            className={`relative flex items-center w-full rounded-xl transition-all duration-200 group ${
              compact
                ? "p-3 justify-center"
                : "px-4 py-3 text-[14px] font-medium tracking-wide justify-start"
            } ${
              isActive
                ? "bg-accent/15 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {/* Active indicator bar */}
            {isActive && (
              <motion.div
                layoutId="sidebarActiveIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-accent shadow-[0_0_12px_rgba(197,255,100,0.6)]"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            <item.icon
              className={`${compact ? "h-5 w-5" : "h-[18px] w-[18px] mr-3"} ${
                isActive
                  ? "text-accent"
                  : "text-gray-500 group-hover:text-white"
              } relative z-10 transition-colors duration-200`}
              strokeWidth={isActive ? 2.5 : 2}
            />

            {!compact && (
              <span
                className={`relative z-10 ${
                  isActive ? "text-white font-semibold" : ""
                }`}
              >
                {item.name}
              </span>
            )}

            {/* Tooltip for compact mode */}
            {compact && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-[#0f1318] border border-white/10 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                {item.name}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#0f1318] border-l border-b border-white/10 rotate-45" />
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        className={`lg:hidden fixed top-4 left-4 z-40 bg-surface/80 backdrop-blur-xl border border-white/10 p-3 rounded-full text-white shadow-lg`}
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex flex-col w-80 p-4 lg:hidden"
          >
            <div className="absolute inset-0 bg-[#03050A]/95 backdrop-blur-3xl" />
            <div className="relative z-10 flex flex-col h-full">
              <button
                className="self-end p-2 text-gray-400 hover:text-white"
                onClick={() => setIsMobileOpen(false)}
              >
                <X />
              </button>
              <div className="flex items-center px-4 mb-6">
                <img
                  src="/LearnEase-Brand-Logo.png"
                  alt="LearnEase"
                  className="h-12 w-auto object-contain mix-blend-screen invert"
                />
              </div>
              <NavLinks onNavigate={() => setIsMobileOpen(false)} />
              <div className="p-4 mt-auto">
                <Button
                  variant="secondary"
                  className="w-full justify-start pl-4 bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={logout}
                >
                  <LogOut className="mr-3" size={18} /> Logout
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`hidden lg:flex lg:flex-shrink-0 ${
          isSidebarCollapsed ? "w-[5.5rem]" : "w-[17rem]"
        } transition-all duration-300 ease-out`}
      >
        <div className="flex flex-col flex-1 px-2 py-3 h-full">
          <div
            className={`flex flex-col flex-1 rounded-[28px] bg-[#080a10]/95 backdrop-blur-2xl border border-white/8 relative overflow-hidden transition-all duration-300 shadow-[0_8px_40px_rgba(0,0,0,0.4)]`}
          >
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

            <div
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "justify-between px-5"
              } mt-6 mb-4 relative z-10`}
            >
              <div className="flex items-center">
                <img
                  src="/LearnEase-Brand-Logo.png"
                  alt="LearnEase"
                  className={`${
                    isSidebarCollapsed ? "h-8" : "h-8"
                  } w-auto object-contain transition-all duration-300 mix-blend-screen invert`}
                />
              </div>

              {!isSidebarCollapsed && (
                <button
                  className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  onClick={toggleSidebar}
                  title="Collapse"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
            </div>

            {!isSidebarCollapsed ? <NavLinks /> : <NavLinks compact />}

            <div className="mt-auto px-3 pb-4 relative z-10 shrink-0">
              {/* Separator line */}
              <div className="h-[1px] bg-white/5 mx-2 mb-3" />

              {!isSidebarCollapsed ? (
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2 items-center">
                  <button
                    className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                    onClick={toggleSidebar}
                    title="Expand sidebar"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Header = () => {
  const user = useAuthStore((s) => s.user);
  const { isSidebarCollapsed, setPage } = usePage();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    users: ProfileData[];
    clubs: Club[];
    events: CampusEvent[];
    projects: ProjectOpportunity[];
  } | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch Notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      const notifs = await mockApi.notifications.list(user.id);
      setNotifications(notifs);
    };
    fetchNotifs();

    // Listen for DB updates to refresh notifications
    window.addEventListener("learnease:db-updated", fetchNotifs);
    return () =>
      window.removeEventListener("learnease:db-updated", fetchNotifs);
  }, [user]);

  // Handle Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const results = await mockApi.search.global(searchQuery);
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowSearchResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    if (!user) return;
    await mockApi.notifications.markAsRead(user.id, id);
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await mockApi.notifications.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-4 z-30 flex-shrink-0 h-16 mx-4 sm:mx-6 lg:mx-8 relative overflow-visible rounded-2xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(8,12,30,0.6)]">
      <div
        className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 opacity-80 rounded-2xl pointer-events-none"
        aria-hidden="true"
      ></div>

      <div className="relative h-full px-4 flex justify-between items-center sm:px-5 lg:px-6">
        {/* Logo/name when sidebar is collapsed */}
        {isSidebarCollapsed && (
          <div className="hidden lg:flex items-center mr-8">
            <img
              src="/LearnEase-Brand-Logo.png"
              alt="LearnEase"
              className="h-8 w-auto object-contain mix-blend-screen invert"
            />
          </div>
        )}

        {/* Search Bar */}
        <div className="flex-1 flex max-w-2xl relative" ref={searchRef}>
          <div className="w-full flex md:ml-0">
            <div className="relative w-full text-text-muted focus-within:text-accent transition-colors group">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-4">
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin text-accent" />
                ) : (
                  <Search className="h-5 w-5 group-focus-within:text-accent transition-colors" />
                )}
              </div>
              <input
                className="block w-full h-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-12 pr-3 text-white placeholder-white/50 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/40 focus:bg-white/15 transition-all sm:text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                placeholder="Search events, clubs, projects, members..."
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults) setShowSearchResults(true);
                }}
              />
            </div>
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && searchResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#0a0e16] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto z-50"
              >
                {Object.values(searchResults).every(
                  (arr) => arr.length === 0
                ) ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="p-2 space-y-4">
                    {searchResults.users.length > 0 && (
                      <div>
                        <h4 className="px-2 text-xs font-bold text-gray-500 uppercase mb-1">
                          Members
                        </h4>
                        {searchResults.users.map((p) => (
                          <div
                            key={p.userId}
                            onClick={() => {
                              setPage("profile", { id: p.userId });
                              setShowSearchResults(false);
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer"
                          >
                            <Avatar
                              src={p.avatarUrl}
                              name={p.name}
                              className="h-8 w-8"
                            />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {p.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {p.headline}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.clubs.length > 0 && (
                      <div>
                        <h4 className="px-2 text-xs font-bold text-gray-500 uppercase mb-1">
                          Clubs
                        </h4>
                        {searchResults.clubs.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setPage("club-detail", { clubId: c.id });
                              setShowSearchResults(false);
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer"
                          >
                            <div className="h-8 w-8 rounded bg-white/10 flex items-center justify-center text-xs font-bold">
                              {c.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {c.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {c.category}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.events.length > 0 && (
                      <div>
                        <h4 className="px-2 text-xs font-bold text-gray-500 uppercase mb-1">
                          Events
                        </h4>
                        {searchResults.events.map((e) => (
                          <div
                            key={e.id}
                            onClick={() => {
                              setPage("events");
                              setShowSearchResults(false);
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer"
                          >
                            <Calendar size={16} className="text-accent" />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {e.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(parseISO(e.date), "MMM d")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile/Notifs */}
        <div className="ml-4 flex items-center md:ml-6 gap-3">
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`!p-2.5 !rounded-full hover:bg-white/15 relative transition-colors ${
                showNotifications
                  ? "bg-white/15 text-accent"
                  : "text-white/70 hover:text-accent"
              }`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-[#0B0C0F] animate-ping"></span>
                  <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-[#0B0C0F]"></span>
                </>
              )}
            </Button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0a0e16] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-accent hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-4 hover:bg-white/5 transition-colors ${
                              !n.read ? "bg-white/[0.02]" : ""
                            }`}
                            onClick={() => handleMarkRead(n.id)}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                                  !n.read ? "bg-accent" : "bg-transparent"
                                }`}
                              />
                              <div>
                                <p
                                  className={`text-sm ${
                                    !n.read
                                      ? "text-white font-medium"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {n.text}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {formatDistanceToNow(parseISO(n.timestamp), {
                                    addSuffix: true,
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

          <div
            className="relative flex items-center gap-3 pl-2 cursor-pointer group"
            onClick={() => setPage("profile", { id: user?.id })}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white leading-none group-hover:text-accent transition-colors">
                {user && user.name ? user.name : "Student"}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1 text-xs text-accent font-medium">
                <Coins size={10} />
                <span>{user && user.coins ? user.coins : 0} Coins</span>
              </div>
            </div>
            <div className="relative">
              <Avatar
                src={user && user.avatarUrl ? user.avatarUrl : ""}
                name={user && user.name ? user.name : "Student"}
                className="h-10 w-10 border-2 border-white/15 group-hover:border-accent/60 transition-colors shadow-lg"
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#0B0C0F]"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const PageTransition: React.FC<{
  pageKey: string;
  children: React.ReactNode;
}> = ({ pageKey, children }) => {
  const isChat = pageKey.startsWith("chat");
  const wrapperClass = isChat
    ? "h-full w-full flex flex-col flex-1 min-h-0"
    : "h-full w-full px-3 py-4 sm:px-5 sm:py-6";
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={wrapperClass}
      >
        {isChat ? (
          children
        ) : (
          <div className="mx-auto w-full max-w-6xl">
            <PageSurface>{children}</PageSurface>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const PageSurface = ({ children }: { children: React.ReactNode }) => (
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-white/5 rounded-[40px] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
    <div className="relative rounded-[40px] border border-white/10 bg-[#0a0a0a]/60 backdrop-blur-xl shadow-2xl p-6 sm:p-10 lg:p-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 min-h-[calc(100vh-13rem)]">{children}</div>
    </div>
  </div>
);

// Simple Error Boundary to catch render errors and show message
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: unknown }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-surface rounded-2xl border border-border">
          <h3 className="text-xl text-text-primary font-bold">
            Something went wrong
          </h3>
          <p className="text-text-muted">
            An error happened while rendering this page. Check the console for
            details.
          </p>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

// --- (8) PAGE COMPONENTS (/pages/) ---

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const { setPage } = usePage();
  const [greeting, setGreeting] = useState("Hello");
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CampusEvent[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<QuestionThread[]>([]);

  useEffect(() => {
    if (!user) return;

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const fetchData = () => {
      const dbState = db.get();

      // Fetch My Clubs
      const allClubs = Object.values(dbState.clubs);
      const userClubs = allClubs.filter((c) => c.members.includes(user.id));
      setMyClubs(userClubs);

      // Fetch Upcoming Events
      const allEvents = Object.values(dbState.events);
      const futureEvents = allEvents
        .filter((e) => isFuture(parseISO(e.date)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      setUpcomingEvents(futureEvents);

      // Fetch Recent Questions
      const allQuestions = Object.values(dbState.questions);
      const sortedQuestions = allQuestions
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);
      setRecentQuestions(sortedQuestions);
    };

    fetchData();
    window.addEventListener("learnease:db-updated", fetchData);
    return () => window.removeEventListener("learnease:db-updated", fetchData);
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] bg-[#0B0C0F] border border-white/5 p-8 md:p-10"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent to-emerald-600 blur-xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="relative h-20 w-20 rounded-[1.2rem] bg-[#0B0C0F] border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-2">
                {greeting},{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
                  {user.name.split(" ")[0]}
                </span>
              </h1>
              <p className="text-gray-400 text-lg flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                Ready to learn something new today?
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Coins
              </div>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <Coins size={18} className="text-yellow-400" />
                {user.coins || 0}
              </div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                Rating
              </div>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <Star size={18} className="text-accent" fill="currentColor" />
                {user.rating || 5.0}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Clubs Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <Users size={20} className="text-pink-400" />
                </div>
                My Clubs
              </h2>
              <button
                onClick={() => setPage("clubs")}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                Explore All <ChevronRight size={14} />
              </button>
            </div>
            {myClubs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myClubs.map((club) => (
                  <motion.div
                    whileHover={{ y: -4 }}
                    key={club.id}
                    onClick={() => setPage("club-detail", { clubId: club.id })}
                    className="group relative overflow-hidden rounded-3xl bg-[#0B0C0F] border border-white/5 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-pink-500/5 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0F] via-[#0B0C0F]/50 to-transparent z-10" />
                    <img
                      src={club.coverUrl}
                      alt={club.name}
                      className="w-full h-40 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-500/20 text-[10px] font-bold uppercase tracking-wider text-pink-300 backdrop-blur-md">
                          {club.category}
                        </span>
                        <div className="flex -space-x-2">
                          {club.members.slice(0, 3).map((m, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-white/10 border border-[#0B0C0F]"
                            />
                          ))}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white leading-tight group-hover:text-pink-400 transition-colors">
                        {club.name}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-10 rounded-3xl bg-[#0B0C0F] border border-white/5 text-center border-dashed">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                  <Users size={24} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  No Clubs Yet
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Join a club to connect with like-minded students and start
                  collaborating on projects.
                </p>
                <Button onClick={() => setPage("clubs")}>Find Clubs</Button>
              </div>
            )}
          </section>

          {/* Recent Discussions */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <MessageCircle size={20} className="text-blue-400" />
                </div>
                Community Discussions
              </h2>
              <button
                onClick={() => setPage("qa")}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                View Q&A <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {recentQuestions.map((q) => (
                <div
                  key={q.id}
                  className={`${GLASS_CHIP} p-5 rounded-2xl border-white/5 hover:bg-white/[0.03] transition-all group cursor-pointer`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {q.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {q.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                          <ArrowUpCircle size={14} className="text-accent" />{" "}
                          {q.votes} votes
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                          <MessageSquare size={14} className="text-blue-400" />{" "}
                          {q.answers.length} answers
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {formatDistanceToNow(parseISO(q.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <ChevronRight
                        size={20}
                        className="text-gray-600 group-hover:text-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Campus Events Widget */}
          <div className={`${GLASS_CHIP} p-6 rounded-3xl border-white/5`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Calendar size={18} className="text-purple-400" />
                </div>
                Events
              </h3>
            </div>

            <div className="space-y-5">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-4 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors"
                >
                  <div className="flex flex-col items-center justify-center min-w-[3.5rem] h-[3.5rem] bg-[#0B0C0F] rounded-xl border border-white/10 shadow-inner">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                      {format(parseISO(event.date), "MMM")}
                    </span>
                    <span className="text-xl font-bold text-white leading-none mt-0.5">
                      {format(parseISO(event.date), "d")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                      {event.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 truncate">
                      <MapPin size={12} /> {event.location}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-md border border-purple-500/20">
                        {event.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No upcoming events.</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setPage("events")}
              className="w-full mt-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all border border-white/5"
            >
              View All Events
            </button>
          </div>

          {/* Quick Links */}
          <div className={`${GLASS_CHIP} p-6 rounded-3xl border-white/5`}>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <Zap size={18} className="text-orange-400" />
              </div>
              Quick Access
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPage("clubs")}
                className="p-4 rounded-2xl bg-[#0B0C0F] hover:bg-white/5 border border-white/5 transition-all text-left group"
              >
                <Users
                  size={24}
                  className="text-pink-400 mb-3 group-hover:scale-110 transition-transform"
                />
                <span className="block text-sm font-bold text-white">
                  Clubs
                </span>
                <span className="text-[10px] text-gray-500">
                  Join communities
                </span>
              </button>
              <button
                onClick={() => setPage("qa")}
                className="p-4 rounded-2xl bg-[#0B0C0F] hover:bg-white/5 border border-white/5 transition-all text-left group"
              >
                <LifeBuoy
                  size={24}
                  className="text-cyan-400 mb-3 group-hover:scale-110 transition-transform"
                />
                <span className="block text-sm font-bold text-white">Help</span>
                <span className="text-[10px] text-gray-500">Get answers</span>
              </button>
              <button
                onClick={() => setPage("leaderboard")}
                className="p-4 rounded-2xl bg-[#0B0C0F] hover:bg-white/5 border border-white/5 transition-all text-left group"
              >
                <Award
                  size={24}
                  className="text-yellow-400 mb-3 group-hover:scale-110 transition-transform"
                />
                <span className="block text-sm font-bold text-white">
                  Ranks
                </span>
                <span className="text-[10px] text-gray-500">Top mentors</span>
              </button>
              <button
                onClick={() => setPage("settings")}
                className="p-4 rounded-2xl bg-[#0B0C0F] hover:bg-white/5 border border-white/5 transition-all text-left group"
              >
                <Settings
                  size={24}
                  className="text-gray-400 mb-3 group-hover:scale-110 transition-transform"
                />
                <span className="block text-sm font-bold text-white">
                  Settings
                </span>
                <span className="text-[10px] text-gray-500">Preferences</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal for AI introduction drafting
const IntroductionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  myProfile: ProfileData;
  otherUser: ProfileData;
}> = ({ isOpen, onClose, myProfile, otherUser }) => {
  const [introText, setIntroText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const toast = useToast();
  const { setPage } = usePage();

  useEffect(() => {
    if (isOpen && myProfile && otherUser) {
      const generateIntro = async () => {
        setIsLoading(true);
        setIntroText("");
        try {
          const text = await mockApi.ai.draftIntroduction(myProfile, otherUser);
          setIntroText(text);
        } catch (err) {
          setIntroText(
            "Sorry, I couldn't generate an introduction. Please try again."
          );
          toast.add({
            title: "AI Intro Failed",
            description: (err as Error).message,
            status: "error",
          });
        }
        setIsLoading(false);
      };
      generateIntro();
    }
  }, [isOpen, myProfile, otherUser, toast]);

  const handleSendMessage = async () => {
    setIsSending(true);
    try {
      const convo = await mockApi.chat.getOrCreateConversation(
        myProfile.userId,
        otherUser.userId
      );
      await mockApi.chat.sendMessage(convo.id, myProfile.userId, introText);
      toast.add({ title: "Message Sent!", status: "success", icon: <Send /> });
      onClose();
      setPage("chat", { activeConvoId: convo.id });
    } catch (err) {
      toast.add({
        title: "Send Failed",
        description: (err as Error).message,
        status: "error",
      });
    }
    setIsSending(false);
  };

  return (
    <Modal
      title={`Draft Introduction to ${otherUser?.name || "..."}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-text-muted">
          Here's an AI-generated message to help break the ice. You can send it
          directly or use it as inspiration.
        </p>
        <div className="relative">
          <Textarea
            readOnly={isLoading}
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
            rows={6}
            className="!bg-background"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || isSending || !introText}
          >
            {isSending ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <Send size={18} className="mr-2" />
            )}
            {isSending ? "Sending..." : "Send as Message"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const MatchPage = () => null;

const ChatPage = () => {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { params, setPage } = usePage();
  const [viewFilter, setViewFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    mockApi.chat.getConversations(userId).then((convos) => {
      setConversations(convos);
      setIsLoading(false);

      if (params.activeConvoId) {
        setActiveConvoId(params.activeConvoId as string);
      }
    });
  }, [userId, params.activeConvoId]);

  const filteredConversations = useMemo(() => {
    if (viewFilter === "all") return conversations;
    if (!userId) return [];
    return conversations.filter(
      (convo) => (convo.unreadCount?.[userId] || 0) > 0
    );
  }, [viewFilter, conversations, userId]);

  const activeConvo = conversations.find((c) => c.id === activeConvoId);

  const unreadTotal = useMemo(() => {
    if (!userId) return 0;
    return conversations.reduce(
      (sum, convo) => sum + (convo.unreadCount?.[userId] || 0),
      0
    );
  }, [conversations, userId]);

  const handleMessageSent = (convoId: string, msg: Message) => {
    setActiveConvoId(convoId);
    setConversations((prev) =>
      prev.map((convo) =>
        convo.id === convoId
          ? {
              ...convo,
              lastMessage: msg,
              lastMessageTimestamp: msg.timestamp,
              messages: [...convo.messages, msg],
            }
          : convo
      )
    );

    if (!userId) return;
    mockApi.chat.getConversations(userId).then(setConversations);
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[320px] flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 text-accent animate-spin" />
      </div>
    );
  }

  const filterOptions: Array<{ label: string; value: "all" | "unread" }> = [
    { label: "All chats", value: "all" },
    { label: "Unread", value: "unread" },
  ];

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-7xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 mb-5"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold uppercase tracking-wider mb-3">
            <MessageSquare size={12} /> Messages
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Inbox
            {unreadTotal > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-accent/15 text-accent text-sm font-bold">
                {unreadTotal} new
              </span>
            )}
          </h1>
        </div>
        <div className="flex gap-2"></div>
      </motion.div>

      {/* Main Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex overflow-hidden rounded-2xl border border-white/5 bg-[#080a10] relative"
      >
        {/* Sidebar */}
        <div
          className={`w-full md:w-80 lg:w-[340px] border-r border-white/5 bg-[#0a0c12] flex flex-col z-10 ${
            activeConvoId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search & Filters */}
          <div className="p-4 border-b border-white/5">
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
              <input
                placeholder="Search conversations..."
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/30 focus:bg-white/[0.07] transition-all"
              />
            </div>

            <div className="flex gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setViewFilter(option.value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    viewFilter === option.value
                      ? "bg-accent text-black"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredConversations.length > 0 && (
              <div className="px-2 py-2 space-y-0.5">
                {filteredConversations.map((convo) => (
                  <ConvoListItem
                    key={convo.id}
                    convo={convo}
                    onClick={() => setActiveConvoId(convo.id)}
                    isActive={activeConvoId === convo.id}
                    unreadCount={userId ? convo.unreadCount?.[userId] || 0 : 0}
                  />
                ))}
              </div>
            )}
            {filteredConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <MessageSquare size={24} className="text-gray-600" />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  No conversations
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Start by joining a club
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 bg-[#060810] relative ${
            activeConvoId ? "flex" : "hidden md:flex"
          }`}
        >
          {activeConvo ? (
            <ActiveChat
              key={activeConvo.id}
              convo={activeConvo}
              currentUser={user}
              onBack={() => setActiveConvoId(null)}
              onMessageSent={handleMessageSent}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/10 to-purple-500/10 flex items-center justify-center mb-5 border border-white/5">
                <MessageSquare size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 max-w-xs text-sm">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const CreateEventModal = ({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; date: string }) => void;
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Combine date and time
    const dateTime = new Date(`${date}T${time}`).toISOString();
    await onCreate({ title, date: dateTime });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold mb-6">Create Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Event Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly Meetup"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Time
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClubDetailPage = ({
  club,
  onBack,
  onJoin,
  onUpdate,
}: {
  club: Club;
  onBack: () => void;
  onJoin: () => void;
  onUpdate: (updatedClub: Club) => void;
}) => {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<
    "feed" | "events" | "members" | "points" | "chat"
  >("feed");
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    if (activeTab === "feed") {
      mockApi.community.getPosts(club.id).then(setPosts);
    }
  }, [activeTab, club.id]);

  if (!userId) return null;

  const isMember = club.members.includes(userId);
  const isOwner = club.ownerId === userId;

  const handleCreatePost = async () => {
    if (!postContent.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const newPost = await mockApi.community.createPost(
        userId,
        postContent,
        club.id
      );
      setPosts((prev) => [newPost, ...prev]);
      setPostContent("");
      toast.add({ title: "Shared with the club", status: "success" });
    } catch (err) {
      toast.add({
        title: "Post failed",
        description: (err as Error).message,
        status: "error",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleCreateEvent = async (eventData: {
    title: string;
    date: string;
  }) => {
    try {
      const newEvent = await mockApi.community.createEvent(club.id, eventData);
      const updatedClub = { ...club, events: [...club.events, newEvent] };
      onUpdate(updatedClub);
      toast.add({ title: "Club event created", status: "success" });
    } catch (err) {
      toast.add({
        title: "Event failed",
        description: (err as Error).message,
        status: "error",
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="relative h-64 rounded-3xl overflow-hidden mb-6 group">
        <img
          src={club.coverUrl}
          alt={club.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="absolute bottom-0 left-0 p-8 w-full">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-accent text-white text-xs font-bold mb-3 shadow-lg shadow-accent/20">
                {club.category}
              </span>
              <h1 className="text-4xl font-bold text-white mb-2 shadow-sm">
                {club.name}
              </h1>
              <p className="text-white/80 max-w-2xl text-lg">
                {club.description}
              </p>
            </div>
            <div className="flex gap-3">
              {isOwner && (
                <div className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10">
                  Admin
                </div>
              )}
              <Button
                size="lg"
                variant={isMember ? "secondary" : "primary"}
                onClick={onJoin}
                className="shadow-xl"
              >
                {isMember ? "Joined" : "Join Club"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-border mb-6 px-4">
        {[
          "feed",
          "events",
          "members",
          "points",
          ...(isMember ? ["chat"] : []),
        ].map((tab) => (
          <button
            key={tab}
            onClick={() =>
              setActiveTab(
                tab as "feed" | "events" | "members" | "points" | "chat"
              )
            }
            className={`pb-4 text-sm font-medium capitalize transition-all relative ${
              activeTab === tab
                ? "text-accent"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeClubTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "feed" && (
            <>
              {isMember && (
                <ActionComposer
                  value={postContent}
                  onChange={setPostContent}
                  onSubmit={handleCreatePost}
                  placeholder="Drop an update for the club feed..."
                  isSubmitting={isPosting}
                  ctaLabel="Post"
                  avatar={{ src: user.avatarUrl, name: user.name }}
                />
              )}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-text-muted">
                    No posts yet. Be the first to share!
                  </div>
                ) : (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
              </div>
            </>
          )}

          {activeTab === "events" && (
            <div className="space-y-4">
              {isOwner && user?.role === "university" && (
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setIsCreateEventModalOpen(true)}>
                    <Plus size={18} className="mr-2" /> Create Event
                  </Button>
                </div>
              )}
              {club.events.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  No upcoming events.
                </div>
              ) : (
                club.events.map((event: ClubEvent) => (
                  <div
                    key={event.id}
                    className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-6 hover:border-accent/50 transition-colors"
                  >
                    <div className="bg-accent/10 text-accent h-16 w-16 rounded-2xl flex flex-col items-center justify-center font-bold">
                      <span className="text-xs uppercase">
                        {new Date(event.date).toLocaleString("default", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-2xl">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                      <div className="flex items-center text-text-muted text-sm gap-4">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(event.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {event.attendees} attending
                        </span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      RSVP
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "members" && (
            <div className="text-center py-12 text-text-muted">
              Member list coming soon...
            </div>
          )}

          {activeTab === "points" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Points Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
                    <Coins size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Total Club Points</p>
                    <p className="text-2xl font-bold text-white">12,450</p>
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                    <Medal size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Monthly Rank</p>
                    <p className="text-2xl font-bold text-white">#3</p>
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Active Streak</p>
                    <p className="text-2xl font-bold text-white">14 Days</p>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="text-accent" size={20} /> Club Achievements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Community Pillar",
                      desc: "Hosted 50+ successful events",
                      icon: Users,
                      color: "text-blue-400",
                      bg: "bg-blue-400/10",
                    },
                    {
                      title: "Knowledge Hub",
                      desc: "Shared 100+ resources",
                      icon: BookOpen,
                      color: "text-green-400",
                      bg: "bg-green-400/10",
                    },
                    {
                      title: "Rising Star",
                      desc: "Fastest growing club of the month",
                      icon: Rocket,
                      color: "text-orange-400",
                      bg: "bg-orange-400/10",
                    },
                    {
                      title: "Elite Squad",
                      desc: "Top 10% engagement rate",
                      icon: Star,
                      color: "text-yellow-400",
                      bg: "bg-yellow-400/10",
                    },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className="bg-surface border border-border rounded-2xl p-4 flex items-start gap-4 hover:border-white/20 transition-colors"
                    >
                      <div
                        className={`p-3 rounded-xl ${badge.bg} ${badge.color}`}
                      >
                        <badge.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{badge.title}</h4>
                        <p className="text-sm text-text-muted">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="text-accent" size={20} /> Recent Activity
                </h3>
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                  {[
                    {
                      action: "Hosted 'Intro to React' Workshop",
                      points: "+500",
                      time: "2 hours ago",
                      user: "Arun",
                    },
                    {
                      action: "New member joined",
                      points: "+50",
                      time: "5 hours ago",
                      user: "Priya",
                    },
                    {
                      action: "Resource shared: 'UI Design Kit'",
                      points: "+100",
                      time: "1 day ago",
                      user: "Nikhil",
                    },
                    {
                      action: "Weekly Meetup completed",
                      points: "+300",
                      time: "2 days ago",
                      user: "Arun",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-4 border-b border-white/5 last:border-0 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                          {item.user[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {item.action}
                          </p>
                          <p className="text-xs text-text-muted">
                            by {item.user} • {item.time}
                          </p>
                        </div>
                      </div>
                      <span className="text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full text-sm">
                        {item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === "chat" && isMember && (
            <div className="h-[600px] flex flex-col bg-surface border border-border rounded-2xl overflow-hidden animate-in fade-in duration-500">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">
                      #{club.name.toLowerCase().replace(/\s+/g, "-")}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {club.memberCount} members online
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Info size={18} />
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Mock Messages */}
                <div className="flex gap-3">
                  <Avatar name="Arun" className="h-8 w-8" />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-white text-sm">Arun</span>
                      <span className="text-[10px] text-text-muted">
                        10:30 AM
                      </span>
                    </div>
                    <p className="text-text-primary text-sm mt-1">
                      Hey everyone! Is the workshop still happening today?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Avatar name="Priya" className="h-8 w-8" />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-white text-sm">
                        Priya
                      </span>
                      <span className="text-[10px] text-text-muted">
                        10:32 AM
                      </span>
                    </div>
                    <p className="text-text-primary text-sm mt-1">
                      Yes! We are meeting at the main hall at 5 PM.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Avatar name="Nikhil" className="h-8 w-8" />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-white text-sm">
                        Nikhil
                      </span>
                      <span className="text-[10px] text-text-muted">
                        10:35 AM
                      </span>
                    </div>
                    <p className="text-text-primary text-sm mt-1">
                      Awesome, I'll bring the projector.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center my-4">
                  <span className="text-[10px] text-text-muted bg-white/5 px-2 py-1 rounded-full">
                    Today
                  </span>
                </div>

                <div className="flex gap-3">
                  <Avatar
                    name={user.name}
                    src={user.avatarUrl}
                    className="h-8 w-8"
                  />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-white text-sm">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Just now
                      </span>
                    </div>
                    <p className="text-text-primary text-sm mt-1">
                      I'm excited to join! See you all there.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex gap-2 items-end">
                  <button className="p-2 text-text-muted hover:text-white transition-colors rounded-full hover:bg-white/10">
                    <Plus size={20} />
                  </button>
                  <div className="flex-1 bg-black/20 border border-white/10 rounded-xl flex items-center px-3 py-2 focus-within:border-accent/50 transition-colors">
                    <input
                      className="bg-transparent border-none outline-none text-white w-full placeholder:text-text-muted/50 text-sm"
                      placeholder={`Message #${club.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    />
                    <button className="text-text-muted hover:text-white p-1">
                      <Smile size={18} />
                    </button>
                  </div>
                  <button className="p-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-3xl p-6">
            <h3 className="font-bold mb-4">About</h3>
            <div className="space-y-4 text-sm text-text-muted">
              <div className="flex items-center justify-between">
                <span>Created</span>
                <span className="text-text-primary">Oct 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Members</span>
                <span className="text-text-primary">{club.memberCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Category</span>
                <span className="text-text-primary">{club.category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onCreate={handleCreateEvent}
      />
    </div>
  );
};

const CreateClubModal = ({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    category: string;
    coverUrl: string;
    registrationNumber?: string;
  }) => void;
}) => {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock random cover
    const coverUrl = `https://source.unsplash.com/random/800x600?${category}`;
    await onCreate({
      name,
      description,
      category,
      coverUrl,
      registrationNumber,
    });
    setIsSubmitting(false);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {user?.role === "student" ? "Request Club Creation" : "Create a Club"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Club Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., React Developers"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this club about?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-accent/20 outline-none"
            >
              <option>Technology</option>
              <option>Design</option>
              <option>Music</option>
              <option>Business</option>
              <option>Lifestyle</option>
            </select>
          </div>

          {user?.role === "student" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-text-muted mb-1">
                College Registration Number
              </label>
              <Input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g., RA2111003010001"
                required
              />
              <p className="text-xs text-text-muted mt-1">
                Required for student club requests.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : user?.role === "student" ? (
                "Submit Request"
              ) : (
                "Create Club"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const ClubCard = ({
  club,
  onJoin,
  onClick,
}: {
  club: Club;
  onJoin: (e: React.MouseEvent) => void;
  onClick: () => void;
}) => {
  const user = useAuthStore((s) => s.user);
  const isMember = user ? club.members.includes(user.id) : false;

  return (
    <div
      onClick={onClick}
      className="group relative bg-surface/40 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden hover:bg-surface/60 transition-all duration-500 cursor-pointer h-full flex flex-col"
    >
      {/* Cover Image Area */}
      <div className="h-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0F] via-transparent to-transparent z-10" />
        <img
          src={club.coverUrl}
          alt={club.name}
          className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
        />
        <div className="absolute top-4 right-4 z-20">
          <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
            {club.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-0 flex-1 flex flex-col relative z-20">
        {/* Icon */}
        <div className="-mt-10 mb-4">
          <div className="h-20 w-20 rounded-2xl bg-[#0B0C0F] p-1.5 shadow-xl">
            <div className="h-full w-full rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover:border-accent/50 transition-colors">
              <Users
                className="text-white group-hover:text-accent transition-colors"
                size={32}
              />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
          {club.name}
        </h3>

        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-6">
          {club.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full bg-surface border-2 border-[#0B0C0F] flex items-center justify-center text-[10px] text-white font-bold"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            <div className="h-8 w-8 rounded-full bg-surface border-2 border-[#0B0C0F] flex items-center justify-center text-[10px] text-gray-400 font-bold pl-1">
              +{club.memberCount}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin(e);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              isMember
                ? "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10"
                : "bg-white text-black hover:scale-105 shadow-lg shadow-white/10"
            }`}
          >
            {isMember ? "Joined" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CommunityPage = () => {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"feed" | "clubs">("feed");
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    mockApi.community.getPosts().then(setPosts);
    mockApi.community.getClubs().then(setClubs);
  }, []);

  if (!user) return null;

  const handleCreatePost = async () => {
    if (!postContent.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const newPost = await mockApi.community.createPost(user.id, postContent);
      setPosts((prev) => [newPost, ...prev]);
      setPostContent("");
      toast.add({ title: "Posted to campus feed", status: "success" });
    } catch (err) {
      toast.add({
        title: "Post failed",
        description: (err as Error).message,
        status: "error",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    const updatedClub = await mockApi.community.joinClub(clubId, user.id);
    setClubs(clubs.map((c) => (c.id === clubId ? updatedClub : c)));
    if (selectedClub?.id === clubId) {
      setSelectedClub(updatedClub);
    }
  };

  const handleCreateClub = async (data: any) => {
    if (user.role === "student") {
      toast.add({
        title: "Request Sent",
        description:
          "Your club creation request has been sent to the Directorate.",
        status: "success",
      });

      // Simulate approval delay
      setTimeout(async () => {
        const newClub = await mockApi.community.createClub(user.id, data);
        setClubs((prev) => [...prev, newClub]);
        toast.add({
          title: "Club Approved!",
          description: `Your club "${data.name}" has been approved and is now live.`,
          status: "success",
        });
      }, 5000);
    } else {
      const newClub = await mockApi.community.createClub(user.id, data);
      setClubs([...clubs, newClub]);
      toast.add({ title: "Club created successfully", status: "success" });
    }
  };

  if (selectedClub) {
    return (
      <ClubDetailPage
        club={selectedClub}
        onBack={() => setSelectedClub(null)}
        onJoin={() => handleJoinClub(selectedClub.id)}
        onUpdate={(updatedClub) => {
          setSelectedClub(updatedClub);
          setClubs(
            clubs.map((c) => (c.id === updatedClub.id ? updatedClub : c))
          );
        }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full h-full flex flex-col md:flex-row gap-6 p-4 md:p-0">
      {/* Main Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-text-primary">
            SRM Skills Hub
          </h1>
          <div className="flex bg-surface border border-border rounded-full p-1">
            <button
              onClick={() => setActiveTab("feed")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "feed"
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab("clubs")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "clubs"
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Clubs
            </button>
          </div>
        </div>

        {activeTab === "feed" ? (
          <>
            <ActionComposer
              value={postContent}
              onChange={setPostContent}
              onSubmit={handleCreatePost}
              placeholder={`What's on your mind, ${
                user.name.split(" ")[0]
              }? Keep it crisp.`}
              isSubmitting={isPosting}
              ctaLabel="Share update"
              avatar={{ src: user.avatarUrl, name: user.name }}
            />

            <div className="space-y-4 pb-20">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
            {clubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onJoin={() => handleJoinClub(club.id)}
                onClick={() => setSelectedClub(club)}
              />
            ))}
            {/* Create Club Card */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-surface/50 border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center text-text-muted hover:text-accent hover:border-accent hover:bg-accent/5 transition-all min-h-[280px] group"
            >
              <div className="h-16 w-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus size={32} />
              </div>
              <h3 className="font-bold text-lg">
                {user?.role === "student" ? "Request Club" : "Create a Club"}
              </h3>
              <p className="text-sm text-center mt-2 max-w-[200px]">
                Start a community for your favorite topic
              </p>
            </button>
          </div>
        )}
      </div>

      {/* Right Sidebar (Desktop Only) */}
      <div className="hidden lg:block w-80 space-y-6">
        <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-3xl p-6 sticky top-6">
          <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
            <Star className="text-yellow-500" size={18} /> Top Contributors
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                  #{i}
                </div>
                <div className="flex-1">
                  <div className="h-2 w-24 bg-text-muted/20 rounded mb-1"></div>
                  <div className="h-2 w-16 bg-text-muted/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreateClubModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateClub}
      />
    </div>
  );
};

const ProfilePage = () => {
  const { params } = usePage();
  const { user: authUser, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    const userId =
      (params.id as string) || authUser.userId || authUser.id || "";
    if (!userId) return;
    setProfile(null); // Clear profile on ID change
    mockApi.users.getProfile(userId).then(setProfile);
  }, [params.id, authUser]);

  const handleSave = async (formData: Partial<ProfileData>) => {
    if (!profile || !authUser) return;
    const updatedProfile = await mockApi.users.updateProfile(
      profile.userId,
      formData
    );
    setProfile(updatedProfile);
    if (profile.userId === (authUser.userId || authUser.id)) {
      updateUser(updatedProfile);
    }
    setIsEditing(false);
  };

  if (!authUser) return null;

  if (!profile) {
    return <Loader2 className="h-12 w-12 text-accent animate-spin mx-auto" />;
  }

  const myAuthId = authUser.userId || authUser.id;
  const isMe = profile.userId === myAuthId;

  return (
    <div className="w-full mx-auto overflow-x-hidden">
      {isEditing ? (
        <ProfileEditor
          profile={profile}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ProfileViewer
          profile={profile}
          isMe={isMe}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
};

// Payment Gateway Modal Component
const PaymentModal = ({
  isOpen,
  onClose,
  planName,
  planPrice,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: string;
  onSuccess: () => void;
}) => {
  const { add } = useToast();
  const [cardNumber, setCardNumber] = useState("4532 1234 5678 9010");
  const [expiry, setExpiry] = useState("12/25");
  const [cvv, setCvv] = useState("123");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 80% success rate for demo
    const isSuccess = Math.random() > 0.2;

    if (isSuccess) {
      add({
        title: "Payment Successful",
        description: `You've successfully upgraded to ${planName}`,
        status: "success",
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onSuccess();
      onClose();
    } else {
      add({
        title: "Payment Failed",
        description: "Please check your card details and try again",
        status: "error",
      });
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-lg"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 bg-background border border-white/10 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-accent/20 via-background to-background border-b border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Complete Payment
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Secure checkout</p>
                </div>
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="text-white" size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handlePayment} className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Plan:</span>
                  <span className="text-white font-semibold">{planName}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-2xl font-bold text-accent">
                    {planPrice}
                  </span>
                </div>
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                  placeholder="4532 1234 5678 9010"
                  disabled={isProcessing}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:bg-white/15 transition-all disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tip: Try different numbers for different outcomes
                </p>
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    disabled={isProcessing}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:bg-white/15 transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    disabled={isProcessing}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:bg-white/15 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="text-xs text-gray-400">
                  Your payment information is encrypted and secure. We never
                  store your full card details.
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-accent to-green-400 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-accent/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Processing...
                  </div>
                ) : (
                  `Pay ${planPrice}`
                )}
              </Button>

              {/* Demo Info */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                  Note: This is a demo payment gateway. No real charges will be
                  made.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const UpgradePlanModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => null;

const SettingsPage = () => {
  const { add } = useToast();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    universityId: user?.universityId || "",
    department: user?.department || "Computer Science",
    bio: user?.bio || "",
  });

  const [notifications, setNotifications] = useState(
    user?.preferences?.notifications || {
      email: true,
      push: true,
      marketing: false,
    }
  );

  // Update local state when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        universityId: user.universityId || "",
        department: user.department || "Computer Science",
        bio: user.bio || "",
      });
      if (user.preferences?.notifications) {
        setNotifications(user.preferences.notifications);
      }
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updatedUser = await mockApi.users.updateProfile(user.userId, {
        name: formData.name,
        universityId: formData.universityId,
        department: formData.department,
        bio: formData.bio,
      });
      updateUser(updatedUser);
      add({ title: "Profile Saved", status: "success" });
    } catch (error) {
      add({ title: "Failed to save profile", status: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
    if (!user) return;
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);

    // Auto-save preferences
    try {
      const updatedUser = await mockApi.users.updateProfile(user.userId, {
        preferences: {
          ...user.preferences,
          notifications: newNotifications,
        },
      });
      updateUser(updatedUser);
      add({ title: "Preferences Updated", status: "success" });
    } catch (error) {
      // Revert on failure
      setNotifications(notifications);
      add({ title: "Failed to update preferences", status: "error" });
    }
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
  ];

  return (
    <>
      <div className={`${PAGE_SHELL} pb-12`}>
        <PageHero
          eyebrow="Configuration"
          title="Settings"
          description="Manage your personal preferences and account security."
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-accent text-black shadow-lg shadow-accent/20"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}

            <div className="pt-6 mt-6 border-t border-white/10">
              <div className="px-4">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  System
                </p>
                <div className="flex items-center justify-between text-sm text-text-muted/80">
                  <span>Version</span>
                  <span className="font-mono text-xs">v2.4.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Profile Header */}
                <SectionCard className="p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-accent/20 to-purple-500/20" />
                  <div className="relative pt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
                    <div className="relative">
                      <Avatar
                        src={user?.avatarUrl}
                        name={user?.name}
                        className="h-24 w-24 border-4 border-[#0a0a0a] shadow-xl"
                      />
                      <button className="absolute bottom-0 right-0 p-1.5 bg-accent text-black rounded-full shadow-lg hover:scale-110 transition-transform">
                        <Camera size={14} />
                      </button>
                    </div>
                    <div className="flex-1 mb-2">
                      <h2 className="text-2xl font-bold text-white">
                        {user?.name}
                      </h2>
                      <p className="text-text-muted">
                        Student • {user?.department || "Computer Science"}
                      </p>
                    </div>
                    <Button variant="secondary" className="mb-2">
                      Edit Profile
                    </Button>
                  </div>
                </SectionCard>

                {/* Personal Info Form */}
                <SectionCard className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Personal Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-muted uppercase">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-muted uppercase">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-muted cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-muted uppercase">
                        University ID
                      </label>
                      <input
                        type="text"
                        value={formData.universityId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            universityId: e.target.value,
                          })
                        }
                        placeholder="AP21110010000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-muted uppercase">
                        Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent focus:outline-none transition-colors"
                      >
                        <option>Computer Science</option>
                        <option>Electronics</option>
                        <option>Mechanical</option>
                        <option>Civil</option>
                        <option>Biotech</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-text-muted uppercase">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent focus:outline-none transition-colors resize-none"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === "notifications" && (
              <SectionCard className="p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-lg font-semibold text-white">
                    Notification Preferences
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    Choose how and when you want to be notified.
                  </p>
                </div>
                {[
                  {
                    key: "email",
                    label: "Email Digest",
                    desc: "Receive a daily summary of your learning progress and club updates.",
                    icon: Mail,
                  },
                  {
                    key: "push",
                    label: "Push Notifications",
                    desc: "Get real-time alerts for messages, mentions, and event reminders.",
                    icon: Bell,
                  },
                  {
                    key: "marketing",
                    label: "Product Updates",
                    desc: "Be the first to know about new features and community events.",
                    icon: Zap,
                  },
                ].map((item, index) => (
                  <div
                    key={item.key}
                    className={`p-6 flex items-start gap-4 ${
                      index !== 0 ? "border-t border-white/5" : ""
                    }`}
                  >
                    <div className="p-2 bg-white/5 rounded-lg text-accent">
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-base font-medium text-white">
                          {item.label}
                        </p>
                        <button
                          onClick={() =>
                            toggleNotification(
                              item.key as "push" | "email" | "marketing"
                            )
                          }
                          className={`w-11 h-6 rounded-full transition-colors relative ${
                            notifications[
                              item.key as keyof typeof notifications
                            ]
                              ? "bg-accent"
                              : "bg-white/10"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                              notifications[
                                item.key as keyof typeof notifications
                              ]
                                ? "left-6"
                                : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed pr-8">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </SectionCard>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <SectionCard className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Login & Recovery
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <Key size={20} className="text-text-muted" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Password</p>
                          <p className="text-xs text-text-muted">
                            Last changed 3 months ago
                          </p>
                        </div>
                      </div>
                      <Button variant="secondary" className="text-xs h-8">
                        Update
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <Smartphone size={20} className="text-text-muted" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            Two-Factor Authentication
                          </p>
                          <p className="text-xs text-text-muted">
                            Add an extra layer of security
                          </p>
                        </div>
                      </div>
                      <Button variant="secondary" className="text-xs h-8">
                        Enable
                      </Button>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard className="p-6 border border-red-500/20 bg-red-500/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white text-red-400">
                        Danger Zone
                      </h3>
                      <p className="text-text-muted text-sm mt-1 max-w-md">
                        Permanently remove your profile, conversations, and
                        ledger entries. This action cannot be undone.
                      </p>
                    </div>
                    <Button className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white whitespace-nowrap">
                      Delete Account
                    </Button>
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`${GLASS_CHIP} rounded-2xl p-6 border-white/10 col-span-2`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">
                          Current Plan
                        </p>
                        <h3 className="text-2xl font-bold text-white">
                          Free Student Tier
                        </h3>
                      </div>
                      <Badge className="bg-white/10 text-white">Active</Badge>
                    </div>
                    <p className="text-text-muted text-sm mb-6">
                      You have access to all basic features including club
                      participation, resource downloads, and community forums.
                    </p>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
                      <div className="bg-accent h-full w-[75%]" />
                    </div>
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>Storage Used</span>
                      <span>7.5GB / 10GB</span>
                    </div>
                  </div>

                  <div
                    className={`${GLASS_CHIP} rounded-2xl p-6 border-white/10 flex flex-col justify-center items-center text-center space-y-3`}
                  >
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-1">
                      <Coins size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {user?.coins ?? 0}
                      </h3>
                      <p className="text-xs text-text-muted uppercase tracking-wider">
                        Skill Coins
                      </p>
                    </div>
                    <Button variant="secondary" className="w-full text-xs h-8">
                      View History
                    </Button>
                  </div>
                </div>

                <SectionCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                      Payment Methods
                    </h3>
                    <Button variant="secondary" className="text-xs h-8 gap-2">
                      <Plus size={14} /> Add New
                    </Button>
                  </div>
                  <div className="p-4 border border-white/10 rounded-xl flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-[-4px]" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          Mastercard ending in 4242
                        </p>
                        <p className="text-xs text-text-muted">Expires 12/28</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/20">
                      Default
                    </Badge>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        </div>
      </div>
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </>
  );
};

// --- (8) AUTH PAGES ---

const LoginPage = () => {
  const login = useAuthStore((s) => s.login);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"student" | "university">("student");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      // Auth state change will handle redirect
    } catch (err) {
      setError((err as Error).message);
    }
    setIsLoading(false);
  };

  if (showSignup) {
    return (
      <SignupPage
        initialRole={role}
        onBackToLogin={() => setShowSignup(false)}
      />
    );
  }

  return (
    <AuthScaffold
      title={role === "student" ? "Student Login" : "University Login"}
      subtitle={
        role === "student"
          ? "Access your student dashboard."
          : "Manage campus events and clubs."
      }
      sideTitle="A Skill-Swap SRMAP OS"
      sideDescription="Minimal color, maximum signal. Plug back into your cohorts, club briefs, and ledger in seconds."
      highlights={[
        { label: "Students online", value: "2.1k" },
        { label: "Live clubs", value: "38" },
      ]}
      footer={
        <>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => setShowSignup(true)}
            className="text-white font-semibold hover:opacity-80"
          >
            Create one
          </button>
        </>
      }
    >
      <div className="flex p-1 bg-white/5 rounded-xl mb-6 border border-white/10">
        <button
          type="button"
          onClick={() => setRole("student")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            role === "student"
              ? "bg-accent text-black shadow-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => setRole("university")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            role === "university"
              ? "bg-accent text-black shadow-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          University
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@srmist.edu"
          required
          className="bg-white/5 border-white/10 focus:ring-accent/40"
        />
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Password</span>
            <button
              type="button"
              className="text-xs text-text-muted hover:text-white"
            >
              Forgot?
            </button>
          </div>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            className="w-full bg-white/5 border border-white/10 text-text-primary rounded-2xl py-3 px-4 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
          >
            <XCircle className="text-red-400" size={18} />
            <p className="text-red-200 text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <Button
          type="submit"
          className="w-full py-4 text-lg rounded-full"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "Enter workspace"}
        </Button>
      </form>
    </AuthScaffold>
  );
};

const SignupPage = ({
  onBackToLogin,
  initialRole,
}: {
  onBackToLogin: () => void;
  initialRole: "student" | "university";
}) => {
  const signup = useAuthStore((s) => s.signup);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"student" | "university">(initialRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, name, role);
    } catch (err) {
      setError((err as Error).message);
    }
    setIsLoading(false);
  };

  return (
    <AuthScaffold
      title={role === "student" ? "Student Signup" : "University Signup"}
      subtitle="Join SRM University's OS."
      sideTitle="Craft your Learner DNA"
      sideDescription="Build a portfolio-grade profile, unlock clubs, and auto-match with SRM mentors once you register."
      highlights={[
        { label: "Clubs ready", value: "38" },
        { label: "Skill swaps", value: "7k+" },
        { label: "Mentor payout", value: "₹1.4L" },
      ]}
      footer={
        <>
          Already have an account?{" "}
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-white font-semibold hover:opacity-80"
          >
            Sign in
          </button>
        </>
      }
    >
      <div className="flex p-1 bg-white/5 rounded-xl mb-6 border border-white/10">
        <button
          type="button"
          onClick={() => setRole("student")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            role === "student"
              ? "bg-accent text-black shadow-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => setRole("university")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            role === "university"
              ? "bg-accent text-black shadow-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          University
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full name"
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Arun Kumar"
            required
            className="bg-white/5 border-white/10 focus:ring-accent/30"
          />
          <Input
            label="SRM email"
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@srmap.edu.in"
            required
            className="bg-white/5 border-white/10 focus:ring-accent/30"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Password"
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            className="bg-white/5 border-white/10 focus:ring-accent/30"
          />
          <Input
            label="Confirm password"
            id="signup-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            required
            className="bg-white/5 border-white/10 focus:ring-accent/30"
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
          >
            <XCircle className="text-red-400" size={18} />
            <p className="text-red-200 text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <div className="text-xs text-text-muted flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-3">
          <CheckCircle2 size={14} className="text-accent" />
          You agree to Learnease Lab policies and community standards.
        </div>

        <Button
          type="submit"
          className="w-full py-4 text-lg rounded-full shadow-xl shadow-accent/20"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "Create account"}
        </Button>
      </form>
    </AuthScaffold>
  );
};

// --- (9) CORE UI COMPONENTS (/components/core/) ---

// For Dashboard: Ledger List
const LedgerList = ({ userId, limit }: { userId: string; limit: number }) => {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  useEffect(() => {
    setLedger((db.get().ledgers[userId] || []).slice(-limit).reverse());
  }, [userId, limit]);

  return (
    <div className="space-y-1">
      {ledger.length > 0 ? (
        ledger.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  item.type === "earn"
                    ? "bg-accent/10 text-accent"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {item.type === "earn" ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownLeft size={14} />
                )}
              </div>
              <div>
                <p className="text-white text-sm font-medium group-hover:text-accent transition-colors">
                  {item.description}
                </p>
                <p className="text-gray-500 text-xs">
                  {formatDistanceToNow(parseISO(item.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            <span
              className={`font-bold text-sm ${
                item.type === "earn" ? "text-accent" : "text-red-500"
              }`}
            >
              {item.type === "earn" ? "+" : ""}
              {item.amount}
            </span>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">
          No recent activity
        </div>
      )}
    </div>
  );
};

// For Match Page: Match Card
// *** MODIFIED ***
// Schedule Modal (lightweight)
const ScheduleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  myProfile: ProfileData | null;
  otherUser: ProfileData;
  skill?: string;
}> = ({ isOpen, onClose, myProfile, otherUser, skill }) => {
  const [duration, setDuration] = useState<number>(30);
  const [datetime, setDatetime] = useState<string>("");
  const [isScheduling, setIsScheduling] = useState(false);
  const toast = useToast();

  const handleSchedule = async () => {
    if (!datetime)
      return toast.add({ title: "Pick a date & time", status: "error" });
    if (!myProfile)
      return toast.add({ title: "Please sign in again", status: "error" });
    setIsScheduling(true);
    try {
      await mockApi.sessions.create({
        studentId: myProfile.userId,
        teacherId: otherUser.userId,
        skill: skill || "Session",
        scheduledTime: new Date(datetime).toISOString(),
        duration: duration,
      });
      toast.add({ title: "Scheduled", status: "success" });
      onClose();
    } catch (err) {
      toast.add({
        title: "Failed",
        description: (err as Error).message,
        status: "error",
      });
    }
    setIsScheduling(false);
  };

  return (
    <Modal
      title={`Schedule ${otherUser?.name || "session"}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4">
        <label className="text-sm text-text-muted">Duration</label>
        <select
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value, 10))}
          className="p-2 bg-background rounded-md w-full"
        >
          <option value={30}>30 minutes</option>
          <option value={60}>60 minutes</option>
        </select>
        <label className="text-sm text-text-muted">Date & Time</label>
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className="p-2 bg-background rounded-md w-full"
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={isScheduling}>
            {isScheduling ? "Scheduling..." : "Confirm"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const SkillSwapModal = ({
  isOpen,
  match,
  myProfile,
  existingSwap,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  match: Match | null;
  myProfile: AuthenticatedUser | null;
  existingSwap?: EnrichedSkillSwap;
  onClose: () => void;
  onSubmit: (payload: {
    offerSkill: string;
    requestSkill: string;
    note?: string;
  }) => Promise<void> | void;
  isSubmitting: boolean;
}) => {
  const [offerSkill, setOfferSkill] = useState("");
  const [requestSkill, setRequestSkill] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen && match) {
      setOfferSkill(match.iTeach?.[0] || myProfile?.teach?.[0] || "");
      setRequestSkill(match.iLearn?.[0] || match.user?.teach?.[0] || "");
      setNote("");
    }
  }, [isOpen, match, myProfile]);

  if (!isOpen || !match || !myProfile) return null;

  const offerOptions =
    match.iTeach && match.iTeach.length > 0
      ? match.iTeach
      : myProfile.teach || [];
  const requestOptions =
    match.iLearn && match.iLearn.length > 0
      ? match.iLearn
      : match.user?.teach || [];

  const isPending = existingSwap?.status === "pending";
  const isAccepted = existingSwap?.status === "accepted";
  const isDisabled =
    isSubmitting ||
    isPending ||
    isAccepted ||
    !offerSkill?.trim() ||
    !requestSkill?.trim();

  const statusCopy = (() => {
    if (!existingSwap) return null;
    if (existingSwap.status === "pending") return "Waiting for approval";
    if (existingSwap.status === "accepted") return "Swap active";
    if (existingSwap.status === "rejected") return "Swap declined";
    return null;
  })();

  const statusTone = (() => {
    if (!existingSwap) return "";
    if (existingSwap.status === "accepted") return "text-green-400";
    if (existingSwap.status === "pending") return "text-yellow-300";
    return "text-red-400";
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    await onSubmit({ offerSkill, requestSkill, note });
  };

  return (
    <Modal
      title={`Propose swap with ${match.user?.name ?? "student"}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {statusCopy && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-text-muted">Current status</span>
            <span className={`font-semibold ${statusTone}`}>{statusCopy}</span>
          </div>
        )}
        <div>
          <label className="block text-sm text-text-muted mb-1">
            You can teach
          </label>
          <select
            value={offerSkill}
            onChange={(e) => setOfferSkill(e.target.value)}
            className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2"
            required
          >
            <option value="" disabled>
              Select a skill
            </option>
            {offerOptions.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">
            You want to learn
          </label>
          <select
            value={requestSkill}
            onChange={(e) => setRequestSkill(e.target.value)}
            className="w-full bg-background border border-white/10 rounded-2xl px-4 py-2"
            required
          >
            <option value="" disabled>
              Select a skill
            </option>
            {requestOptions.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">
            Notes for your partner
          </label>
          <Textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Share the context and outcomes you expect from this swap"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isDisabled}>
            {isPending
              ? "Awaiting approval"
              : isAccepted
              ? "Swap active"
              : isSubmitting
              ? "Sending..."
              : "Send swap request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const DoubtConnectModal = ({
  isOpen,
  onClose,
  studentProfile,
  onTicketCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: AuthenticatedUser | null;
  onTicketCreated: (ticket: EnrichedDoubtTicket) => void;
}) => {
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { setPage } = usePage();

  useEffect(() => {
    if (isOpen && studentProfile) {
      setTopic(studentProfile.learn?.[0] || "");
      setDetails("");
    }
  }, [isOpen, studentProfile]);

  if (!isOpen || !studentProfile) return null;

  const suggestions = Array.from(
    new Set([...(studentProfile.learn || []), ...(studentProfile.teach || [])])
  ).slice(0, 5);

  const disableSubmit =
    isSubmitting || !topic.trim() || details.trim().length < 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disableSubmit) return;
    setIsSubmitting(true);
    try {
      const result = await mockApi.doubts.createTicket({
        studentId: studentProfile.id,
        topic,
        details,
      });
      const enriched: EnrichedDoubtTicket = {
        ...result.ticket,
        teacherProfile: result.teacherProfile,
      };
      onTicketCreated(enriched);
      toast.add({ title: "Mentor assigned", status: "success" });
      const convo = await mockApi.chat.getOrCreateConversation(
        studentProfile.id,
        result.teacherProfile.userId
      );
      await mockApi.chat.sendMessage(
        convo.id,
        studentProfile.id,
        `Hi ${
          result.teacherProfile.name.split(" ")[0]
        }, I need help with ${topic}: ${details}`
      );
      setPage("chat", { activeConvoId: convo.id });
      onClose();
    } catch (err) {
      toast.add({
        title: "Connect failed",
        description: (err as Error).message,
        status: "error",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Modal title="Connect with a mentor" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-muted mb-1">
            What topic is this about?
          </label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., React state, Signals, Solid mechanics"
          />
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestions.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => setTopic(skill)}
                  className="text-xs px-3 py-1 rounded-full border border-white/10 text-white/70 hover:border-accent/50"
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">
            Give context
          </label>
          <Textarea
            rows={5}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Share the doubt, expectations, and any material mentors should check."
          />
          <p className="text-xs text-text-muted mt-1">
            Minimum 10 characters so mentors know what to prep.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={disableSubmit}>
            {isSubmitting ? "Matching..." : "Connect now"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
const MatchCard = ({
  match,
  onDraftIntro,
  onContact,
  onSwap,
  swapInfo,
}: {
  match: Match;
  onDraftIntro: () => void;
  onContact: () => void;
  onSwap: () => void;
  swapInfo?: EnrichedSkillSwap;
}) => {
  const { user, score, iLearn, iTeach } = match;
  const myProfile = useAuthStore((s) => s.user);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  if (!user) return null;

  const safeILearn = iLearn || [];
  const safeITeach = iTeach || [];
  const swapDisabled =
    swapInfo?.status === "pending" || swapInfo?.status === "accepted";
  const swapLabel = swapInfo
    ? swapInfo.status === "accepted"
      ? "Swap Active"
      : swapInfo.status === "pending"
      ? "Swap Pending"
      : "Swap Again"
    : "Swap Skills";
  const swapBadgeTone = (() => {
    if (!swapInfo) return "bg-white/5 text-white";
    if (swapInfo.status === "accepted") return "bg-green-500/10 text-green-300";
    if (swapInfo.status === "pending")
      return "bg-yellow-500/10 text-yellow-200";
    return "bg-red-500/10 text-red-300";
  })();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -8 }}
        className="group relative flex flex-col h-full rounded-[24px] border border-white/8 bg-white/[0.03] backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.45)] overflow-hidden transition-all duration-400 hover:border-accent/30"
      >
        <div className="absolute inset-x-4 top-2 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />

        {/* Header with Match Score */}
        <div className="relative px-5 pt-5 pb-3 flex justify-between gap-4 items-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-accent to-purple-600 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
              <Avatar
                src={user.avatarUrl}
                name={user.name}
                className="h-12 w-12 border-2 border-white/15"
              />
              <div className="absolute -bottom-0.5 -right-0.5 bg-[#05060a] rounded-full p-1">
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-[#05060a]"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white leading-tight truncate">
                {user.name}
              </h3>
              <p className="text-xs text-white/60 line-clamp-1 mt-0.5">
                {user.headline}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center rounded-2xl border border-white/15 bg-black/30 px-3 py-2 min-w-[74px]">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">
              Match
            </span>
            <span className="text-xl font-bold text-white">{score}%</span>
            {swapInfo && (
              <span
                className={`mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10 ${swapBadgeTone}`}
              >
                {swapInfo.status === "pending"
                  ? "Swap pending"
                  : swapInfo.status === "accepted"
                  ? "Swap live"
                  : "Swap declined"}
              </span>
            )}
          </div>
        </div>

        {/* Skills Exchange Section */}
        <div className="px-5 pb-5 flex-1 space-y-4">
          {safeILearn.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60 flex items-center gap-2">
                <Download size={14} className="text-accent" /> You learn
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {safeILearn.slice(0, 4).map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-full border border-accent/25 bg-accent/10 text-accent text-[11px] font-semibold"
                  >
                    {skill}
                  </span>
                ))}
                {safeILearn.length > 4 && (
                  <span className="text-xs text-white/60 self-center">
                    +{safeILearn.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {safeITeach.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60 flex items-center gap-2">
                <Upload size={14} className="text-blue-400" /> You teach
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {safeITeach.slice(0, 4).map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-100 text-[11px] font-semibold"
                  >
                    {skill}
                  </span>
                ))}
                {safeITeach.length > 4 && (
                  <span className="text-xs text-white/60 self-center">
                    +{safeITeach.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-white/5 bg-black/12 backdrop-blur-lg">
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onContact}
                size="sm"
                className="flex items-center justify-center gap-1.5 text-sm"
              >
                <MessageCircle size={16} />
                Chat
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={onSwap}
                disabled={swapDisabled}
                className="flex items-center justify-center gap-1.5 text-sm bg-white/5 hover:bg-white/10 border-white/10"
              >
                <ArrowLeftRight size={16} />
                {swapLabel}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsScheduleOpen(true)}
                title="Schedule session"
                className="flex items-center justify-center gap-1.5 text-sm border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Video size={16} />
                Schedule
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={onDraftIntro}
                title="AI intro"
                className="flex items-center justify-center gap-1.5 text-sm border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Sparkles size={16} className="text-purple-300" />
                Intro
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        myProfile={myProfile}
        otherUser={user}
        skill={iLearn?.[0] || ""}
      />
    </>
  );
};

// For Chat Page: Convo List Item
const ConvoListItem = ({
  convo,
  onClick,
  isActive,
  unreadCount = 0,
}: {
  convo: Conversation;
  onClick: () => void;
  isActive: boolean;
  unreadCount?: number;
}) => {
  if (!convo.otherUser) return null;
  const otherUser = convo.otherUser;
  const snippetRaw = convo.lastMessage?.text || "No messages yet";
  const snippet =
    snippetRaw.length > 35 ? `${snippetRaw.slice(0, 35)}…` : snippetRaw;
  const relativeTime = convo.lastMessage
    ? formatDistanceToNow(parseISO(convo.lastMessage.timestamp), {
        addSuffix: false,
      })
    : null;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 relative group ${
        isActive
          ? "bg-accent/10 border border-accent/20"
          : "hover:bg-white/[0.03] border border-transparent"
      }`}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full" />
      )}

      <div className="relative shrink-0">
        <Avatar
          src={otherUser.avatarUrl}
          name={otherUser.name}
          className={`h-11 w-11 ${isActive ? "ring-2 ring-accent/30" : ""}`}
        />
        {/* Online indicator */}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0c12] rounded-full" />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-center mb-0.5">
          <h3
            className={`font-semibold truncate text-sm ${
              isActive ? "text-white" : "text-gray-200"
            }`}
          >
            {otherUser.name}
          </h3>
          {relativeTime && (
            <span className="text-[10px] text-gray-500 shrink-0 ml-2 font-medium">
              {relativeTime}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <p
            className={`text-xs truncate pr-2 ${
              unreadCount > 0 ? "text-gray-300 font-medium" : "text-gray-500"
            }`}
          >
            {convo.lastMessage?.senderId === otherUser.userId ? "" : "You: "}
            {snippet}
          </p>
          {unreadCount > 0 && (
            <span className="shrink-0 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-accent text-black text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// For Chat Page: Active Chat
// *** MODIFIED ***
const ActiveChat = ({
  convo,
  currentUser,
  onBack,
  onMessageSent,
}: {
  convo: Conversation;
  currentUser: AuthenticatedUser | null;
  onBack: () => void;
  onMessageSent: (convoId: string, msg: Message) => void;
}) => {
  const [messages, setMessages] = useState<Message[]>([...convo.messages]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([...convo.messages]);
  }, [convo.id, convo.messages]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!currentUser || !convo.otherUser) return null;
  const otherUser = convo.otherUser;
  const lastReplyTime = convo.lastMessageTimestamp
    ? formatDistanceToNow(parseISO(convo.lastMessageTimestamp), {
        addSuffix: true,
      })
    : "just now";
  const totalExchanges = messages.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const msg = await mockApi.chat.sendMessage(
      convo.id,
      currentUser.id,
      newMessage
    );
    setMessages([...messages, msg]);
    onMessageSent(convo.id, msg);
    setNewMessage("");
    setIsSending(false);
  };

  // Helper to check if we should show date header
  const shouldShowDate = (curr: Message, prev: Message | undefined) => {
    if (!prev) return true;
    const currDate = parseISO(curr.timestamp);
    const prevDate = parseISO(prev.timestamp);
    return format(currDate, "yyyy-MM-dd") !== format(prevDate, "yyyy-MM-dd");
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full relative overflow-hidden bg-[#060810]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.02] to-transparent pointer-events-none" />

      <div className="relative flex flex-col flex-1 min-h-0 z-10">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-[#0a0c12]/95 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              onClick={onBack}
              aria-label="Back to conversations"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="relative">
              <Avatar
                src={otherUser.avatarUrl}
                name={otherUser.name}
                className="h-10 w-10"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0c12] rounded-full" />
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm leading-tight">
                {otherUser.name}
              </h3>
              <p className="text-xs text-green-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              title="Start video call"
            >
              <Video size={18} />
            </button>
            <button
              type="button"
              className="p-2.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              title="Info"
            >
              <Info size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollContainerRef}
          className="relative flex-1 overflow-y-auto px-5 py-4 custom-scrollbar"
        >
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                  <MessageSquare size={28} className="text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm">No messages yet</p>
                <p className="text-gray-600 text-xs mt-1">
                  Start the conversation!
                </p>
              </div>
            )}

            {messages.map((msg: Message, index: number) => {
              const isMe = msg.senderId === currentUser.id;
              const prevMsg = messages[index - 1];
              const showDate = shouldShowDate(msg, prevMsg);

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-6">
                      <span className="text-[10px] font-medium text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        {format(parseISO(msg.timestamp), "MMMM d, yyyy")}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      isMe ? "justify-end" : "justify-start"
                    } mb-3`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[75%] ${
                        isMe ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {!isMe && (
                        <Avatar
                          src={otherUser.avatarUrl}
                          name={otherUser.name}
                          className="h-7 w-7 mb-1"
                        />
                      )}

                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? "bg-accent text-black rounded-br-md font-medium"
                            : "bg-white/[0.06] text-gray-200 rounded-bl-md border border-white/5"
                        }`}
                      >
                        {msg.text}
                      </div>

                      <span className="text-[10px] text-gray-600 mb-1 shrink-0">
                        {format(parseISO(msg.timestamp), "HH:mm")}
                      </span>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-[#0a0c12]">
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 bg-white/[0.03] border border-white/5 rounded-2xl p-2"
          >
            <div className="flex items-center gap-1 pl-1">
              <button
                type="button"
                className="p-2 rounded-lg text-gray-500 hover:text-accent hover:bg-accent/10 transition-colors"
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>
            </div>

            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 !bg-transparent !border-none !ring-0 !focus:ring-0 !py-2.5 min-h-[40px] max-h-28 resize-none text-white text-sm placeholder:text-gray-500"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isSending}
            />

            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className={`p-2.5 rounded-xl transition-all ${
                newMessage.trim()
                  ? "bg-accent text-black hover:bg-accent/90"
                  : "bg-white/5 text-gray-600"
              }`}
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// For Community Page: Post Card
const PostCard = ({ post }: { post: EnrichedPost }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes.length);
  const author = post.author;

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-[24px] p-6 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              src={author?.avatarUrl}
              name={author?.name}
              className="h-11 w-11 ring-2 ring-white/10 group-hover:ring-accent/50 transition-all"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#0B0C0F] rounded-full p-0.5">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0B0C0F]"></div>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm leading-none hover:text-accent cursor-pointer transition-colors">
              {author?.name || "SRM AP Student"}
            </h3>
            <p className="text-gray-500 text-xs mt-1.5 font-medium flex items-center gap-1">
              {formatDistanceToNow(parseISO(post.timestamp), {
                addSuffix: true,
              })}
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span>Public</span>
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="!p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <Menu size={18} />
        </Button>
      </div>

      <div className="pl-[52px]">
        <p className="text-gray-200 whitespace-pre-wrap mb-4 text-[15px] leading-relaxed font-light">
          {post.content}
        </p>

        {/* Post Actions */}
        <div className="flex items-center gap-6 pt-4 border-t border-white/5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 group/like ${
              isLiked ? "text-red-500" : "text-gray-500 hover:text-red-400"
            }`}
          >
            <div
              className={`p-2 rounded-full ${
                isLiked ? "bg-red-500/10" : "group-hover/like:bg-red-500/10"
              } transition-colors`}
            >
              <Heart
                size={18}
                className={`${
                  isLiked
                    ? "fill-current scale-110"
                    : "group-hover/like:scale-110"
                } transition-transform`}
              />
            </div>
            <span>{likes}</span>
          </button>

          <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-400 transition-colors group/comment">
            <div className="p-2 rounded-full group-hover/comment:bg-blue-500/10 transition-colors">
              <MessageCircle
                size={18}
                className="group-hover/comment:scale-110 transition-transform"
              />
            </div>
            <span>{post.comments.length}</span>
          </button>

          <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-400 transition-colors ml-auto group/share">
            <div className="p-2 rounded-full group-hover/share:bg-green-500/10 transition-colors">
              <Download
                size={18}
                className="group-hover/share:scale-110 transition-transform"
              />
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// For Profile Page: Viewer
const ProfileViewer = ({
  profile,
  isMe,
  onEdit,
}: {
  profile: ProfileData;
  isMe: boolean;
  onEdit: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "history">(
    "overview"
  );

  // Mock cover if not present
  const coverUrl =
    profile.coverUrl ||
    `https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1200&auto=format&fit=crop`;

  return (
    <div className="w-full max-w-6xl mx-auto pb-12">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 group"
      >
        {/* Cover Image */}
        <div className="h-64 md:h-80 rounded-3xl overflow-hidden relative shadow-2xl border border-white/5">
          <img
            src={coverUrl}
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03050A] via-[#03050A]/60 to-transparent" />

          {isMe && (
            <button
              onClick={onEdit}
              className="absolute top-6 right-6 bg-black/40 hover:bg-black/60 text-white px-5 py-2.5 rounded-full backdrop-blur-xl border border-white/10 transition-all flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {/* Avatar & Basic Info */}
        <div className="relative px-6 md:px-10 -mt-24 md:-mt-32 flex flex-col md:flex-row items-end gap-6 md:gap-8">
          {/* Avatar */}
          <div className="relative group/avatar">
            <div className="absolute -inset-1 bg-gradient-to-br from-accent via-purple-500 to-blue-500 rounded-[2rem] blur opacity-70 group-hover/avatar:opacity-100 transition-opacity duration-500" />
            <Avatar
              src={profile.avatarUrl}
              name={profile.name}
              className="relative h-36 w-36 md:h-48 md:w-48 rounded-[1.8rem] border-[6px] border-[#03050A] shadow-2xl"
            />
            <div
              className="absolute bottom-3 right-3 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#03050A] shadow-lg"
              title="Online"
            />
          </div>

          {/* Name & Headline */}
          <div className="flex-1 pb-2 md:pb-6 w-full md:w-auto text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                {profile.name}
              </h1>
              {profile.badges?.includes("verified") && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-fit mx-auto md:mx-0">
                  <CheckCircle size={12} /> Verified
                </div>
              )}
            </div>

            <p className="text-lg text-gray-300 font-medium mb-3 max-w-2xl">
              {profile.headline}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                <MapPin size={14} className="text-accent" />
                {profile.location || "SRM University, AP"}
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                <Users size={14} className="text-purple-400" />
                {profile.department || "Computer Science"}
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                <Calendar size={14} className="text-blue-400" />
                Joined {new Date(profile.joinedDate).getFullYear()}
              </div>
            </div>
          </div>

          {/* Action Buttons (if not me) */}
          {!isMe && (
            <div className="flex gap-3 pb-6">
              <Button className="rounded-full px-6 shadow-lg shadow-accent/20">
                Connect
              </Button>
              <Button variant="secondary" className="rounded-full px-4">
                <MessageCircle size={20} />
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10 px-4 md:px-0"
      >
        {[
          {
            label: "Skill Coins",
            value: profile.coins,
            icon: Coins,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
          },
          {
            label: "Rating",
            value: `${profile.rating || 4.5}★`,
            icon: Star,
            color: "text-orange-400",
            bg: "bg-orange-400/10",
          },
          {
            label: "Sessions",
            value: profile.sessionsCompleted || 0,
            icon: Video,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
          },
          {
            label: "Teaching",
            value: `${profile.hoursTeaught || 0}h`,
            icon: BookOpen,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
          },
          {
            label: "Learning",
            value: `${profile.hoursLearned || 0}h`,
            icon: Target,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
          },
          {
            label: "Badges",
            value: profile.badges?.length || 0,
            icon: Medal,
            color: "text-pink-400",
            bg: "bg-pink-400/10",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${GLASS_CHIP} p-4 rounded-2xl border-white/5 hover:border-white/10 transition-all group`}
          >
            <div
              className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
            >
              <stat.icon size={20} className={stat.color} />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 px-4 md:px-0">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl inline-flex shadow-xl">
          {["overview", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "overview" | "history")}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all relative ${
                activeTab === tab
                  ? "text-black shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeProfileTab"
                  className="absolute inset-0 bg-accent rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
        {/* Left Column (Main) */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === "overview" ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${GLASS_CHIP} rounded-3xl p-8 border-white/5`}
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <User size={20} className="text-purple-400" />
                  </div>
                  About Me
                </h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                  {profile.bio || "This user hasn't written a bio yet."}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${GLASS_CHIP} rounded-3xl p-8 border-white/5`}
              >
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Sparkles size={20} className="text-blue-400" />
                  </div>
                  Skills & Interests
                </h3>
                <div className="space-y-8">
                  <SkillList
                    title="I Can Teach"
                    skills={profile.teach}
                    color="accent"
                  />
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <SkillList
                    title="I Want to Learn"
                    skills={profile.learn}
                    color="blue"
                  />
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${GLASS_CHIP} rounded-3xl p-8 border-white/5`}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
                  <Coins size={20} className="text-green-400" />
                </div>
                Transaction History
              </h3>
              <div className="bg-black/20 rounded-2xl overflow-hidden border border-white/5">
                <LedgerList userId={profile.userId} limit={20} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className={`${GLASS_CHIP} rounded-3xl p-6 border-white/5`}
          >
            <h3 className="font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <Medal size={18} className="text-yellow-400" />
              </div>
              Badges & Achievements
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {profile.badges && profile.badges.length > 0 ? (
                profile.badges.map((badgeId: string) => (
                  <div
                    key={badgeId}
                    className="aspect-square bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-yellow-400 hover:bg-white/10 hover:scale-105 transition-all cursor-help shadow-lg"
                    title={badgeId}
                  >
                    <Star size={24} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-4 text-center py-4 italic">
                  No badges earned yet
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`${GLASS_CHIP} rounded-3xl p-6 border-white/5`}
          >
            <h3 className="font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Clock size={18} className="text-blue-400" />
              </div>
              Weekly Availability
            </h3>
            <div className="space-y-3">
              {Object.entries(profile.availability || {}).map(
                ([day, times]: [string, string[]]) => (
                  <div
                    key={day}
                    className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="capitalize text-gray-300 font-medium">
                      {day}
                    </span>
                    <span className="text-accent font-bold bg-accent/10 px-3 py-1 rounded-lg text-xs">
                      {(times as string[])[0]}
                    </span>
                  </div>
                )
              )}
              {(!profile.availability ||
                Object.keys(profile.availability).length === 0) && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-600">
                    <Calendar size={20} />
                  </div>
                  <p className="text-sm text-gray-500">
                    No availability schedule set
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const SkillList = ({
  title,
  skills,
  color,
}: {
  title: string;
  skills: string[];
  color: "accent" | "blue";
}) => (
  <div>
    <h4
      className={`text-sm font-semibold ${
        color === "accent" ? "text-accent" : "text-blue-400"
      } mb-3`}
    >
      {title}
    </h4>
    <div className="flex flex-wrap gap-2">
      {skills.length > 0 ? (
        skills.map((skill) => (
          <span
            key={skill}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              color === "accent"
                ? "bg-accent/10 text-accent border-accent/20"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            }`}
          >
            {skill}
          </span>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No skills listed yet.</p>
      )}
    </div>
  </div>
);

const ProfileEditor = ({
  profile,
  onSave,
  onCancel,
}: {
  profile: ProfileData;
  onSave: (data: ProfileData) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    headline: profile.headline,
    bio: profile.bio,
    teach: profile.teach.join(", "),
    learn: profile.learn.join(", "),
  });

  const [isBioLoading, setIsBioLoading] = useState(false);
  const toast = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...profile,
      ...formData,
      teach: formData.teach
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      learn: formData.learn
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  const handleGenerateBio = async () => {
    setIsBioLoading(true);
    try {
      const generatedBio = await mockApi.ai.generateBio({
        name: formData.name,
        headline: formData.headline,
        teach: formData.teach,
        learn: formData.learn,
      });
      setFormData({ ...formData, bio: generatedBio });
      toast.add({ title: "AI Bio Generated!", status: "success" });
    } catch (err) {
      toast.add({
        title: "AI Bio Failed",
        description: (err as Error).message,
        status: "error",
      });
    }
    setIsBioLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className={`${GLASS_CHIP} rounded-3xl p-8 border-white/5 shadow-2xl`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
              <Edit2 size={20} className="text-accent" />
            </div>
            Edit Profile
          </h2>
          <button
            onClick={onCancel}
            className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-accent/50 focus:bg-black/40 transition-all placeholder:text-gray-600"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">
              Headline
            </label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-accent/50 focus:bg-black/40 transition-all placeholder:text-gray-600"
              placeholder="Software Engineer & Mentor"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">
                Bio
              </label>
              <button
                type="button"
                onClick={handleGenerateBio}
                disabled={isBioLoading}
                className="text-xs flex items-center gap-1.5 text-accent hover:text-accent/80 transition-colors disabled:opacity-50 font-medium bg-accent/5 px-2 py-1 rounded-lg border border-accent/10"
              >
                {isBioLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                Generate with AI
              </button>
            </div>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={5}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-accent/50 focus:bg-black/40 transition-all resize-none placeholder:text-gray-600 leading-relaxed"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">
              Skills I Can Teach
            </label>
            <input
              type="text"
              name="teach"
              value={formData.teach}
              onChange={handleChange}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-accent/50 focus:bg-black/40 transition-all placeholder:text-gray-600"
              placeholder="React, TypeScript, Node.js (comma separated)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">
              Skills I Want to Learn
            </label>
            <input
              type="text"
              name="learn"
              value={formData.learn}
              onChange={handleChange}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-accent/50 focus:bg-black/40 transition-all placeholder:text-gray-600"
              placeholder="Piano, French, Cooking (comma separated)"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-accent hover:bg-accent/90 text-black text-sm font-bold transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-105"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

// --- (10) APP ROUTER & MAIN COMPONENT ---

// Events Page
const EventsPage = () => {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const upcomingCount = events.filter((evt) =>
    isFuture(parseISO(evt.date))
  ).length;

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.community.getEvents();
      setEvents(data);
    } catch (err) {
      toast.add({
        title: "Failed to load events",
        description: (err as Error).message,
        status: "error",
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleRsvp = async (eventId: string) => {
    if (!user) {
      toast.add({
        title: "Login required",
        description: "Sign in with your SRM AP email to RSVP",
        status: "error",
      });
      return;
    }
    try {
      const updated = await mockApi.community.rsvpEvent(eventId, user.id);
      setEvents((prev) =>
        prev.map((event) =>
          event.id === updated.id ? { ...event, ...updated } : event
        )
      );
      toast.add({ title: "RSVP confirmed", status: "success" });
    } catch (err) {
      toast.add({
        title: "RSVP failed",
        description: (err as Error).message,
        status: "error",
      });
    }
  };

  const handleCreateEvent = async (
    data: Omit<CampusEvent, "id" | "createdAt" | "attendees" | "createdBy">
  ) => {
    if (!user) {
      toast.add({
        title: "Login required",
        description: "Sign in to create events",
        status: "error",
      });
      return;
    }
    try {
      const created = await mockApi.community.createCampusEvent({
        ...data,
        createdBy: user.id,
      });
      setEvents((prev) =>
        [...prev, created].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
      toast.add({ title: "Event posted", status: "success" });
      setIsCreateModalOpen(false);
    } catch (err) {
      toast.add({
        title: "Create failed",
        description: (err as Error).message,
        status: "error",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-[40px] overflow-hidden border border-white/10 bg-[#0B0C0F]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 opacity-50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Calendar size={12} /> Campus Agenda
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Discover{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Events
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Track workshops, hackathons, and meetups. Sync every RSVP with
              your learning journey.
            </p>
            <div className="flex items-center gap-6 mt-6">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">
                  {upcomingCount}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Upcoming
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">
                  {events.length}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Total Events
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="shrink-0 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-2"
          >
            <Plus size={20} /> Host Event
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-accent animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-[32px] bg-white/5">
          <p className="text-xl font-medium text-white">
            No events on the radar.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Be the first to host a gathering, workshop, or collab lab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event, index) => {
            const isAttending = user && event.attendees.includes(user.id);
            const eventDate = parseISO(event.date);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-surface/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 hover:bg-surface/60 transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  {/* Date Box */}
                  <div className="shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-white/5 rounded-2xl border border-white/10 group-hover:border-accent/30 transition-colors">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">
                      {format(eventDate, "MMM")}
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {format(eventDate, "dd")}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                        {event.category}
                      </span>
                      {event.hostProfile && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Avatar
                            src={event.hostProfile.avatarUrl}
                            name={event.hostProfile.name}
                            className="h-5 w-5"
                          />
                          <span className="truncate max-w-[100px]">
                            {event.hostProfile.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-accent transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 mb-6">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {format(eventDate, "h:mm a")}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={14} />
                        {event.attendees.length} attending
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-xs text-gray-500 font-medium">
                        {formatDistanceToNow(eventDate, { addSuffix: true })}
                      </span>
                      <button
                        onClick={() => handleRsvp(event.id)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          isAttending
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-white text-black hover:scale-105 shadow-lg shadow-white/10"
                        }`}
                      >
                        {isAttending ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle2 size={16} /> Going
                          </span>
                        ) : (
                          "RSVP Now"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <CreateCampusEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateEvent}
      />
    </div>
  );
};

const CreateCampusEventModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    data: Omit<CampusEvent, "id" | "createdAt" | "attendees" | "createdBy">
  ) => Promise<void>;
}> = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Workshop",
    location: "",
    date: "",
    coverUrl: "",
    hostClubId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreate({
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        date: form.date,
        coverUrl: form.coverUrl || undefined,
        hostClubId: form.hostClubId || undefined,
      } as Omit<CampusEvent, "id" | "createdAt" | "attendees" | "createdBy">);
      setForm({
        title: "",
        description: "",
        category: "Workshop",
        location: "",
        date: "",
        coverUrl: "",
        hostClubId: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Host a campus event" isOpen={isOpen} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Title</label>
          <Input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">
            Description
          </label>
          <Textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Category</label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Location</label>
            <Input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Starts</label>
            <Input
              type="datetime-local"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Host Club ID (optional)
            </label>
            <Input
              value={form.hostClubId}
              onChange={(e) => setForm({ ...form, hostClubId: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">
            Cover Image URL
          </label>
          <Input
            value={form.coverUrl}
            onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            Publish Event
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Projects Page
const ProjectsPage = () => {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [projects, setProjects] = useState<EnrichedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<EnrichedProject | null>(
    null
  );

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.community.getProjects();
      setProjects(data);
    } catch (err) {
      toast.add({
        title: "Failed to load projects",
        description: (err as Error).message,
        status: "error",
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (
    data: Omit<
      ProjectOpportunity,
      "id" | "applicants" | "createdAt" | "ownerId"
    >
  ) => {
    if (!user) {
      toast.add({
        title: "Login required",
        description: "Sign in to post projects",
        status: "error",
      });
      return;
    }
    try {
      const created = await mockApi.community.createProject({
        ...data,
        ownerId: user.id,
      });
      setProjects((prev) => [created, ...prev]);
      toast.add({ title: "Project posted", status: "success" });
      setIsCreateModalOpen(false);
    } catch (err) {
      toast.add({
        title: "Create failed",
        description: (err as Error).message,
        status: "error",
      });
    }
  };

  const handleApply = async (projectId: string, note?: string) => {
    if (!user) {
      toast.add({
        title: "Login required",
        description: "Sign in to apply",
        status: "error",
      });
      return;
    }
    try {
      const updated = await mockApi.community.applyProject(
        projectId,
        user.id,
        note
      );
      setProjects((prev) =>
        prev.map((project) =>
          project.id === updated.id ? { ...project, ...updated } : project
        )
      );
      toast.add({ title: "Application sent", status: "success" });
      setActiveProject(null);
    } catch (err) {
      toast.add({
        title: "Application failed",
        description: (err as Error).message,
        status: "error",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-[40px] overflow-hidden border border-white/10 bg-[#0B0C0F]">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 opacity-50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-600/10 rounded-full blur-[100px]" />

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Rocket size={12} /> Project Lab
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Build the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Future
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Collaborate on real-world applications. Find teammates, join
              startups, and build your portfolio.
            </p>
            <div className="flex items-center gap-6 mt-6">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">
                  {projects.filter((p) => p.status === "Hiring").length}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Active Roles
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">
                  {projects.length}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Total Projects
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="shrink-0 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-2"
          >
            <Plus size={20} /> Create Project
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 text-accent animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center border border-dashed border-white/10 rounded-[32px] py-32 bg-surface/30">
          <p className="text-gray-500">No active projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-surface/40 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden hover:bg-surface/60 transition-all duration-300 flex flex-col"
            >
              <div className="p-8 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    {project.ownerProfile && (
                      <div className="relative">
                        <Avatar
                          src={project.ownerProfile.avatarUrl}
                          name={project.ownerProfile.name}
                          className="h-12 w-12 ring-2 ring-white/10 shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-[#0B0C0F] rounded-full p-0.5">
                          <div className="bg-emerald-500 h-3 w-3 rounded-full border-2 border-[#0B0C0F]" />
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {project.ownerProfile?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        Posted{" "}
                        {formatDistanceToNow(new Date(project.createdAt))} ago
                      </p>
                    </div>
                  </div>
                  <span
                    className={`
                      px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                      ${
                        project.status === "Hiring"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                      }
                    `}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-400 text-base leading-relaxed mb-8 line-clamp-3 flex-grow">
                  {project.description}
                </p>

                {/* Footer / Meta */}
                <div className="mt-auto space-y-6">
                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 font-medium hover:bg-white/10 hover:border-white/20 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {project.applicants.length > 0 ? (
                          <>
                            {project.applicants.slice(0, 3).map((app, i) => (
                              <div
                                key={i}
                                className="h-8 w-8 rounded-full bg-surface border-2 border-[#0B0C0F] flex items-center justify-center text-[10px] text-gray-400 ring-1 ring-white/10"
                              >
                                <User size={12} />
                              </div>
                            ))}
                            {project.applicants.length > 3 && (
                              <div className="h-8 w-8 rounded-full bg-surface border-2 border-[#0B0C0F] flex items-center justify-center text-[10px] text-gray-400 ring-1 ring-white/10">
                                +{project.applicants.length - 3}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                            <User size={12} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {project.applicants.length} Applicants
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveProject(project)}
                      className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-lg shadow-white/10 flex items-center gap-2"
                    >
                      View Details <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />

      {activeProject && (
        <ApplyProjectModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
          onApply={(note) => handleApply(activeProject.id, note)}
        />
      )}
    </div>
  );
};

const CreateProjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    data: Omit<
      ProjectOpportunity,
      "id" | "applicants" | "createdAt" | "ownerId"
    >
  ) => Promise<void>;
}> = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredSkills: "React, TypeScript",
    status: "Hiring" as ProjectOpportunity["status"],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreate({
        title: form.title,
        description: form.description,
        requiredSkills: form.requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        status: form.status,
      });
      setForm({
        title: "",
        description: "",
        requiredSkills: "React, TypeScript",
        status: "Hiring",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Post a project" isOpen={isOpen} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Title</label>
          <Input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">
            Description
          </label>
          <Textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">
            Required skills (comma separated)
          </label>
          <Input
            value={form.requiredSkills}
            onChange={(e) =>
              setForm({ ...form, requiredSkills: e.target.value })
            }
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Status</label>
          <select
            className="w-full rounded-xl bg-background border border-white/10 px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as ProjectOpportunity["status"],
              })
            }
          >
            <option value="Hiring">Hiring</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            Post Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const ApplyProjectModal: React.FC<{
  project: EnrichedProject;
  onClose: () => void;
  onApply: (note: string) => Promise<void>;
}> = ({ project, onClose, onApply }) => {
  const [note, setNote] = useState(
    "Hey! I'd love to contribute and can start immediately."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onApply(note);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={`Apply to ${project.title}`} isOpen={true} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm text-gray-400">
          Share a quick note so the project owner knows why you're a fit.
        </p>
        <Textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            Send Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Q&A Page
const QAPage = () => {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [questions, setQuestions] = useState<EnrichedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [answerTarget, setAnswerTarget] = useState<EnrichedQuestion | null>(
    null
  );

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.community.getQuestions();
      setQuestions(data);
    } catch (err) {
      toast.add({
        title: "Failed to load questions",
        description: (err as Error).message,
        status: "error",
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAskQuestion = async (data: {
    title: string;
    content: string;
    tags: string[];
  }) => {
    if (!user) {
      toast.add({
        title: "Login required",
        description: "Sign in to ask questions",
        status: "error",
      });
      return;
    }
    try {
      const created = await mockApi.community.askQuestion({
        ...data,
        authorId: user.id,
      });
      setQuestions((prev) => [created, ...prev]);
      toast.add({ title: "Question posted", status: "success" });
      setIsAskModalOpen(false);
    } catch (err) {
      toast.add({
        title: "Post failed",
        description: (err as Error).message,
        status: "error",
      });
    }
  };

  const handleVote = async (questionId: string, delta: number) => {
    try {
      const updated = await mockApi.community.voteQuestion(questionId, delta);
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === updated.id ? updated : question
        )
      );
    } catch (err) {
      toast.add({
        title: "Vote failed",
        description: (err as Error).message,
        status: "error",
      });
    }
  };

  const handleAnswer = async (questionId: string, content: string) => {
    if (!user) {
      toast.add({
        title: "Login required",
        description: "Sign in to answer",
        status: "error",
      });
      return;
    }
    try {
      const updated = await mockApi.community.answerQuestion(questionId, {
        authorId: user.id,
        content,
      });
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === updated.id ? updated : question
        )
      );
      toast.add({ title: "Answer shared", status: "success" });
      setAnswerTarget(null);
    } catch (err) {
      toast.add({
        title: "Answer failed",
        description: (err as Error).message,
        status: "error",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-[40px] overflow-hidden border border-white/10 bg-[#0B0C0F]">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-orange-900/20 opacity-50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px]" />

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
              <MessageCircle size={12} /> Knowledge Base
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Ask, Learn,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                Share
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Get answers from the community. Solve problems together and build
              your reputation as an expert.
            </p>
            <div className="flex items-center gap-6 mt-6">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">
                  {questions.length}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Questions
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">
                  {questions.reduce((acc, q) => acc + q.answers.length, 0)}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Answers
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAskModalOpen(true)}
            className="shrink-0 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-2"
          >
            <Plus size={20} /> Ask Question
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-accent animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center border border-dashed border-white/10 rounded-[32px] py-20 bg-surface/30">
          <p className="text-xl font-medium text-white">No questions yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Be the first to ask something!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-surface/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 hover:bg-surface/60 transition-all duration-300"
            >
              <div className="flex gap-6">
                {/* Vote Column */}
                <div className="flex flex-col items-center gap-2 min-w-[60px]">
                  <button
                    onClick={() => handleVote(q.id, 1)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-amber-400 transition-colors"
                  >
                    <ChevronUp size={20} />
                  </button>
                  <span className="text-xl font-bold text-white">
                    {q.votes}
                  </span>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Votes
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">
                      {q.title}
                    </h3>
                    <button
                      onClick={() => setAnswerTarget(q)}
                      className="shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                    >
                      Answer
                    </button>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                    {q.content}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {q.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <MessageSquare size={14} />
                        {q.answers.length} Answers
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Clock size={14} />
                        {formatDistanceToNow(new Date(q.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>

                    {q.answers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {q.answers.slice(0, 3).map((ans, i) => (
                            <div
                              key={i}
                              className="h-6 w-6 rounded-full bg-surface border border-[#0B0C0F] flex items-center justify-center"
                            >
                              <User size={10} className="text-gray-400" />
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          Last answer by{" "}
                          <span className="text-white font-medium">
                            {q.answers[0].author?.name || "Anonymous"}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AskQuestionModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onAsk={handleAskQuestion}
      />

      {answerTarget && (
        <AnswerQuestionModal
          question={answerTarget}
          onClose={() => setAnswerTarget(null)}
          onAnswer={(content) => handleAnswer(answerTarget.id, content)}
        />
      )}
    </div>
  );
};

const AskQuestionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAsk: (data: {
    title: string;
    content: string;
    tags: string[];
  }) => Promise<void>;
}> = ({ isOpen, onClose, onAsk }) => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "help, srm",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAsk({
        title: form.title,
        content: form.content,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      setForm({ title: "", content: "", tags: "help, srm" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Ask the campus" isOpen={isOpen} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Title</label>
          <Input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Details</label>
          <Textarea
            required
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">
            Tags (comma separated)
          </label>
          <Input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            Post Question
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const AnswerQuestionModal: React.FC<{
  question: EnrichedQuestion;
  onClose: () => void;
  onAnswer: (content: string) => Promise<void>;
}> = ({ question, onClose, onAnswer }) => {
  const [content, setContent] = useState(
    "I faced this recently, here's what helped..."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAnswer(content);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={`Answer: ${question.title}`} isOpen={true} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Textarea
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            Share Answer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Clubs Page (replaces Community)
const ClubsPage = () => {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    mockApi.community.getClubs().then(setClubs);
  }, []);

  if (!user) return null;

  const handleJoinClub = async (clubId: string) => {
    const updatedClub = await mockApi.community.joinClub(clubId, user.id);
    setClubs(clubs.map((c) => (c.id === clubId ? updatedClub : c)));
    if (selectedClub?.id === clubId) {
      setSelectedClub(updatedClub);
    }
  };

  const handleCreateClub = async (data: any) => {
    if (user.role === "student") {
      toast.add({
        title: "Request Sent",
        description:
          "Your club creation request has been sent to the Directorate.",
        status: "success",
      });

      // Simulate approval delay
      setTimeout(async () => {
        const newClub = await mockApi.community.createClub(user.id, data);
        setClubs((prev) => [...prev, newClub]);
        toast.add({
          title: "Club Approved!",
          description: `Your club "${data.name}" has been approved and is now live.`,
          status: "success",
        });
      }, 5000);
    } else {
      const newClub = await mockApi.community.createClub(user.id, data);
      setClubs([...clubs, newClub]);
      toast.add({ title: "Club created successfully", status: "success" });
    }
  };

  if (selectedClub) {
    return (
      <ClubDetailPage
        club={selectedClub}
        onBack={() => setSelectedClub(null)}
        onJoin={() => handleJoinClub(selectedClub.id)}
        onUpdate={(updatedClub) => {
          setSelectedClub(updatedClub);
          setClubs(
            clubs.map((c) => (c.id === updatedClub.id ? updatedClub : c))
          );
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-[40px] overflow-hidden border border-white/10 bg-[#0B0C0F]">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20 opacity-50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-accent text-xs font-bold uppercase tracking-wider mb-4">
              <Users size={12} /> Community Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Find Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">
                Tribe
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Connect with like-minded students in cultural, sports, gaming, and
              technical clubs. Join events, collaborate on projects, and grow
              together.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="shrink-0 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-2"
          >
            <Plus size={20} />{" "}
            {user?.role === "student" ? "Request Club" : "Create Club"}
          </button>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club, index) => (
          <motion.div
            key={club.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ClubCard
              club={club}
              onJoin={() => handleJoinClub(club.id)}
              onClick={() => setSelectedClub(club)}
            />
          </motion.div>
        ))}
      </div>

      <CreateClubModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateClub}
      />
    </div>
  );
};

// Leaderboard Page

const LeaderboardPage = () => {
  const profiles = Object.values(db.get().profiles || {}) as ProfileData[];
  const sessions = Object.values(db.get().sessions || {}) as SessionData[];

  // Compute teaching counts with realistic variance
  const stats = profiles.map((p) => {
    const teaches = sessions.filter(
      (s) => s.teacherId === p.userId && s.status === "completed"
    );
    const teachingCount = teaches.length;
    const totalHours = teaches.reduce((sum, s) => sum + (s.duration || 0), 0);

    return {
      profile: p,
      teachingCount,
      totalHours,
      avgRating: p.rating || Math.random() * 1 + 4,
      lastActive:
        teaches.length > 0 ? teaches[teaches.length - 1].scheduledTime : null,
    };
  });

  // Sort by teaching count, then by rating
  const top = stats
    .filter((s) => s.teachingCount > 0)
    .sort((a, b) => {
      if (b.teachingCount !== a.teachingCount)
        return b.teachingCount - a.teachingCount;
      return b.avgRating - a.avgRating;
    })
    .slice(0, 20);

  const topThree = top.slice(0, 3);
  const leaderSessions = top[0]?.teachingCount || 1;

  return (
    <div className="relative flex-1 w-full min-h-screen">
      {/* Background Effects */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute -top-32 right-[10%] w-[600px] h-[600px] rounded-full bg-accent/10 blur-[150px]" />
        <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[500px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="relative max-w-6xl mx-auto pb-20 px-4 md:px-6 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[11px] uppercase tracking-[0.2em] text-accent font-bold mb-4 shadow-[0_0_15px_rgba(0,255,157,0.1)]">
              <Medal size={14} /> Top Mentors
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
              Leaderboard
            </h1>
            <p className="text-gray-400 max-w-lg text-base leading-relaxed">
              Celebrating the mentors who dedicate their time to empower the
              community.
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4">
            <div
              className={`${GLASS_CHIP} px-6 py-4 rounded-2xl border-white/5 flex items-center gap-4`}
            >
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                <Users size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{top.length}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  Active Mentors
                </p>
              </div>
            </div>
            <div
              className={`${GLASS_CHIP} px-6 py-4 rounded-2xl border-white/5 flex items-center gap-4`}
            >
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <Star size={20} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {top.length
                    ? (
                        top.reduce((sum, m) => sum + m.avgRating, 0) /
                        top.length
                      ).toFixed(1)
                    : "--"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  Avg Rating
                </p>
              </div>
            </div>
            <div
              className={`${GLASS_CHIP} px-6 py-4 rounded-2xl border-white/5 flex items-center gap-4`}
            >
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Clock size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {top.reduce((sum, m) => sum + m.totalHours, 0)}h
                </p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  Hours Shared
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Podium - Top 3 */}
        {topThree.length > 0 && (
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
              {/* 2nd Place */}
              {topThree[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="order-first md:order-1 relative"
                >
                  <div className="absolute inset-0 bg-slate-400/20 blur-[60px] rounded-full opacity-20" />
                  <div
                    className={`${GLASS_CHIP} relative overflow-hidden rounded-3xl border-white/10 p-6 text-center transform hover:-translate-y-2 transition-transform duration-300`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-50" />

                    <div className="relative mb-4">
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-800 rounded-full border border-slate-600 flex items-center justify-center text-slate-300 font-bold text-sm shadow-lg z-10">
                        2
                      </div>
                      <Avatar
                        src={topThree[1].profile.avatarUrl}
                        name={topThree[1].profile.name}
                        className="h-24 w-24 mx-auto rounded-2xl border-4 border-slate-400/20 shadow-2xl"
                      />
                    </div>

                    <h3 className="font-bold text-white text-lg mb-1 truncate">
                      {topThree[1].profile.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 truncate px-2">
                      {topThree[1].profile.headline}
                    </p>

                    <div className="flex items-center justify-center gap-3 bg-black/20 rounded-xl py-2 px-3">
                      <div className="text-center">
                        <div className="text-sm font-bold text-white">
                          {topThree[1].teachingCount}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase">
                          Sessions
                        </div>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="text-center">
                        <div className="text-sm font-bold text-yellow-400 flex items-center gap-1">
                          {topThree[1].avgRating.toFixed(1)}{" "}
                          <Star size={10} fill="currentColor" />
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase">
                          Rating
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="order-2 md:order-2 relative z-10"
                >
                  <div className="absolute inset-0 bg-amber-500/30 blur-[80px] rounded-full opacity-40" />
                  <div className="relative bg-gradient-to-b from-amber-500/10 to-[#0a0e16] backdrop-blur-xl border border-amber-500/30 rounded-[2rem] p-8 text-center transform hover:-translate-y-2 transition-transform duration-300 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

                    <div className="relative mb-6">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <Crown
                          size={40}
                          className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                          fill="currentColor"
                        />
                      </div>
                      <Avatar
                        src={topThree[0].profile.avatarUrl}
                        name={topThree[0].profile.name}
                        className="h-32 w-32 mx-auto rounded-[1.5rem] border-[6px] border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                      />
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                        Champion
                      </div>
                    </div>

                    <h3 className="font-bold text-white text-2xl mb-1 truncate mt-4">
                      {topThree[0].profile.name}
                    </h3>
                    <p className="text-sm text-amber-200/70 mb-6 truncate px-4">
                      {topThree[0].profile.headline}
                    </p>

                    <div className="grid grid-cols-3 gap-2 bg-amber-500/5 rounded-2xl py-3 px-2 border border-amber-500/10">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">
                          {topThree[0].teachingCount}
                        </div>
                        <div className="text-[10px] text-amber-200/50 uppercase font-semibold">
                          Sessions
                        </div>
                      </div>
                      <div className="text-center border-x border-amber-500/10">
                        <div className="text-lg font-bold text-white">
                          {topThree[0].totalHours}h
                        </div>
                        <div className="text-[10px] text-amber-200/50 uppercase font-semibold">
                          Hours
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-amber-400 flex items-center justify-center gap-1">
                          {topThree[0].avgRating.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-amber-200/50 uppercase font-semibold">
                          Rating
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="order-3 md:order-3 relative"
                >
                  <div className="absolute inset-0 bg-orange-400/20 blur-[60px] rounded-full opacity-20" />
                  <div
                    className={`${GLASS_CHIP} relative overflow-hidden rounded-3xl border-white/10 p-6 text-center transform hover:-translate-y-2 transition-transform duration-300`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-50" />

                    <div className="relative mb-4">
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-900/80 rounded-full border border-orange-600 flex items-center justify-center text-orange-300 font-bold text-sm shadow-lg z-10">
                        3
                      </div>
                      <Avatar
                        src={topThree[2].profile.avatarUrl}
                        name={topThree[2].profile.name}
                        className="h-24 w-24 mx-auto rounded-2xl border-4 border-orange-400/20 shadow-2xl"
                      />
                    </div>

                    <h3 className="font-bold text-white text-lg mb-1 truncate">
                      {topThree[2].profile.name}
                    </h3>
                    <p className="text-xs text-orange-200/60 mb-4 truncate px-2">
                      {topThree[2].profile.headline}
                    </p>

                    <div className="flex items-center justify-center gap-3 bg-black/20 rounded-xl py-2 px-3">
                      <div className="text-center">
                        <div className="text-sm font-bold text-white">
                          {topThree[2].teachingCount}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase">
                          Sessions
                        </div>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="text-center">
                        <div className="text-sm font-bold text-yellow-400 flex items-center gap-1">
                          {topThree[2].avgRating.toFixed(1)}{" "}
                          <Star size={10} fill="currentColor" />
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase">
                          Rating
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Full List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <List size={20} className="text-gray-400" />
              All Mentors
            </h3>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Ranked by sessions completed
            </span>
          </div>

          <div className="space-y-3">
            {top.map((t, index) => {
              const rank = index + 1;
              const progress = Math.min(
                100,
                Math.round((t.teachingCount / leaderSessions) * 100)
              );

              // Skip top 3 in the list if you want, or keep them.
              // Keeping them for completeness but styling them differently.
              const isTop3 = rank <= 3;

              return (
                <motion.div
                  key={t.profile.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${GLASS_CHIP} group relative flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-4 rounded-2xl border-white/5 hover:bg-white/5 transition-all hover:scale-[1.01] hover:shadow-lg`}
                >
                  {/* Rank */}
                  <div
                    className={`shrink-0 w-8 text-center font-bold text-lg ${
                      rank === 1
                        ? "text-amber-400"
                        : rank === 2
                        ? "text-slate-300"
                        : rank === 3
                        ? "text-orange-400"
                        : "text-gray-500"
                    }`}
                  >
                    #{rank}
                  </div>

                  {/* Avatar */}
                  <Avatar
                    src={t.profile.avatarUrl}
                    name={t.profile.name}
                    className="h-12 w-12 rounded-xl border border-white/10 flex-shrink-0 shadow-sm"
                  />

                  {/* Name & Headline */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base truncate group-hover:text-accent transition-colors">
                        {t.profile.name}
                      </h4>
                      {t.profile.badges?.includes("verified") && (
                        <CheckCircle size={14} className="text-blue-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {t.profile.headline}
                    </p>
                  </div>

                  {/* Stats - Desktop */}
                  <div className="hidden md:flex items-center gap-8 flex-shrink-0">
                    <div className="flex flex-col items-end w-24">
                      <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                        {t.avgRating.toFixed(1)}{" "}
                        <Star size={12} fill="currentColor" />
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                        Rating
                      </span>
                    </div>

                    <div className="flex flex-col items-end w-24">
                      <span className="text-white font-bold">
                        {t.totalHours}h
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                        Hours
                      </span>
                    </div>

                    <div className="flex flex-col items-end w-32">
                      <span className="text-accent font-bold text-lg">
                        {t.teachingCount}
                      </span>
                      <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">
                        Sessions
                      </span>
                    </div>
                  </div>

                  {/* Stats - Mobile */}
                  <div className="md:hidden text-right">
                    <div className="text-base font-bold text-accent">
                      {t.teachingCount}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase">
                      Sessions
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {top.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
              <Medal size={32} />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              No Mentors Yet
            </h3>
            <p className="text-gray-400">
              Be the first to complete a session and claim the top spot!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const HomeSection = () => {
  const [activeTab, setActiveTab] = useState<
    "feed" | "clubs" | "events" | "projects"
  >("feed");
  const user = useAuthStore((s) => s.user);
  const [feedPosts, setFeedPosts] = useState<EnrichedPost[]>([]);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const toast = useToast();

  // Mock feed data
  useEffect(() => {
    // In a real app, this would fetch a personalized feed
    const mockFeed = [
      {
        id: "feed-1",
        authorId: "user-2",
        content:
          "Just finished a great session on React Hooks! Thanks @Arun for the clear explanation.",
        clubId: "club-1",
        likes: [
          "user-1",
          "user-3",
          "user-4",
          "user-5",
          "user-6",
          "user-7",
          "user-8",
          "user-9",
          "user-10",
          "user-11",
          "user-12",
          "user-13",
        ],
        comments: [
          {
            id: "c1",
            authorId: "user-3",
            text: "Great job!",
            createdAt: new Date().toISOString(),
          },
          {
            id: "c2",
            authorId: "user-4",
            text: "Awesome!",
            createdAt: new Date().toISOString(),
          },
          {
            id: "c3",
            authorId: "user-5",
            text: "Keep it up!",
            createdAt: new Date().toISOString(),
          },
        ],
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        author: {
          name: "Priya Sharma",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        },
      },
      {
        id: "feed-2",
        authorId: "user-3",
        content:
          "Anyone interested in a group study for the upcoming System Design interview?",
        clubId: "club-2",
        likes: [
          "user-1",
          "user-2",
          "user-4",
          "user-5",
          "user-6",
          "user-7",
          "user-8",
          "user-9",
        ],
        comments: [
          {
            id: "c4",
            authorId: "user-1",
            text: "I am interested!",
            createdAt: new Date().toISOString(),
          },
          {
            id: "c5",
            authorId: "user-2",
            text: "Me too!",
            createdAt: new Date().toISOString(),
          },
          {
            id: "c6",
            authorId: "user-4",
            text: "Count me in.",
            createdAt: new Date().toISOString(),
          },
          {
            id: "c7",
            authorId: "user-5",
            text: "When?",
            createdAt: new Date().toISOString(),
          },
          {
            id: "c8",
            authorId: "user-6",
            text: "Where?",
            createdAt: new Date().toISOString(),
          },
        ],
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        author: {
          name: "Nikhil Patel",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nikhil",
        },
      },
    ];
    setFeedPosts(mockFeed as any);
  }, []);

  const handleCreatePost = async () => {
    if (!postContent.trim() || isPosting) return;
    setIsPosting(true);

    // Simulate API call
    setTimeout(() => {
      const newPost = {
        id: `feed-${Date.now()}`,
        authorId: user?.id || "user-1",
        content: postContent,
        clubId: "general",
        likes: [],
        comments: [],
        timestamp: new Date().toISOString(),
        author: {
          name: user?.name || "Me",
          avatarUrl: user?.avatarUrl || "",
        },
      };
      setFeedPosts([newPost as any, ...feedPosts]);
      setPostContent("");
      setIsPosting(false);
      toast.add({ title: "Posted to feed", status: "success" });
    }, 800);
  };

  const TrendingWidget = () => (
    <div className="bg-surface border border-white/10 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-white flex items-center gap-2">
        <Sparkles size={16} className="text-accent" /> Trending Clubs
      </h3>
      <div className="space-y-3">
        {[
          { name: "AI Enthusiasts", members: 1240, color: "bg-blue-500" },
          { name: "Web3 Builders", members: 850, color: "bg-purple-500" },
          { name: "Design Hub", members: 620, color: "bg-pink-500" },
        ].map((club, i) => (
          <div
            key={i}
            className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-xl ${club.color}/20 flex items-center justify-center text-white font-bold`}
            >
              {club.name[0]}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white group-hover:text-accent transition-colors">
                {club.name}
              </div>
              <div className="text-xs text-gray-500">
                {club.members} members
              </div>
            </div>
            <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const EventsWidget = () => (
    <div className="bg-surface border border-white/10 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-white flex items-center gap-2">
        <Calendar size={16} className="text-accent" /> Upcoming Events
      </h3>
      <div className="space-y-3">
        {[
          { title: "Hackathon 2024", date: "Tomorrow, 10:00 AM", type: "Tech" },
          { title: "Design Workshop", date: "Sat, 2:00 PM", type: "Creative" },
        ].map((event, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-xs font-bold text-gray-400">
              <span>DEC</span>
              <span className="text-white text-sm">{12 + i}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-white line-clamp-1">
                {event.title}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{event.date}</div>
              <div className="text-[10px] text-accent mt-1 bg-accent/10 inline-block px-2 py-0.5 rounded-full">
                {event.type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Home</h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back, {user?.name || "Student"}!
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="bg-surface border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-sm text-gray-400">
            <Search size={14} />
            <span>Search...</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Bell size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-border mb-6 px-4 sticky top-0 bg-[#03050A]/95 backdrop-blur-xl z-20 pt-2">
        {["feed", "clubs", "events", "projects"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 text-sm font-medium capitalize transition-all relative ${
              activeTab === tab
                ? "text-accent"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeHomeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[60vh] px-4">
        {activeTab === "feed" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Main Feed Column */}
            <div className="lg:col-span-8 space-y-6">
              <ActionComposer
                value={postContent}
                onChange={setPostContent}
                onSubmit={handleCreatePost}
                placeholder="What's on your mind?"
                isSubmitting={isPosting}
                ctaLabel="Post"
                avatar={{ src: user?.avatarUrl, name: user?.name }}
              />

              <div className="space-y-4">
                {feedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>

            {/* Right Sidebar Widgets */}
            <div className="hidden lg:block lg:col-span-4 space-y-6">
              <TrendingWidget />
              <EventsWidget />
            </div>
          </div>
        )}

        {activeTab === "clubs" && (
          <div className="animate-in fade-in duration-500">
            <ClubsPage />
          </div>
        )}

        {activeTab === "events" && (
          <div className="animate-in fade-in duration-500">
            <EventsPage />
          </div>
        )}

        {activeTab === "projects" && (
          <div className="animate-in fade-in duration-500">
            <ProjectsPage />
          </div>
        )}
      </div>
    </div>
  );
};

const DepartmentPage = () => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("files");

  const departments = [
    {
      id: "engineering",
      name: "Engineering",
      icon: "🔧",
      color: "bg-blue-500",
    },
    { id: "business", name: "Business", icon: "💼", color: "bg-emerald-500" },
    {
      id: "arts",
      name: "Arts & Humanities",
      icon: "🎨",
      color: "bg-purple-500",
    },
    { id: "science", name: "Science", icon: "🔬", color: "bg-cyan-500" },
    { id: "law", name: "Law", icon: "⚖️", color: "bg-amber-500" },
    { id: "medicine", name: "Medicine", icon: "🩺", color: "bg-red-500" },
  ];

  const resources = {
    files: [
      {
        title: "Lecture Notes - Week 1",
        type: "PDF",
        size: "2.4 MB",
        date: "2 days ago",
      },
      {
        title: "Lab Manual",
        type: "DOCX",
        size: "1.1 MB",
        date: "1 week ago",
      },
      {
        title: "Project Guidelines",
        type: "PDF",
        size: "500 KB",
        date: "2 weeks ago",
      },
    ],
    books: [
      { title: "Introduction to Algorithms", author: "Cormen", year: "2022" },
      { title: "Clean Code", author: "Robert C. Martin", year: "2008" },
      { title: "Design Patterns", author: "Gang of Four", year: "1994" },
    ],
    papers: [
      { title: "Mid-Term 2024", year: "2024", semester: "Fall" },
      { title: "Final Exam 2023", year: "2023", semester: "Spring" },
      { title: "Mid-Term 2023", year: "2023", semester: "Fall" },
    ],
    material: [
      { title: "Video Lectures Playlist", type: "Link" },
      { title: "Practice Problems Set", type: "PDF" },
      { title: "Reference Websites", type: "Link" },
    ],
  };

  if (!selectedDept) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Departments</h1>
          <p className="text-text-muted">
            Select your department to access study resources.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className="group relative overflow-hidden bg-surface border border-white/10 rounded-3xl p-8 text-left hover:border-accent/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 ${dept.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform duration-500`}
              />
              <div className="text-4xl mb-4">{dept.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{dept.name}</h3>
              <p className="text-sm text-text-muted">
                Access course materials, papers, and books.
              </p>
              <div className="mt-6 flex items-center text-accent text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                View Resources <ChevronRight size={16} className="ml-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <button
        onClick={() => setSelectedDept(null)}
        className="flex items-center text-text-muted hover:text-white transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to Departments
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">
            {departments.find((d) => d.id === selectedDept)?.icon}
          </span>
          {departments.find((d) => d.id === selectedDept)?.name}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "files", label: "Files", icon: Folder },
          { id: "books", label: "Books", icon: BookOpen },
          { id: "papers", label: "Question Papers", icon: FileText },
          { id: "material", label: "Study Material", icon: Layers },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-accent text-black shadow-lg shadow-accent/20"
                : "bg-surface border border-white/10 text-text-muted hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-surface border border-white/10 rounded-3xl p-6 min-h-[400px]">
        {activeTab === "files" && (
          <div className="space-y-4">
            {resources.files.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-accent transition-colors">
                      {file.title}
                    </h4>
                    <p className="text-xs text-text-muted">
                      {file.type} • {file.size} • {file.date}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-full bg-white/10 hover:bg-accent hover:text-black transition-colors">
                  <Download size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "books" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.books.map((book, i) => (
              <div
                key={i}
                className="bg-black/20 rounded-xl p-4 hover:bg-black/40 transition-colors cursor-pointer group"
              >
                <div className="aspect-[2/3] bg-white/5 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <BookOpen
                    size={48}
                    className="text-white/20 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-accent font-bold text-sm">
                      Read Now
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-white truncate">{book.title}</h4>
                <p className="text-sm text-text-muted">{book.author}</p>
                <p className="text-xs text-text-muted mt-1">{book.year}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "papers" && (
          <div className="space-y-4">
            {resources.papers.map((paper, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{paper.title}</h4>
                    <p className="text-xs text-text-muted">
                      {paper.semester} • {paper.year}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-white/10 text-sm font-bold hover:bg-white/20 transition-colors">
                  View PDF
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "material" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.material.map((item, i) => (
              <div
                key={i}
                className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-accent/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-full bg-accent/10 text-accent">
                    <Layers size={24} />
                  </div>
                  <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-text-muted">
                    {item.type}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-text-muted">
                  Comprehensive study material curated by top professors.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const pages: { [key: string]: React.ComponentType } = {
  home: HomeSection,
  dashboard: DashboardPage,
  events: EventsPage,
  clubs: ClubsPage,
  projects: ProjectsPage,
  qa: QAPage,
  leaderboard: LeaderboardPage,
  chat: ChatPage,
  community: CommunityPage,
  profile: ProfilePage,
  settings: SettingsPage,
  department: DepartmentPage,
};

const AppRouter = () => {
  const [page, setPageRaw] = useState("home");
  const [params, setParams] = useState<Record<string, unknown>>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const setPage = (newPage: string, newParams?: Record<string, unknown>) => {
    setPageRaw(newPage);
    setParams(newParams || {});
  };

  const toggleSidebar = () => setIsSidebarCollapsed((s) => !s);

  const CurrentPage = pages[page] || DashboardPage;
  const isChatPage = page === "chat";

  return (
    <PageContext.Provider
      value={{ setPage, page, params, isSidebarCollapsed, toggleSidebar }}
    >
      <div className="flex h-screen text-text-primary relative overflow-hidden bg-[#03050A]">
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Auth Page "Impressive" Background Elements */}
          <div className="absolute -top-32 -left-10 h-96 w-96 bg-accent/20 blur-[160px]" />
          <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] bg-purple-600/15 blur-[180px]" />
          <Prism
            animationType="rotate"
            timeScale={0.3} // Slightly slower for main app to be less distracting
            height={4}
            baseWidth={6}
            scale={3.5}
            hueShift={240}
            colorFrequency={0.6}
            noise={0.25}
            glow={1.2}
            bloom={1.5}
          />
          {/* Subtle texture overlay */}
          <div className="opacity-20 mix-blend-overlay">
            {/* <PixelBlast
              variant="square"
              pixelSize={3}
              color={DESIGN_SYSTEM.palette.accent}
              patternScale={1.8}
              patternDensity={1.2}
              liquid={false}
              enableRipples={false}
              edgeFade={0.8}
              noiseAmount={0.08}
            /> */}
          </div>
        </div>

        {/* Glassy Overlay to ensure text readability */}
        <div className="absolute inset-0 pointer-events-none bg-[rgba(3,5,10,0.45)] backdrop-blur-[0.5px] z-[1]" />

        <div className="relative z-10 flex h-full w-full gap-4 px-2 sm:px-4">
          <Sidebar />
          <div
            className={`flex-1 flex flex-col overflow-hidden pr-0 sm:pr-2 ${
              isChatPage ? "pt-4 pb-0" : "py-4"
            }`}
          >
            <Header />
            <main
              className={`flex-1 flex flex-col min-h-0 mt-6 ${
                isChatPage ? "overflow-hidden pb-0" : "overflow-y-auto pb-10"
              } px-2 sm:px-4 lg:px-8`}
            >
              <div
                className={
                  isChatPage
                    ? "flex flex-col flex-1 min-h-0 w-full"
                    : "mx-auto max-w-6xl w-full"
                }
              >
                <PageTransition pageKey={`${page}-${params.id || ""}`}>
                  {/* Error boundary around current page to avoid full black-screen on runtime errors */}
                  <ErrorBoundary>
                    <CurrentPage />
                  </ErrorBoundary>
                </PageTransition>
              </div>
            </main>
          </div>
        </div>
      </div>
    </PageContext.Provider>
  );
};

const App = () => {
  const { status, init, user } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  console.log("App render - status:", status, "user:", user?.name || "none");

  if (status === "idle" || status === "loading") {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <Loader2 className="h-16 w-16 text-accent animate-spin" />
      </div>
    );
  }

  if (status === "guest") {
    return <LoginPage />;
  }

  return <AppRouter />;
};

// --- (11) GLOBAL STYLES & FONT IMPORT ---
// This component injects the global styles.
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    
    body {
      background-color: #020408;
      background-image: 
        radial-gradient(at 0% 0%, rgba(17, 24, 39, 1) 0, transparent 50%), 
        radial-gradient(at 50% 0%, rgba(17, 24, 39, 1) 0, transparent 50%), 
        radial-gradient(at 100% 0%, rgba(17, 24, 39, 1) 0, transparent 50%);
      color: ${DESIGN_SYSTEM.palette.textPrimary};
      font-family: ${TYPOGRAPHY.sans.join(", ")};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.2);
    }
    
    /* Simple confirm box override for dark mode */
    :root {
      color-scheme: dark;
    }
    ::selection {
      background: ${DESIGN_SYSTEM.palette.accent};
      color: #000;
    }

    @keyframes float {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }

    @keyframes pulse-glow {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }
  `}</style>
);

// --- (12) FINAL EXPORT ---
// The main component wrapped in providers.
export default function LearnEaseApp() {
  // Renamed
  return (
    // Wrap the app in the new custom ToastProvider
    <ToastProvider>
      <GlobalStyles />
      <App />
      {/* Debug overlay: shows auth status and user for quick verification */}
      <DebugOverlay />
    </ToastProvider>
  );
}

const DebugOverlay = () => {
  const { status, user, logout } = useAuthStore();

  return (
    <div
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 9999,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          background: "rgba(10,11,12,0.9)",
          color: "#e6eef8",
          padding: "8px 12px",
          borderRadius: 8,
          fontSize: 13,
          minWidth: 220,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Debug</div>
        <div style={{ marginBottom: 6 }}>
          <strong>Status:</strong> {status}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>User:</strong>{" "}
          {user
            ? user.email || user.userId || JSON.stringify(user).slice(0, 20)
            : "none"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {status === "authed" ? (
            <button
              onClick={() => logout()}
              style={{
                background: "#111",
                color: "#fff",
                border: "1px solid #333",
                padding: "6px 8px",
                borderRadius: 6,
              }}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#111",
                color: "#fff",
                border: "1px solid #333",
                padding: "6px 8px",
                borderRadius: 6,
              }}
            >
              Reload
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
