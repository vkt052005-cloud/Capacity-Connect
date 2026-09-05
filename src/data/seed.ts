import {
  User, Course, Assessment, Notification, Certificate,
  SubjectCompetency, LiveSession, LeaderboardEntry, Badge, DiscussionThread, AuditLog
} from "../types";
import { generateAnswerHash } from "../utils/quizSecurity";
import { sigmaWebDevLessons } from "./sigmaWebDevPlaylist";
import { dsaLessons } from "./dsaPlaylist";

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
  },
  {
    id: "u-trainer-striver",
    name: "Raj Vikramaditya (Striver)",
    email: "striver@takeuforward.org",
    password: "SRNNv@2005",
    role: "trainer",
    status: "active",
    createdAt: "2026-08-01T09:00:00Z",
    trainerProfile: {
      bio: "Ex-Google, Ex-Amazon Software Engineer. Founder of take U forward and creator of the A2Z DSA Course.",
      expertise: ["Data Structures & Algorithms", "Competitive Programming", "System Design"],
      competencies: ["Algorithm Design", "Dynamic Programming", "Interview Preparation"],
      phone: "+91 98765 22222",
      department: "Computer Science & Engineering",
      designation: "Principal Algorithms Instructor",
      experience: "8+ Years Engineering & Mentorship",
      rating: 4.99,
      totalStudentsTaught: 500000,
      verifiedCredentials: ["take U forward Founder", "Competitive Programming Master"]
    }
  }
];

