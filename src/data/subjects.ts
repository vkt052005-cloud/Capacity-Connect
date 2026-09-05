export interface SubjectOption {
  id: string;
  name: string;
  shortName: string;
  category: string;
  code: string;
  defaultTitle: string;
  description: string;
}

export const STANDARD_SUBJECTS: SubjectOption[] = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms (DSA)",
    shortName: "DSA",
    category: "Core Computer Science",
    code: "CS-DSA-101",
    defaultTitle: "Live Google Meet: Data Structures & Algorithms (DSA) Problem Solving",
    description: "Arrays, Linked Lists, Trees, Graphs, Dynamic Programming & LeetCode problem solving."
  },
  {
    id: "web-dev",
    name: "Full-Stack Web Development (Web Dev)",
    shortName: "Web Dev",
    category: "Software Engineering",
    code: "ENG-WEB-201",
    defaultTitle: "Live Google Meet: Full-Stack Web Development (React, Node.js & APIs)",
    description: "Modern React, TypeScript, Next.js, Node.js, Express, REST/GraphQL & Tailwind CSS."
  },
  {
    id: "ml",
    name: "Machine Learning & AI (ML)",
    shortName: "ML & AI",
    category: "AI & Data Science",
    code: "AI-ML-301",
    defaultTitle: "Live Google Meet: Machine Learning & Generative AI Systems",
    description: "Supervised & Unsupervised Learning, PyTorch, LLMs, RAG, and Vector Embeddings."
  },
  {
    id: "postgresql",
    name: "PostgreSQL & Database Systems",
    shortName: "PostgreSQL",
    category: "Data Engineering",
    code: "DB-PG-202",
    defaultTitle: "Live Google Meet: PostgreSQL Advanced Indexing, Query Optimization & Sharding",
    description: "Relational modeling, indexing, EXPLAIN ANALYZE, query tuning, transactions & replication."
  },
  {
    id: "cloud-k8s",
    name: "Distributed Cloud Systems & Kubernetes",
    shortName: "Cloud & K8s",
    category: "Cloud & Infrastructure",
    code: "CLOUD-K8S-401",
    defaultTitle: "Live Google Meet: Distributed Cloud Systems & Kubernetes Cluster Labs",
    description: "Microservices, Docker, Kubernetes orchestration, Helm, service meshes & cloud resilience."
  },
  {
    id: "devops",
    name: "DevOps, Docker & CI/CD Pipelines",
    shortName: "DevOps",
    category: "Cloud & Infrastructure",
    code: "DEVOPS-CICD-203",
    defaultTitle: "Live Google Meet: DevOps CI/CD Automation & Docker Containerization",
    description: "GitHub Actions, Docker containers, Terraform, monitoring, Prometheus & Grafana."
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity & Zero-Trust Defense",
    shortName: "Cybersecurity",
    category: "Information Security",
    code: "SEC-ZT-305",
    defaultTitle: "Live Google Meet: Cybersecurity, Threat Hunting & Zero-Trust Defense",
    description: "Penetration testing, network security, cryptography, ISO 27001, and secure authentication."
  },
  {
    id: "system-design",
    name: "System Design & Scalable Architecture",
    shortName: "System Design",
    category: "Software Engineering",
    code: "SYS-ARCH-501",
    defaultTitle: "Live Google Meet: High-Scale System Design & Distributed Microservices",
    description: "High availability, load balancing, caching strategies, rate limiting, and CAP theorem."
  },
  {
    id: "mobile-dev",
    name: "Mobile App Development (Flutter & React Native)",
    shortName: "Mobile Dev",
    category: "Mobile Engineering",
    code: "MOB-RN-204",
    defaultTitle: "Live Google Meet: Mobile App Development & Cross-Platform UI",
    description: "Cross-platform iOS and Android app engineering with state management and native APIs."
  },
  {
    id: "custom",
    name: "Other / Custom Technical Subject",
    shortName: "Custom",
    category: "General",
    code: "CUSTOM-001",
    defaultTitle: "Live Google Meet: Specialized Faculty Office Hours & Technical Lab",
    description: "Custom faculty lecture topic, personalized code review, and Q&A session."
  }
];

export const getSubjectById = (id: string): SubjectOption | undefined => {
  return STANDARD_SUBJECTS.find((s) => s.id === id);
};
