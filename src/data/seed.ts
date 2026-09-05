import {
  User, Course, Assessment, Notification, Certificate,
  SubjectCompetency, LiveSession, LeaderboardEntry, Badge, DiscussionThread, AuditLog
} from "../types";
import { generateAnswerHash } from "../utils/quizSecurity";
import { sigmaWebDevLessons } from "./sigmaWebDevPlaylist";

export const initialBadges: Badge[] = [
  { id: "b1", name: "Quick Starter", description: "Enrolled and completed first orientation module within 24 hours.", icon: "⚡", category: "milestone" },
  { id: "b2", name: "Cloud Architect", description: "Scored 90%+ on Advanced Cloud Infrastructure assessment.", icon: "☁️", category: "mastery" },
  { id: "b3", name: "AI Innovator", description: "Completed enterprise Generative AI project & doubt challenge.", icon: "🤖", category: "mastery" },
  { id: "b4", name: "Top Scorer", description: "Achieved 100% on a subject-wise proctored assessment.", icon: "🏆", category: "achievement" },
  { id: "b5", name: "14-Day Streak", description: "Maintained active daily learning sessions for two straight weeks.", icon: "🔥", category: "milestone" },
  { id: "b6", name: "Peer Mentor", description: "Authored 5 helpful answers in course discussion forums.", icon: "🌟", category: "achievement" }
];