export const initialCourses: Course[] = [
{
    id: "c6",
    title: "Web Development Course",
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
  },
  {
    id: "c-dsa",
    title: "DATA STRUCTURE AND ALGORITHM",
    description: "The complete A2Z Data Structures & Algorithms roadmap by Striver (take U forward). Master Arrays, Binary Search, Strings, Linked Lists, Recursion, Bit Manipulation, Stacks & Queues, Sliding Window, Heaps, Greedy Algorithms, Binary Trees, BSTs, Graphs, Dynamic Programming, Tries, and Advanced DSA with 315 structured video lessons.",
    trainerId: "u-trainer-striver",
    trainerName: "Raj Vikramaditya (Striver)",
    category: "Technical",
    thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc13c734187?w=800&auto=format&fit=crop&q=80",
    duration: "120+ Hours • 315 Lessons",
    level: "Intermediate",
    status: "active",
    createdAt: "2026-03-01T10:00:00Z",
    rating: 4.99,
    totalRatings: 3420,
    videoUrl: "https://youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz",
    lessons: dsaLessons,
    tags: ["Data Structures", "Algorithms", "C++", "Java", "Dynamic Programming", "Graphs", "Binary Trees", "Binary Search", "LeetCode"],
    syllabus: [
      "Module 1: Learn the Basics (C++, Java, Math, Recursion, Time & Space Complexity)",
      "Module 2: Sorting Techniques & Array Problems (Easy, Medium, Hard)",
      "Module 3: Binary Search on 1D/2D Arrays & Search Space",
      "Module 4: Linked List Mastery (Singly, Doubly, Medium & Hard Problems)",
      "Module 5: Recursion & Backtracking (Subsequences, Permutations, N-Queens)",
      "Module 6: Bit Manipulation, Stack & Queues (Prefix/Infix/Postfix, Monotonic Stack)",
      "Module 7: Sliding Window & Two Pointer Problems",
      "Module 8: Binary Trees & Binary Search Trees (Traversals, Views, Construction)",
      "Module 9: Graphs & Graph Algorithms (BFS, DFS, Dijkstra, Topo Sort, Disjoint Set)",
      "Module 10: Dynamic Programming (1D, 2D, Grids, Subsequences, Strings, Stocks, MCM)",
      "Module 11: Tries, Advanced String Algorithms & Hard Interview Problems"
    ],
    prerequisites: ["Basic understanding of programming in C++ or Java"],
    resources: [
      {
        id: "r-dsa-1",
        courseId: "c-dsa",
        title: "A2Z DSA Comprehensive Cheatsheet & Pattern Handbook",
        type: "presentation",
        url: "#slides",
        size: "24.6 MB",
        uploadedAt: "2026-03-01T10:00:00Z",
        uploadedBy: "Raj Vikramaditya (Striver)",
        version: "v4.2",
        summary: "Detailed engineering notes covering Big-O analysis, binary search templates, tree traversal tricks, graph cycle detection, and DP state transitions.",
        keyTakeaways: [
          "Binary search operates on any monotonically sorted search space, not just arrays.",
          "Monotonic stack pattern solves Next Greater Element and largest rectangle in histogram in O(N).",
          "Graph BFS computes unweighted shortest paths, while Dijkstra handles non-negative weighted edges.",
          "Dynamic programming solves overlapping subproblems using memoization (top-down) or tabulation (bottom-up)."
        ],
        flashcards: [
          { id: "f-dsa-1", front: "What is the time complexity of Binary Search?", back: "O(log N), because the search space is halved at each comparison step.", category: "Algorithms" },
          { id: "f-dsa-2", front: "What data structure is used to detect cycles in an undirected graph?", back: "Breadth-First Search (BFS) / Depth-First Search (DFS) with a visited array, or Disjoint Set Union (DSU).", category: "Graphs" },
          { id: "f-dsa-3", front: "What is the difference between Memoization and Tabulation in DP?", back: "Memoization is top-down recursion with cached results; Tabulation is bottom-up iterative table filling.", category: "Dynamic Programming" }
        ],
        slides: [
          {
            slideNumber: 1,
            title: "Mastering Asymptotic Analysis",
            bullets: [
              "Time complexity: Big-O, Omega, and Theta notations",
              "Space complexity: Auxiliary space vs. Input space",
              "Recursion tree method and Master Theorem",
              "Practical tradeoffs: In-place vs. Out-of-place algorithms"
            ],
            keyConcept: "Writing clean code is about achieving optimal asymptotic bounds without hidden overhead."
          },
          {
            slideNumber: 2,
            title: "Graph Traversal & Shortest Path Topologies",
            bullets: [
              "Adjacency list representation and memory compactness",
              "Breadth-First Search (Queue) vs Depth-First Search (Call Stack)",
              "Dijkstra algorithm using priority queue (min-heap)",
              "Kahn algorithm for Topological Sorting in DAGs"
            ],
            keyConcept: "Graphs model dependencies, networks, and state spaces across production systems."
          },
          {
            slideNumber: 3,
            title: "Dynamic Programming Patterns",
            bullets: [
              "Identifying overlapping subproblems and optimal substructure",
              "1D DP: Fibonacci, Climbing Stairs, Frog Jump",
              "2D Grid DP: Unique Paths, Minimum Path Sum",
              "DP on Subsequences: 0/1 Knapsack, Target Sum, Coin Change"
            ],
            keyConcept: "Formulate recurrence relations from base cases to achieve polynomial time execution."
          }
        ]
      }
    ]
  }
];