export const initialLeaderboard: LeaderboardEntry[] = [
  { id: "u-trainee-1", name: "Vikash Tiwari", department: "Engineering & Cloud", xp: 4250, streak: 14, coursesCompleted: 4, rank: 1, avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
  { id: "u-trainee-2", name: "Arjun Sharma", department: "Data & AI Systems", xp: 3890, streak: 11, coursesCompleted: 3, rank: 2, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  { id: "u-trainee-3", name: "Priya Patel", department: "Product Strategy", xp: 3420, streak: 9, coursesCompleted: 3, rank: 3, avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
  { id: "u-trainee-4", name: "Rohan Gupta", department: "Cybersecurity Ops", xp: 2950, streak: 7, coursesCompleted: 2, rank: 4, avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
  { id: "u-trainee-5", name: "Ananya Iyer", department: "Engineering & Cloud", xp: 2600, streak: 5, coursesCompleted: 2, rank: 5, avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80" }
];

export const initialUsers: User[] = [
  {
    id: "u-admin-official",
    name: "Capacity Connect Admin",
    email: "vkt052005@gmail.com",
    password: "SRNNv@2005",
    role: "admin",
    status: "active",
    createdAt: "2026-08-01T09:00:00Z"
  },
  {
    id: "u-trainer-official",
    name: "Raj Tiwari",
    email: "tiwariraj052005@gmail.com",
    password: "SRNNv@2005",
    role: "trainer",
    status: "active",
    createdAt: "2026-08-01T09:00:00Z",
    trainerProfile: {
      bio: "Senior Technical Trainer & Academic Lead at Capacity Connect.",
      expertise: ["Full-Stack Architecture", "Cloud Engineering", "DevOps"],
      competencies: ["Curriculum Design", "Hands-on Labs", "Mentorship"],
      phone: "+91 98765 11111",
      department: "Computer Science & Engineering",
      designation: "Senior Lead Instructor",
      experience: "8+ Years Industry Leadership",
      rating: 5,
      totalStudentsTaught: 124,
      verifiedCredentials: ["Institutional Accreditation"]
    }
  },
  {
    id: "u-trainee-official",
    name: "Madhav Kumar",
    email: "t2005madhav@gmail.com",
    password: "SRNNv@2005",
    role: "trainee",
    status: "active",
    createdAt: "2026-08-01T09:00:00Z",
    traineeProfile: {
      bio: "Dedicated Engineering scholar actively acquiring advanced competencies on Capacity Connect.",
      phone: "+91 98765 00000",
      department: "Computer Science & Engineering",
      designation: "Undergraduate Student",
      qualifications: ["B.Tech Computer Science (In Progress)"],
      experience: ["Student Scholar"],
      skills: ["Full-Stack Web Development", "Cloud Infrastructure", "System Design"],
      interests: ["Cloud Systems", "AI", "Microservices"],
      certificates: [],
      xpPoints: 1250,
      streakDays: 4,
      completedCoursesCount: 1,
      badges: []
    }
  }
];

export const initialCourses: Course[] = [
  {
    id: "c1",
    title: "Advanced Cloud Infrastructure & Microservices Architecture",
    description: "Master multi-region distributed cloud architectures, event-driven microservices with Kafka, Docker containerization, Kubernetes orchestration, and resilient fault-tolerant topologies.",
    trainerId: "u-trainer-1",
    trainerName: "Dr. Marcus Vance",
    category: "Technical",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    duration: "18 Hours • 6 Modules",
    level: "Advanced",
    status: "active",
    createdAt: "2026-01-05T10:00:00Z",
    rating: 4.94,
    totalRatings: 312,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    tags: ["Kubernetes", "Microservices", "Kafka", "Cloud Architecture", "Distributed Systems", "Docker"],
    syllabus: [
      "Module 1: Principles of Highly Resilient Cloud Systems",
      "Module 2: Event-Driven Microservices & CQRS Patterns",
      "Module 3: Production Kubernetes Cluster Deployment & Service Meshes",
      "Module 4: Zero-Trust Network Topologies & API Gateways",
      "Module 5: Observability, OpenTelemetry & Distributed Tracing",
      "Module 6: Disaster Recovery, Chaos Engineering & Failover Automation"
    ],
    prerequisites: ["Solid understanding of Linux & Networking", "Basic Docker & Container familiarity", "Experience with REST/gRPC APIs"],
    resources: [
      {
        id: "r1",
        courseId: "c1",
        title: "Comprehensive Architecture Master Slides & Diagrams",
        type: "presentation",
        url: "#slides",
        size: "14.2 MB",
        uploadedAt: "2026-01-10T11:00:00Z",
        uploadedBy: "Dr. Marcus Vance",
        version: "v2.4",
        summary: "This lecture deck breaks down cloud-native architecture into core pillars: decoupled event pipelines, stateless compute nodes, distributed consensus with Raft, and container scheduling algorithms.",
        keyTakeaways: [
          "Event-driven architecture decouples producers from consumers using durable message brokers like Kafka.",
          "Stateful workloads require dedicated persistent storage layers; app containers should remain strictly ephemeral.",
          "Service meshes provide mTLS encryption, rate limiting, and circuit breaking at Layer 7.",
          "Zero-trust security assumes the internal network is untrusted and verifies every token cryptographically."
        ],
        flashcards: [
          { id: "f1", front: "What is the CAP Theorem in Distributed Systems?", back: "It states that a distributed data store can only provide at most two of three guarantees: Consistency, Availability, and Partition Tolerance.", category: "Core Theory" },
          { id: "f2", front: "Why is mTLS essential in a Kubernetes Service Mesh?", back: "Mutual TLS ensures both client and server cryptographically authenticate each other and encrypt all intra-pod traffic automatically.", category: "Security" },
          { id: "f3", front: "What is the primary benefit of CQRS (Command Query Responsibility Segregation)?", back: "It separates read and update operations for a data store, optimizing query performance and mutation scaling independently.", category: "Patterns" },
          { id: "f4", front: "What mechanism allows Kafka to achieve massive horizontal throughput?", back: "Topic partitioning allows multiple consumers in a group to read from dedicated immutable log partitions concurrently.", category: "Messaging" }
        ],
        slides: [
          {
            slideNumber: 1,
            title: "Pillars of Modern Cloud Architecture",
            bullets: [
              "Transition from monolithic silos to composable microservices",
              "12-Factor App methodology for cloud-native readiness",
              "Decoupled state management and stateless application nodes",
              "High-availability multi-availability-zone (AZ) deployments"
            ],
            keyConcept: "Resilience is engineered through redundancy, fault isolation, and self-healing automation.",
            notes: "Explain the shift from scale-up monolithic servers to horizontally scalable microservices running across multiple availability zones."
          },
          {
            slideNumber: 2,
            title: "Event-Driven Topologies & Kafka Messaging",
            bullets: [
              "Synchronous HTTP/gRPC vs. Asynchronous Event Streams",
              "Kafka partition mechanics, consumer groups, and offset management",
              "Idempotent message consumers and avoiding duplicate processing",
              "Outbox pattern for atomic database-and-message state transitions"
            ],
            keyConcept: "Asynchronous messaging ensures system uptime even when downstream services experience temporary latency spikes.",
            notes: "Emphasize how the transactional outbox pattern guarantees that database writes and event publishing succeed together atomically."
          },
          {
            slideNumber: 3,
            title: "Kubernetes Cluster Scheduling & Service Mesh",
            bullets: [
              "Kube-scheduler decision trees: affinities, taints, and tolerations",
              "Istio / Envoy sidecar proxies for Layer 7 traffic routing",
              "Automated mTLS encryption for intra-cluster communication",
              "Canary releases, blue/green rollouts, and traffic mirroring"
            ],
            keyConcept: "Service meshes abstract networking, security, and observability away from the application runtime code.",
            notes: "Walk through how Envoy proxies intercept inbound and outbound TCP traffic to enforce mutual TLS certificates."
          },
          {
            slideNumber: 4,
            title: "Distributed Tracing & Full-Stack Observability",
            bullets: [
              "The three observability pillars: Metrics, Logs, and Traces",
              "OpenTelemetry standard for unified telemetry collection",
              "W3C Trace Context propagation across microservice hops",
              "SRE Golden Signals: Latency, Traffic, Errors, and Saturation"
            ],
            keyConcept: "Trace context headers enable operators to trace a single user click across 30+ microservices in real time.",
            notes: "Show an example of a distributed trace spanning the API gateway, auth service, database, and background workers."
          },
          {
            slideNumber: 5,
            title: "Zero-Trust Security & API Gateway Hardening",
            bullets: [
              "Never Trust, Always Verify: Perimeter vs. Identity-Centric Security",
              "Cryptographic JWT verification and OAuth2 token introspection",
              "Distributed rate limiting using Redis sliding window counters",
              "Web Application Firewall (WAF) rule sets and bot mitigation"
            ],
            keyConcept: "Every internal service must validate access tokens and enforce least-privilege role permissions.",
            notes: "Review how rate limiting at the API gateway shields backend microservices from denial of service attacks."
          },
          {
            slideNumber: 6,
            title: "Chaos Engineering & Disaster Recovery Runbooks",
            bullets: [
              "Simulating node failures and network partitions in staging",
              "Automated database failovers with sub-second RPO/RTO",
              "Circuit breaker patterns: Closed, Open, and Half-Open states",
              "Game day drills for SRE on-call engineers"
            ],
            keyConcept: "Proactively inject failures into systems to verify that automatic failover safeguards behave as expected.",
            notes: "Summarize the key exam takeaways: failure is inevitable; resilience is intentional."
          }
        ],
        transcripts: [
          { timestamp: "00:00", seconds: 0, speaker: "Dr. Marcus Vance", text: "Welcome everyone to Advanced Cloud Infrastructure and Microservices Architecture. Today we explore enterprise resilience." },
          { timestamp: "02:15", seconds: 135, speaker: "Dr. Marcus Vance", text: "When we architect distributed systems, our first assumption must always be that any network hop or compute node can fail at any time." },
          { timestamp: "05:40", seconds: 340, speaker: "Dr. Marcus Vance", text: "By adopting an event-driven model with Apache Kafka, we convert fragile synchronous RPC chains into durable, buffered event streams." },
          { timestamp: "09:20", seconds: 560, speaker: "Dr. Marcus Vance", text: "In Kubernetes, the service mesh handles mTLS encryption automatically between pods, ensuring strict zero-trust compliance." },
          { timestamp: "14:10", seconds: 850, speaker: "Dr. Marcus Vance", text: "Let us now examine the transactional outbox pattern to prevent data loss between our Postgres database and event bus." }
        ]
      },
      {
        id: "r2",
        courseId: "c1",
        title: "Production Kubernetes Deployment Playbook (PDF)",
        type: "pdf",
        url: "#pdf-guide",
        size: "8.6 MB",
        uploadedAt: "2026-01-12T14:00:00Z",
        uploadedBy: "Dr. Marcus Vance",
        version: "v1.8",
        summary: "Step-by-step production runbook containing Helm charts, network policies, resource quotas, and ingress configs."
      }
    ]
  },
  {
    id: "c2",
    title: "Generative AI & LLM Systems for Enterprise Applications",
    description: "Deep dive into building enterprise-grade RAG (Retrieval-Augmented Generation) systems, vector embeddings, fine-tuning, multi-agent workflows, and AI safety guardrails.",
    trainerId: "u-trainer-1",
    trainerName: "Dr. Marcus Vance",
    category: "AI & Data",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
    duration: "16 Hours • 5 Modules",
    level: "Advanced",
    status: "active",
    createdAt: "2026-01-15T09:00:00Z",
    rating: 4.96,
    totalRatings: 280,
    tags: ["Generative AI", "RAG", "LLMs", "Vector DBs", "LangChain", "Agentic Systems"],
    syllabus: [
      "Module 1: Transformer Foundations & Tokenization",
      "Module 2: High-Fidelity Vector Embeddings & Hybrid Search",
      "Module 3: RAG Architecture & Context Window Optimization",
      "Module 4: Multi-Agent Systems & Tool Orchestration",
      "Module 5: LLM Evaluation, Hallucination Prevention & Guardrails"
    ],
    prerequisites: ["Python proficiency", "Familiarity with REST APIs", "Basic Linear Algebra / Vector concepts"],
    resources: [
      {
        id: "r201",
        courseId: "c2",
        title: "Enterprise RAG & Agentic Architecture Guide",
        type: "presentation",
        url: "#slides-ai",
        size: "18.5 MB",
        uploadedAt: "2026-01-20T10:00:00Z",
        uploadedBy: "Dr. Marcus Vance",
        version: "v3.1",
        summary: "Comprehensive guide to indexing unstructured enterprise documents, optimizing semantic search, and preventing hallucination.",
        keyTakeaways: [
          "Chunking strategy directly impacts vector retrieval accuracy; semantic chunking beats fixed character splitting.",
          "Hybrid search combines dense vector similarity with sparse BM25 keyword matching for optimal recall.",
          "Agentic architectures enable LLMs to iteratively query tools, verify intermediate outputs, and self-correct."
        ],
        flashcards: [
          { id: "fa1", front: "What is the difference between Dense Vector Search and BM25?", back: "Dense search maps concepts into high-dimensional semantic space, while BM25 counts exact term frequencies and inverse document frequencies.", category: "Search" },
          { id: "fa2", front: "How does ReAct prompting function in AI Agents?", back: "Reasoning and Acting: The model alternates between generating thought steps and executing tool actions to solve complex goals.", category: "Agents" }
        ],
        slides: [
          {
            slideNumber: 1,
            title: "Enterprise RAG Pipeline Overview",
            bullets: [
              "Ingestion: Document parsing, cleaning, and metadata enrichment",
              "Chunking: Parent-child and recursive semantic chunking",
              "Embedding: Dense vectors generated via multimodal models",
              "Vector Database: HNSW indexing with metadata filtering"
            ],
            keyConcept: "High precision retrieval is the single most critical factor in eliminating hallucinations in production LLM systems."
          },
          {
            slideNumber: 2,
            title: "Multi-Agent Collaboration Architecture",
            bullets: [
              "Planner-Worker-Critic agent orchestration topologies",
              "Structured output schema enforcement with JSON Schema",
              "Human-in-the-loop verification gates for sensitive actions",
              "Long-term memory persistence with vector graphs"
            ],
            keyConcept: "Specialized cooperating subagents outperform monolithic single-prompt architectures on complex workflows."
          }
        ]
      }
    ]
  },
  {
    id: "c3",
    title: "Strategic Leadership, Agile Transformation & Team Coaching",
    description: "Develop executive decision-making, high-velocity agile organizational structures, psychological safety, and coaching frameworks for cross-functional engineering teams.",
    trainerId: "u-trainer-2",
    trainerName: "Sarah Chen, MBA",
    category: "Leadership",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    duration: "14 Hours • 4 Modules",
    level: "Intermediate",
    status: "active",
    createdAt: "2026-01-18T10:00:00Z",
    rating: 4.88,
    totalRatings: 195,
    tags: ["Leadership", "Agile", "Executive Coaching", "Team Building", "Strategy"],
    syllabus: [
      "Module 1: Adaptive Leadership in Fast-Changing Markets",
      "Module 2: Building Psychological Safety & High-Trust Teams",
      "Module 3: Scaling Agile Frameworks & Value Stream Mapping",
      "Module 4: Managing Stakeholder Alignment & Executive Influence"
    ],
    prerequisites: ["Experience working in project teams or team lead roles"],
    resources: [
      {
        id: "r301",
        courseId: "c3",
        title: "Executive Leadership Toolkit & Frameworks",
        type: "document",
        url: "#doc-leadership",
        size: "6.2 MB",
        uploadedAt: "2026-01-22T12:00:00Z",
        uploadedBy: "Sarah Chen, MBA",
        version: "v1.2",
        summary: "Practical frameworks for running 1-on-1 coaching sessions, conducting blameless postmortems, and setting outcome-focused OKRs."
      }
    ]
  },
  {
    id: "c4",
    title: "Cybersecurity Governance, Zero-Trust Architecture & ISO 27001",
    description: "Master enterprise defense-in-depth, threat intelligence, identity security, cryptographically verifiable access controls, and international compliance audits.",
    trainerId: "u-trainer-3",
    trainerName: "Prof. Rajesh Kumar",
    category: "Compliance",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    duration: "20 Hours • 6 Modules",
    level: "Advanced",
    status: "active",
    createdAt: "2026-01-20T14:00:00Z",
    rating: 4.97,
    totalRatings: 240,
    tags: ["Cybersecurity", "Zero-Trust", "ISO 27001", "SOC2", "Cryptography", "Compliance"],
    syllabus: [
      "Module 1: Threat Landscape & Adversary Tactics (MITRE ATT&CK)",
      "Module 2: Zero-Trust Identity, RBAC & Conditional Access",
      "Module 3: Cryptographic Protocols, TLS 1.3 & Key Management",
      "Module 4: SOC2 Type II & ISO/IEC 27001 Audit Readiness",
      "Module 5: DevSecOps: Automated SAST, DAST & Container Scanning",
      "Module 6: Incident Response, Forensics & Breach Containment"
    ],
    prerequisites: ["Understanding of networking, TCP/IP, and cloud computing"],
    resources: [
      {
        id: "r401",
        courseId: "c4",
        title: "Zero-Trust Reference Architecture & Security Checklist",
        type: "presentation",
        url: "#slides-sec",
        size: "16.8 MB",
        uploadedAt: "2026-01-25T11:00:00Z",
        uploadedBy: "Prof. Rajesh Kumar",
        version: "v2.0",
        summary: "In-depth security architecture breakdown covering identity validation, micro-segmentation, and continuous compliance monitoring."
      }
    ]
  },
  {
    id: "c5",
    title: "Executive Communication & High-Impact Presentation Skills",
    description: "Transform your technical expertise into persuasive executive narratives, confident public speaking, and impactful board-level presentations.",
    trainerId: "u-trainer-2",
    trainerName: "Sarah Chen, MBA",
    category: "Communication",
    thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
    duration: "10 Hours • 3 Modules",
    level: "Beginner",
    status: "active",
    createdAt: "2026-02-01T10:00:00Z",
    rating: 4.85,
    totalRatings: 142,
    tags: ["Communication", "Public Speaking", "Executive Presence", "Storytelling"],
    syllabus: [
      "Module 1: The Pyramid Principle in Executive Briefings",
      "Module 2: Visual Storytelling & Clean Slide Design",
      "Module 3: Handling Tough Q&A and Boardroom Interrogations"
    ],
    resources: []
  },
  {
    id: "c6",
    title: "Complete Sigma Web Development Course (HTML, CSS, JS, Node, React)",
    description: "The complete hands-on roadmap to becoming a full stack web developer: learn semantic HTML5, modern CSS3 & Flexbox, vanilla JavaScript ES6+, DOM manipulation, Node.js runtime, Express backend, MongoDB database, and React & Next.js.",
    trainerId: "u-trainer-official",
    trainerName: "CodeWithHarry (Haris Khan)",
    category: "Technical",
    thumbnail: "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&auto=format&fit=crop&q=80",
    duration: "85+ Hours • 139 Lessons",
    level: "Beginner",
    status: "active",
    createdAt: "2026-02-15T10:00:00Z",
    rating: 4.98,
    totalRatings: 1840,
    videoUrl: "https://youtube.com/playlist?list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w",
    lessons: sigmaWebDevLessons,
    tags: ["Web Development", "HTML5", "CSS3", "JavaScript", "React", "Next.js", "Node.js", "Express", "MongoDB", "Tailwind"],
    syllabus: [
      "Module 1: Internet Fundamentals, HTTP Protocol & Semantic HTML5",
      "Module 2: Modern CSS3, Flexbox, Grid & Responsive Layouts",
      "Module 3: JavaScript Core Fundamentals, Variables, Loops & Functions",
      "Module 4: DOM Manipulation, Event Listeners & Interactive UI Projects",
      "Module 5: Advanced JavaScript: Promises, Async/Await & Fetch API",
      "Module 6: Backend Development with Node.js & Express.js REST APIs",
      "Module 7: Database Design, MongoDB, Mongoose & CRUD Operations",
      "Module 8: Modern Frontend Development with React & Next.js App Router"
    ],
    prerequisites: ["No prior programming experience required", "A computer with Chrome and VS Code installed"],
    resources: [
      {
        id: "r601",
        courseId: "c6",
        title: "Full Stack Web Development Master Notes & Cheatsheet",
        type: "presentation",
        url: "#slides",
        size: "18.5 MB",
        uploadedAt: "2026-02-15T10:00:00Z",
        uploadedBy: "CodeWithHarry (Haris Khan)",
        version: "v3.0",
        summary: "Comprehensive developer handbook covering HTML tags, CSS Flexbox cheatsheet, JavaScript DOM manipulation, Express routes, and React component lifecycles.",
        keyTakeaways: [
          "HTML provides the skeleton, CSS creates the visual layout, and JavaScript adds dynamic interactivity.",
          "Modern responsive design relies on CSS Flexbox and Grid combined with media queries.",
          "JavaScript uses single-threaded non-blocking event loops with Promises and Async/Await for asynchronous actions.",
          "Node.js and Express allow developers to build scalable RESTful backend services using JavaScript.",
          "React utilizes virtual DOM reconciliation and reusable component hooks for fast UI rendering."
        ],
        flashcards: [
          { id: "f601", front: "What is the Box Model in CSS?", back: "The CSS box model consists of content, padding, border, and margin around every HTML element.", category: "CSS" },
          { id: "f602", front: "What is Event Bubbling in the DOM?", back: "Event bubbling is when an event triggers on the innermost target element and then propagates upwards through its parent elements in the DOM tree.", category: "JavaScript" },
          { id: "f603", front: "What is the difference between synchronous and asynchronous code?", back: "Synchronous code executes sequentially and blocks execution; asynchronous code executes in the background and resolves via callbacks, Promises, or async/await.", category: "JavaScript" },
          { id: "f604", front: "What is Middleware in Express.js?", back: "Functions that have access to the request, response, and the next() function in the application's request-response cycle.", category: "Backend" },
          { id: "f605", front: "What is JSX in React?", back: "JSX is a syntax extension for JavaScript that allows you to write HTML-like markup directly inside JavaScript code.", category: "React" }
        ],
        slides: [
          {
            slideNumber: 1,
            title: "Roadmap to Full Stack Engineering",
            bullets: [
              "Frontend: Semantic HTML5, Modern CSS3, Vanilla JS",
              "Advanced Frontend: React.js, Tailwind CSS, Next.js",
              "Backend: Node.js runtime, Express framework, RESTful APIs",
              "Database: MongoDB, Mongoose ODM, NoSQL indexing"
            ],
            keyConcept: "Mastering fundamentals first ensures long-term adaptability as web frameworks evolve."
          },
          {
            slideNumber: 2,
            title: "DOM & Event-Driven Interactivity",
            bullets: [
              "Selecting elements with document.querySelector",
              "Attaching event listeners (click, change, submit)",
              "Manipulating classes and styles dynamically",
              "Preventing default form reloads with e.preventDefault()"
            ],
            keyConcept: "Interactive web pages respond to user actions by dynamically modifying the Document Object Model."
          },
          {
            slideNumber: 3,
            title: "Modern Asynchronous JavaScript",
            bullets: [
              "Call stack, Web APIs, and the Event Loop",
              "Promises (Pending, Fulfilled, Rejected)",
              "Clean asynchronous syntax with async/await",
              "Fetching live data from REST APIs using fetch()"
            ],
            keyConcept: "Async programming enables web apps to fetch remote data without freezing the browser interface."
          }
        ]
      }
    ]
  }
];

export const initialAssessments: Assessment[] = [
  {
    id: "a1",
    courseId: "c1",
    courseTitle: "Advanced Cloud Infrastructure & Microservices Architecture",
    title: "Cloud Architecture & Microservices Certification Exam",
    description: "Subject-wise proctored assessment evaluating your understanding of distributed consensus, Kafka messaging, Kubernetes scheduling, and zero-trust security.",
    deadline: "2026-10-30T23:59:59Z",
    durationMinutes: 15,
    passingScore: 70,
    createdBy: "Dr. Marcus Vance",
    createdAt: "2026-01-10T10:00:00Z",
    questions: [
      {
        id: "q1",
        text: "In distributed systems, which theorem posits that a system cannot simultaneously guarantee Consistency, Availability, and Partition Tolerance?",
        options: [
          { id: "o1", text: "Moore Theorem" },
          { id: "o2", text: "CAP Theorem" },
          { id: "o3", text: "Amadahl Law" },
          { id: "o4", text: "Conway Law" }
        ],
        correctIndex: 1,
        points: 20,
        explanation: "The CAP Theorem (Brewer Conjecture) states that in the event of a network partition, a distributed system must choose between Consistency and Availability.",
        topic: "Distributed Theory"
      },
      {
        id: "q2",
        text: "What is the primary role of a Service Mesh (e.g., Istio, Envoy) in a production Kubernetes cluster?",
        options: [
          { id: "o1", text: "Compiling container source code into binary executables" },
          { id: "o2", text: "Handling layer 7 traffic routing, automated mTLS encryption, and distributed telemetry" },
          { id: "o3", text: "Replacing the Linux kernel with a real-time hypervisor" },
          { id: "o4", text: "Storing database disk blocks on tape drives" }
        ],
        correctIndex: 1,
        points: 20,
        explanation: "A service mesh uses sidecar proxies to transparently provide mutual TLS, load balancing, circuit breaking, and telemetry across microservices without modifying application code.",
        topic: "Kubernetes & Mesh"
      },
      {
        id: "q3",
        text: "How does Apache Kafka ensure horizontal scalability and concurrent consumer processing for high-volume topics?",
        options: [
          { id: "o1", text: "By dividing topics into partitions that can be consumed concurrently by members of a consumer group" },
          { id: "o2", text: "By encrypting all records using a single central CPU thread" },
          { id: "o3", text: "By deleting messages immediately after the first read" },
          { id: "o4", text: "By routing all queries to a single relational database table" }
        ],
        correctIndex: 0,
        points: 20,
        explanation: "Kafka topics are split into ordered immutable partitions, allowing multiple consumers within a group to process partitions in parallel.",
        topic: "Event-Driven Topologies"
      },
      {
        id: "q4",
        text: "Which architectural pattern resolves data inconsistency between a database transaction and publishing an event to a message broker?",
        options: [
          { id: "o1", text: "Monolithic Singleton Pattern" },
          { id: "o2", text: "Transactional Outbox Pattern" },
          { id: "o3", text: "Active Record Callback Pattern" },
          { id: "o4", text: "Blind Fire-and-Forget Pattern" }
        ],
        correctIndex: 1,
        points: 20,
        explanation: "The Transactional Outbox pattern writes the outgoing event into an outbox table in the same local database transaction as the business entity, ensuring atomic consistency before a relay sends it to the message broker.",
        topic: "Resilience Patterns"
      },
      {
        id: "q5",
        text: "What is the key principle of Zero-Trust Network Architecture?",
        options: [
          { id: "o1", text: "Trust all devices inside the corporate intranet subnet" },
          { id: "o2", text: "Never trust, always verify every request identity and cryptographically enforce least privilege" },
          { id: "o3", text: "Disable all passwords and rely solely on IP address whitelisting" },
          { id: "o4", text: "Allow unencrypted HTTP traffic within local VPC subnets" }
        ],
        correctIndex: 1,
        points: 20,
        explanation: "Zero-Trust assumes the network is hostile and requires continuous authentication, authorization, and cryptographic validation for every request.",
        topic: "Zero-Trust Security"
      }
    ]
  },
  {
    id: "a2",
    courseId: "c2",
    courseTitle: "Generative AI & LLM Systems for Enterprise Applications",
    title: "Enterprise GenAI & RAG Competency Assessment",
    description: "Evaluates vector search algorithms, retrieval quality, prompt engineering, and agentic workflows.",
    deadline: "2026-11-15T23:59:59Z",
    durationMinutes: 15,
    passingScore: 70,
    createdBy: "Dr. Marcus Vance",
    createdAt: "2026-01-20T10:00:00Z",
    questions: [
      {
        id: "q201",
        text: "What is the primary objective of Retrieval-Augmented Generation (RAG)?",
        options: [
          { id: "o1", text: "Training a foundational model from scratch on GPU clusters" },
          { id: "o2", text: "Grounding LLM responses in dynamically retrieved authoritative enterprise documents to reduce hallucination" },
          { id: "o3", text: "Compressing images to reduce web page latency" },
          { id: "o4", text: "Encrypting hard drives using quantum key distribution" }
        ],
        correctIndex: 1,
        points: 25,
        explanation: "RAG retrieves relevant domain documents from a vector or hybrid database and injects them into the LLM context prompt to ensure accurate, up-to-date answers.",
        topic: "RAG Architecture"
      },
      {
        id: "q202",
        text: "Why is Hybrid Search (Dense Vector + Sparse BM25) preferred in production RAG systems?",
        options: [
          { id: "o1", text: "It combines semantic conceptual similarity with exact keyword/part-number matching" },
          { id: "o2", text: "It reduces memory usage to zero" },
          { id: "o3", text: "It eliminates the need for vector embeddings entirely" },
          { id: "o4", text: "It automatically translates code into assembly" }
        ],
        correctIndex: 0,
        points: 25,
        explanation: "Dense vectors capture high-level conceptual meaning, while BM25 accurately matches exact jargon, acronyms, and product IDs.",
        topic: "Information Retrieval"
      },
      {
        id: "q203",
        text: "In Agentic LLM systems, what does the ReAct framework stand for?",
        options: [
          { id: "o1", text: "Reactive Action Cache" },
          { id: "o2", text: "Reasoning and Acting through interleaved thought generation and tool invocation" },
          { id: "o3", text: "Real-time Asynchronous Compilation" },
          { id: "o4", text: "Recursive Authentication Token" }
        ],
        correctIndex: 1,
        points: 25,
        explanation: "ReAct prompts the model to generate a reasoning trace (Thought), execute an action/tool (Act), and observe the result (Observation) iteratively.",
        topic: "AI Agents"
      },
      {
        id: "q204",
        text: "Which metric evaluates whether a RAG response contains claims not supported by the retrieved context?",
        options: [
          { id: "o1", text: "Faithfulness / Hallucination Rate" },
          { id: "o2", text: "Network Bandwidth" },
          { id: "o3", text: "Clock Frequency" },
          { id: "o4", text: "Disk Sector Size" }
        ],
        correctIndex: 0,
        points: 25,
        explanation: "Faithfulness measures what percentage of statements made in the generated answer can be mathematically grounded in the retrieved source context.",
        topic: "AI Evaluation"
      }
    ]
  },
  {
    id: "a-webdev-sigma",
    courseId: "c6",
    courseTitle: "Complete Sigma Web Development Course (HTML, CSS, JS, Node, React)",
    title: "Full Stack Web Development Certification Assessment",
    description: "Proctored competency evaluation covering HTML5 semantics, CSS Flexbox/Grid, JavaScript asynchronous logic, REST APIs, and React component state.",
    deadline: "2026-12-31T23:59:59Z",
    durationMinutes: 20,
    passingScore: 70,
    createdBy: "CodeWithHarry (Haris Khan)",
    createdAt: "2026-02-15T12:00:00Z",
    questions: [
      {
        id: "q-wd-1",
        text: "Which HTML5 semantic element should be used to wrap major navigation links on a website?",
        options: [
          { id: "o1", text: "<menu-bar>" },
          { id: "o2", text: "<nav>" },
          { id: "o3", text: "<navigate>" },
          { id: "o4", text: "<links>" }
        ],
        correctIndex: 1,
        answerHash: generateAnswerHash("q-wd-1", 1),
        points: 20,
        explanation: "The <nav> element represents a section of a page whose purpose is to provide navigation links.",
        topic: "Semantic HTML5"
      },
      {
        id: "q-wd-2",
        text: "In CSS Flexbox, which property aligns flex items along the cross axis (perpendicular to the main axis)?",
        options: [
          { id: "o1", text: "justify-content" },
          { id: "o2", text: "align-items" },
          { id: "o3", text: "flex-direction" },
          { id: "o4", text: "space-between" }
        ],
        correctIndex: 1,
        answerHash: generateAnswerHash("q-wd-2", 1),
        points: 20,
        explanation: "align-items specifies the default alignment for items inside the flex container along the cross axis.",
        topic: "CSS Flexbox"
      },
      {
        id: "q-wd-3",
        text: "In modern JavaScript (ES6+), what is the primary difference between 'let' and 'var'?",
        options: [
          { id: "o1", text: "'let' is block-scoped, while 'var' is function-scoped" },
          { id: "o2", text: "'var' cannot be reassigned once declared" },
          { id: "o3", text: "'let' variables are globally scoped across all scripts" },
          { id: "o4", text: "'var' causes synchronous thread locking" }
        ],
        correctIndex: 0,
        answerHash: generateAnswerHash("q-wd-3", 0),
        points: 20,
        explanation: "let allows you to declare variables that are limited to the scope of a block statement, whereas var defines a variable globally or locally to an entire function.",
        topic: "JavaScript ES6+"
      },
      {
        id: "q-wd-4",
        text: "In Node.js Express applications, what is the role of middleware functions?",
        options: [
          { id: "o1", text: "They compile JavaScript directly into C++ bytecode" },
          { id: "o2", text: "They have access to request (req) and response (res) objects to execute code, modify data, or terminate the cycle" },
          { id: "o3", text: "They format the CSS styling before rendering to browser" },
          { id: "o4", text: "They automatically restart the computer on errors" }
        ],
        correctIndex: 1,
        answerHash: generateAnswerHash("q-wd-4", 1),
        points: 20,
        explanation: "Middleware functions are functions that have access to the request object, the response object, and the next middleware function in the application's request-response cycle.",
        topic: "Backend & Express"
      },
      {
        id: "q-wd-5",
        text: "In React, which hook is used to perform side effects such as data fetching, subscriptions, or manual DOM manipulations?",
        options: [
          { id: "o1", text: "useState" },
          { id: "o2", text: "useContext" },
          { id: "o3", text: "useEffect" },
          { id: "o4", text: "useReducer" }
        ],
        correctIndex: 2,
        answerHash: generateAnswerHash("q-wd-5", 2),
        points: 20,
        explanation: "useEffect lets you synchronize a component with an external system and execute side effects after rendering.",
        topic: "React Architecture"
      }
    ]
  }
];

export const initialLiveSessions: LiveSession[] = [];

export const initialCompetencyMatrix: SubjectCompetency[] = [
  {
    subject: "Distributed Cloud Systems & Kubernetes",
    category: "Technical",
    organizationalDemandScore: 95,
    internalCapacityScore: 82,
    gapScore: 13,
    priority: "High",
    suitableTrainers: [
      { id: "u-trainer-1", name: "Dr. Marcus Vance", rating: 4.94, matchPercentage: 98, experienceYears: 16, competencies: ["Kubernetes", "Microservices", "Kafka", "Cloud Architecture"] }
    ]
  },
  {
    subject: "Enterprise Generative AI & Vector Architectures",
    category: "AI & Data",
    organizationalDemandScore: 98,
    internalCapacityScore: 68,
    gapScore: 30,
    priority: "Critical",
    suitableTrainers: [
      { id: "u-trainer-1", name: "Dr. Marcus Vance", rating: 4.96, matchPercentage: 94, experienceYears: 16, competencies: ["RAG Systems", "Vector DBs", "LLM Evaluation", "Agentic Frameworks"] }
    ]
  },
  {
    subject: "Zero-Trust Cybersecurity & Compliance (ISO 27001)",
    category: "Compliance",
    organizationalDemandScore: 90,
    internalCapacityScore: 88,
    gapScore: 2,
    priority: "Medium",
    suitableTrainers: [
      { id: "u-trainer-3", name: "Prof. Rajesh Kumar", rating: 4.96, matchPercentage: 99, experienceYears: 18, competencies: ["Zero-Trust", "ISO 27001", "Threat Modeling", "Cryptography"] }
    ]
  },
  {
    subject: "Agile Leadership & Cross-Functional Team Coaching",
    category: "Leadership",
    organizationalDemandScore: 85,
    internalCapacityScore: 80,
    gapScore: 5,
    priority: "Medium",
    suitableTrainers: [
      { id: "u-trainer-2", name: "Sarah Chen, MBA", rating: 4.88, matchPercentage: 96, experienceYears: 14, competencies: ["Executive Coaching", "Agile Transformation", "Conflict Resolution"] }
    ]
  },
  {
    subject: "Full-Stack React & Web Performance Optimization",
    category: "Technical",
    organizationalDemandScore: 78,
    internalCapacityScore: 85,
    gapScore: -7,
    priority: "Low",
    suitableTrainers: [
      { id: "u-trainer-1", name: "Dr. Marcus Vance", rating: 4.92, matchPercentage: 92, experienceYears: 16, competencies: ["React", "TypeScript", "Core Web Vitals"] }
    ]
  }
];

export const initialDiscussions: DiscussionThread[] = [
  {
    id: "disc-01",
    courseId: "c1",
    title: "How to handle out-of-order events when Kafka partitions rebalance?",
    content: "When our consumer group scales up and partitions are reassigned, what is the best practice to avoid processing stale messages or race conditions?",
    authorId: "u-trainee-1",
    authorName: "Vikash Tiwari",
    authorRole: "trainee",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-02-18T11:20:00Z",
    upvotes: 14,
    upvotedBy: ["u-trainee-2", "u-trainee-3"],
    replies: [
      {
        id: "rep-01",
        authorId: "u-trainer-1",
        authorName: "Dr. Marcus Vance",
        authorRole: "trainer",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        content: "Great question Vikash! The standard solution is combining Cooperative Sticky Partition Assignors with an idempotent consumer store keyed by entity ID and sequence version. That way, any out-of-order replay is discarded safely.",
        createdAt: "2026-02-18T13:45:00Z",
        isTrainerVerified: true
      },
      {
        id: "rep-02",
        authorId: "u-trainee-2",
        authorName: "Arjun Sharma",
        authorRole: "trainee",
        content: "We implemented version checking with Postgres optimistic locking and it solved our duplicate issue completely!",
        createdAt: "2026-02-18T15:10:00Z"
      }
    ]
  },
  {
    id: "disc-02",
    courseId: "c1",
    title: "Recommended mTLS cipher suites for low-latency Envoy sidecars?",
    content: "We are profiling inter-pod latency in Istio. Are there particular TLS 1.3 ciphers that offer the best performance tradeoffs on ARM64 nodes?",
    authorId: "u-trainee-2",
    authorName: "Arjun Sharma",
    authorRole: "trainee",
    createdAt: "2026-02-22T09:15:00Z",
    upvotes: 8,
    upvotedBy: ["u-trainee-1"],
    replies: [
      {
        id: "rep-03",
        authorId: "u-trainer-1",
        authorName: "Dr. Marcus Vance",
        authorRole: "trainer",
        content: "On ARM64 Graviton instances, TLS_AES_128_GCM_SHA256 leverages hardware cryptographic instructions and delivers sub-millisecond overhead.",
        createdAt: "2026-02-22T10:30:00Z",
        isTrainerVerified: true
      }
    ]
  }
];

export const initialNotifications: Notification[] = [
  {
    id: "n1",
    type: "announcement",
    title: "Annual Capacity Building Calendar & Exam Schedule 2026-2027",
    content: "The Central Capacity Building Framework has published the new annual schedule for technical specializations, proctored exams, and faculty masterclasses.",
    createdAt: "2026-09-01T08:00:00Z",
    pinned: true,
    author: "Capacity Connect Admin"
  },
  {
    id: "n2",
    type: "achievement",
    title: "Organizational Milestone: 10,000+ Certified Professionals",
    content: "Our organization has officially crossed 10,000 completed and cryptographically verified technical and leadership competencies across all engineering teams.",
    createdAt: "2026-08-28T14:30:00Z",
    pinned: true,
    author: "Executive Governance Board"
  },
  {
    id: "n3",
    type: "new_content",
    title: "New Course Available: Enterprise Cloud Architecture & Distributed Systems",
    content: "A comprehensive 6-module curriculum is now open for enrollment featuring interactive transcripts, slide deck notes, and proctored MCQ certification.",
    createdAt: "2026-08-25T11:15:00Z",
    pinned: false,
    author: "Dr. Marcus Vance"
  },
  {
    id: "n4",
    type: "alert",
    title: "Scheduled System Maintenance: Saturday 02:00 UTC",
    content: "Routine database and security ledger backup snapshot. Active sessions and test submissions will remain uninterrupted.",
    createdAt: "2026-08-20T09:00:00Z",
    pinned: false,
    author: "Infrastructure Security Team"
  }
];

export const initialAuditLogs: AuditLog[] = [];

export function initializeStorage() {
  // Check and purge legacy notifications if they contain old meta text
  try {
    const existingNotifs = localStorage.getItem("cc_notifications");
    if (existingNotifs && (existingNotifs.includes("Apple Glass") || existingNotifs.includes("2.0") || existingNotifs.includes("📢") || existingNotifs.includes("🏆"))) {
      localStorage.setItem("cc_notifications", JSON.stringify(initialNotifications));
    }

    // Purge fake mock audit logs if present in localStorage
    const existingLogs = localStorage.getItem("cc_audit_logs");
    if (existingLogs && (existingLogs.includes("log-101") || existingLogs.includes("trainee@capacityconnect.org") || existingLogs.includes("INSTANT_QR_AUTH_SUCCESS"))) {
      localStorage.setItem("cc_audit_logs", JSON.stringify([]));
    }

    // Purge demo credentials from localStorage (admin@capacityconnect.org, trainer@capacityconnect.org, trainee@capacityconnect.org)
    const rawUsers = localStorage.getItem("cc_users");
    if (rawUsers) {
      const parsedUsers = JSON.parse(rawUsers);
      const filteredUsers = parsedUsers.filter((u: any) =>
        u.email !== "admin@capacityconnect.org" &&
        u.email !== "trainer@capacityconnect.org" &&
        u.email !== "trainee@capacityconnect.org"
      );
      localStorage.setItem("cc_users", JSON.stringify(filteredUsers));
    }

    const rawAuth = localStorage.getItem("cc_auth");
    if (rawAuth) {
      const parsedAuth = JSON.parse(rawAuth);
      if (
        parsedAuth?.user?.email === "admin@capacityconnect.org" ||
        parsedAuth?.user?.email === "trainer@capacityconnect.org" ||
        parsedAuth?.user?.email === "trainee@capacityconnect.org"
      ) {
        localStorage.removeItem("cc_auth");
      }
    }
  } catch (e) {}

  if (!localStorage.getItem("cc_users")) {
    localStorage.setItem("cc_users", JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem("cc_courses")) {
    localStorage.setItem("cc_courses", JSON.stringify(initialCourses));
  }
  if (!localStorage.getItem("cc_assessments")) {
    localStorage.setItem("cc_assessments", JSON.stringify(initialAssessments));
  }
  if (!localStorage.getItem("cc_notifications")) {
    localStorage.setItem("cc_notifications", JSON.stringify(initialNotifications));
  }
  if (!localStorage.getItem("cc_live_sessions")) {
    localStorage.setItem("cc_live_sessions", JSON.stringify(initialLiveSessions));
  }
  if (!localStorage.getItem("cc_competencies")) {
    localStorage.setItem("cc_competencies", JSON.stringify(initialCompetencyMatrix));
  }
  if (!localStorage.getItem("cc_discussions")) {
    localStorage.setItem("cc_discussions", JSON.stringify(initialDiscussions));
  }
  if (!localStorage.getItem("cc_leaderboard")) {
    localStorage.setItem("cc_leaderboard", JSON.stringify(initialLeaderboard));
  }
  if (!localStorage.getItem("cc_audit_logs")) {
    localStorage.setItem("cc_audit_logs", JSON.stringify([]));
  }
}


export const STORAGE_KEYS = {
  AUTH: "cc_auth",
  USERS: "cc_users",
  COURSES: "cc_courses",
  ENROLLMENTS: "cc_enrollments",
  CERTIFICATES: "cc_certificates",
  ASSESSMENTS: "cc_assessments",
  ATTEMPTS: "cc_attempts",
  FEEDBACKS: "cc_feedbacks",
  NOTIFICATIONS: "cc_notifications",
  LIVE_SESSIONS: "cc_live_sessions",
  COMPETENCIES: "cc_competencies",
  DISCUSSIONS: "cc_discussions",
  LEADERBOARD: "cc_leaderboard",
  BADGES: "cc_badges",
  AUDIT_LOGS: "cc_audit_logs"
};

export function getFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (key === STORAGE_KEYS.USERS) {
          const existingEmails = new Set(parsed.map((u: any) => u.email?.toLowerCase()));
          let modified = false;
          for (const initUser of initialUsers) {
            if (!existingEmails.has(initUser.email.toLowerCase())) {
              parsed.push(initUser);
              modified = true;
            }
          }
          if (modified) {
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        }
        if (key === STORAGE_KEYS.COURSES) {
          const existingIds = new Set(parsed.map((c: any) => c.id));
          let modified = false;
          for (const initCourse of initialCourses) {
            if (!existingIds.has(initCourse.id)) {
              parsed.push(initCourse);
              modified = true;
            }
          }
          const c6 = parsed.find((c: any) => c.id === 'c6');
          const initC6 = initialCourses.find((c: any) => c.id === 'c6');
          if (c6 && initC6 && (c6.title !== initC6.title || !c6.videoUrl)) {
            Object.assign(c6, initC6);
            modified = true;
          }
          if (modified) {
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        }
        if (key === STORAGE_KEYS.ASSESSMENTS) {
          const existingIds = new Set(parsed.map((a: any) => a.id));
          let modified = false;
          for (const initAssess of initialAssessments) {
            if (!existingIds.has(initAssess.id)) {
              parsed.push(initAssess);
              modified = true;
            }
          }
          if (modified) {
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        }
        return parsed;
      }
    }
  } catch (e) {}

  if (key === STORAGE_KEYS.COURSES) {
    saveToStorage(key, initialCourses);
    return initialCourses as any;
  }
  if (key === STORAGE_KEYS.USERS) {
    saveToStorage(key, initialUsers);
    return initialUsers as any;
  }
  if (key === STORAGE_KEYS.ASSESSMENTS) {
    saveToStorage(key, initialAssessments);
    return initialAssessments as any;
  }
  if (key === STORAGE_KEYS.NOTIFICATIONS) {
    saveToStorage(key, initialNotifications);
    return initialNotifications as any;
  }
  if (key === STORAGE_KEYS.LIVE_SESSIONS) {
    saveToStorage(key, initialLiveSessions);
    return initialLiveSessions as any;
  }
  if (key === STORAGE_KEYS.COMPETENCIES) {
    saveToStorage(key, initialCompetencyMatrix);
    return initialCompetencyMatrix as any;
  }
  if (key === STORAGE_KEYS.LEADERBOARD) {
    saveToStorage(key, initialLeaderboard);
    return initialLeaderboard as any;
  }
  if (key === STORAGE_KEYS.BADGES) {
    saveToStorage(key, initialBadges);
    return initialBadges as any;
  }

  return [];
}

export function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to storage", e);
  }
}

export function generateId(prefix: string = "id"): string {
  return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 5);
}