export const initialAssessments: Assessment[] = [
{
    id: "a-webdev-sigma",
    courseId: "c6",
    courseTitle: "Web Development Course",
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
  },
  {
    id: "a-dsa-striver",
    courseId: "c-dsa",
    courseTitle: "DATA STRUCTURE AND ALGORITHM",
    title: "Data Structures & Algorithms Certification Assessment",
    description: "Proctored DSA assessment covering Time & Space complexity, Binary Search, Trees, Graphs, and Dynamic Programming.",
    deadline: "2026-12-31T23:59:59Z",
    durationMinutes: 30,
    passingScore: 70,
    createdBy: "Raj Vikramaditya (Striver)",
    createdAt: "2026-03-01T12:00:00Z",
    questions: [
      {
        id: "q-dsa-1",
        text: "What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (BST) of N nodes?",
        options: [
          { id: "o1", text: "O(1)" },
          { id: "o2", text: "O(log N)" },
          { id: "o3", text: "O(N)" },
          { id: "o4", text: "O(N log N)" }
        ],
        correctIndex: 1,
        answerHash: generateAnswerHash("q-dsa-1", 1),
        points: 20,
        explanation: "In a balanced BST (like AVL or Red-Black tree), the height is O(log N), so search operations take O(log N) time in the worst case.",
        topic: "Binary Search Trees"
      },
      {
        id: "q-dsa-2",
        text: "Which data structure is optimal for implementing Dijkstra's single-source shortest path algorithm on a graph with V vertices and E edges?",
        options: [
          { id: "o1", text: "Queue (FIFO)" },
          { id: "o2", text: "Min-Heap / Priority Queue" },
          { id: "o3", text: "Stack (LIFO)" },
          { id: "o4", text: "Doubly Linked List" }
        ],
        correctIndex: 1,
        answerHash: generateAnswerHash("q-dsa-2", 1),
        points: 20,
        explanation: "A min-heap / priority queue allows extracting the minimum distance node in O(log V) time, yielding an overall complexity of O((V + E) log V).",
        topic: "Graph Algorithms"
      },
      {
        id: "q-dsa-3",
        text: "In the 0/1 Knapsack Problem with N items and weight capacity W, what is the space-optimized dynamic programming complexity?",
        options: [
          { id: "o1", text: "O(1) space" },
          { id: "o2", text: "O(W) space using a single 1D array" },
          { id: "o3", text: "O(N * W) space only" },
          { id: "o4", text: "O(N^2) space" }
        ],
        correctIndex: 1,
        answerHash: generateAnswerHash("q-dsa-3", 1),
        points: 20,
        explanation: "By iterating weight from W down to item weight, we can update the DP state in a single 1D array of size O(W).",
        topic: "Dynamic Programming"
      },
      {
        id: "q-dsa-4",
        text: "Which algorithm can detect a cycle in a Directed Acyclic Graph (DAG) during topological sorting?",
        options: [
          { id: "o1", text: "Kruskal's Algorithm" },
          { id: "o2", text: "Kahn's Algorithm (BFS using in-degrees)" },
          { id: "o3", text: "Floyd-Warshall Algorithm" },
          { id: "o4", text: "Prim's Algorithm" }
        ],
        correctIndex: 1,
        answerHash: generateAnswerHash("q-dsa-4", 1),
        points: 20,
        explanation: "If Kahn's algorithm fails to include all V vertices in the topological sort order, the directed graph contains at least one cycle.",
        topic: "Graphs"
      },
      {
        id: "q-dsa-5",
        text: "What is the time complexity to find the Next Greater Element for all elements in an array of size N using a Monotonic Stack?",
        options: [
          { id: "o1", text: "O(N^2)" },
          { id: "o2", text: "O(N)" },
          { id: "o3", text: "O(log N)" },
          { id: "o4", text: "O(N log N)" }
        ],
        correctIndex: 1,
        answerHash: generateAnswerHash("q-dsa-5", 1),
        points: 20,
        explanation: "Each element is pushed and popped from the monotonic stack at most once, resulting in amortized O(N) linear time.",
        topic: "Stacks & Queues"
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
    subject: "Web Development Course",
    category: "Technical",
    organizationalDemandScore: 98,
    internalCapacityScore: 95,
    gapScore: 3,
    priority: "High",
    suitableTrainers: [
      { id: "u-trainer-official", name: "CodeWithHarry (Haris Khan)", rating: 4.98, matchPercentage: 100, experienceYears: 12, competencies: ["Full-Stack", "JavaScript", "React", "Next.js", "Express", "Node.js", "Tailwind"] }
    ]
  },
  {
    subject: "DATA STRUCTURE AND ALGORITHM",
    category: "Technical",
    organizationalDemandScore: 99,
    internalCapacityScore: 96,
    gapScore: 3,
    priority: "Critical",
    suitableTrainers: [
      { id: "u-trainer-striver", name: "Raj Vikramaditya (Striver)", rating: 4.99, matchPercentage: 100, experienceYears: 10, competencies: ["DSA", "LeetCode", "Dynamic Programming", "Graphs", "Binary Search", "Trees"] }
    ]
  }
];

export const initialDiscussions: DiscussionThread[] = [
  {
    id: "disc-01",
    courseId: "c6",
    title: "Best practice for managing dependencies in useEffect without infinite re-renders?",
    content: "When fetching user profile data inside useEffect with an object state, what is the cleanest pattern to prevent unnecessary re-fetches?",
    authorId: "u-trainee-official",
    authorName: "Madhav Kumar",
    authorRole: "trainee",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-02-18T11:20:00Z",
    upvotes: 14,
    upvotedBy: ["u-trainee-2", "u-trainee-3"],
    replies: [
      {
        id: "rep-01",
        authorId: "u-trainer-official",
        authorName: "CodeWithHarry (Haris Khan)",
        authorRole: "trainer",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        content: "Great question! Either use primitive values (like user.id) directly in the dependency array instead of the entire object, or wrap the fetch function in useCallback. As covered in Tutorial #108 and #118!",
        createdAt: "2026-02-18T13:45:00Z",
        isTrainerVerified: true
      },
      {
        id: "rep-02",
        authorId: "u-trainee-official",
        authorName: "Madhav Kumar",
        authorRole: "trainee",
        content: "Passing just user.id solved the infinite loop right away, thank you Harry sir!",
        createdAt: "2026-02-18T15:10:00Z"
      }
    ]
  },
  {
    id: "disc-02",
    courseId: "c6",
    title: "When to choose CSS Grid over Flexbox in responsive card layouts?",
    content: "For a responsive dashboard gallery, is CSS Grid with repeat(auto-fit, minmax(...)) better than Flexbox flex-wrap?",
    authorId: "u-trainee-official",
    authorName: "Madhav Kumar",
    authorRole: "trainee",
    createdAt: "2026-02-22T09:15:00Z",
    upvotes: 8,
    upvotedBy: ["u-trainee-official"],
    replies: [
      {
        id: "rep-03",
        authorId: "u-trainer-official",
        authorName: "CodeWithHarry (Haris Khan)",
        authorRole: "trainer",
        content: "CSS Grid is 2D and excels when you want uniform column alignments across rows. Flexbox is 1D and best for header bars or uneven tag strips. In Tutorial #44 we cover exactly this comparison!",
        createdAt: "2026-02-22T10:30:00Z",
        isTrainerVerified: true
      }
    ]
  },
  {
    id: "disc-dsa-01",
    courseId: "c-dsa",
    title: "How to identify if a problem should be solved with Monotonic Stack?",
    content: "Whenever a problem asks for Next Greater Element or Previous Smaller Element, is Monotonic Stack always the optimal O(N) choice?",
    authorId: "u-trainee-official",
    authorName: "Madhav Kumar",
    authorRole: "trainee",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-03-02T10:00:00Z",
    upvotes: 19,
    upvotedBy: ["u-trainee-official"],
    replies: [
      {
        id: "rep-dsa-01",
        authorId: "u-trainer-striver",
        authorName: "Raj Vikramaditya (Striver)",
        authorRole: "trainer",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        content: "Yes! Whenever you need the nearest greater/smaller element on the left or right, a monotonic stack maintains elements in sorted order and guarantees each index is pushed and popped at most once in O(N). Check video #300 and the Stack series!",
        createdAt: "2026-03-02T11:15:00Z",
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
          localStorage.setItem(key, JSON.stringify(initialCourses));
          return initialCourses as any;
        }
        if (key === STORAGE_KEYS.ASSESSMENTS) {
          localStorage.setItem(key, JSON.stringify(initialAssessments));
          return initialAssessments as any;
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
