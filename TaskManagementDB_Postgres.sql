-- ============================================================
-- PRN232 Assignment 2 — Task & Team Management Database (PostgreSQL)
-- Tables: Department, SystemAccount, Project, Task, Tag, TaskTag
-- Extended Seed Data (6x Scale) with Test Accounts & Audit Fields
-- ============================================================

-- Drop tables in dependency order
DROP TABLE IF EXISTS "TaskTag";
DROP TABLE IF EXISTS "Tag";
DROP TABLE IF EXISTS "Task";
DROP TABLE IF EXISTS "Project";
DROP TABLE IF EXISTS "SystemAccount";
DROP TABLE IF EXISTS "Department";

-- ============================================================
-- TABLE: Department
-- ============================================================
CREATE TABLE "Department" (
    "DepartmentID"          SERIAL          PRIMARY KEY,
    "DepartmentName"        VARCHAR(100)    NOT NULL,
    "DepartmentDescription" VARCHAR(300)    NOT NULL,
    "IsActive"              BOOLEAN         NOT NULL DEFAULT TRUE
);

-- ============================================================
-- TABLE: SystemAccount (Assignment 2 Authentication & RBAC)
-- Role: 0 = Staff, 1 = Admin
-- ============================================================
CREATE TABLE "SystemAccount" (
    "AccountID"              SERIAL          PRIMARY KEY,
    "FullName"               VARCHAR(150)    NOT NULL,
    "Email"                  VARCHAR(150)    NOT NULL UNIQUE,
    "PasswordHash"           VARCHAR(255)    NOT NULL,
    "Role"                   SMALLINT        NOT NULL DEFAULT 0,
    "RefreshToken"           VARCHAR(255)    NULL,
    "RefreshTokenExpiryTime" TIMESTAMP       NULL,
    "CreatedDate"            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: Project
-- Status: 0 = Not Started, 1 = In Progress, 2 = Completed, 3 = On Hold
-- Audit: CreatedByID, UpdatedByID
-- ============================================================
CREATE TABLE "Project" (
    "ProjectID"     SERIAL          PRIMARY KEY,
    "ProjectName"   VARCHAR(200)    NOT NULL,
    "Description"   TEXT            NULL,
    "StartDate"     DATE            NOT NULL,
    "EndDate"       DATE            NULL,
    "Status"        SMALLINT        NOT NULL DEFAULT 0,
    "DepartmentID"  INT             NOT NULL,
    "IsActive"      BOOLEAN         NOT NULL DEFAULT TRUE,
    "CreatedDate"   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedByID"   INT             NULL,
    "UpdatedByID"   INT             NULL,
    CONSTRAINT "FK_Project_Department" FOREIGN KEY ("DepartmentID")
        REFERENCES "Department" ("DepartmentID"),
    CONSTRAINT "FK_Project_CreatedBy" FOREIGN KEY ("CreatedByID")
        REFERENCES "SystemAccount" ("AccountID") ON DELETE SET NULL,
    CONSTRAINT "FK_Project_UpdatedBy" FOREIGN KEY ("UpdatedByID")
        REFERENCES "SystemAccount" ("AccountID") ON DELETE SET NULL
);

-- ============================================================
-- TABLE: Task
-- Status: 0 = To Do, 1 = In Progress, 2 = Done, 3 = Cancelled
-- Priority: 0 = Low, 1 = Medium, 2 = High, 3 = Critical
-- Audit: CreatedByID, UpdatedByID
-- ============================================================
CREATE TABLE "Task" (
    "TaskID"        SERIAL          PRIMARY KEY,
    "Title"         VARCHAR(300)    NOT NULL,
    "Description"   TEXT            NULL,
    "Status"        SMALLINT        NOT NULL DEFAULT 0,
    "Priority"      SMALLINT        NOT NULL DEFAULT 1,
    "DueDate"       DATE            NULL,
    "ProjectID"     INT             NOT NULL,
    "IsActive"      BOOLEAN         NOT NULL DEFAULT TRUE,
    "CreatedDate"   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ModifiedDate"  TIMESTAMP       NULL,
    "CreatedByID"   INT             NULL,
    "UpdatedByID"   INT             NULL,
    CONSTRAINT "FK_Task_Project" FOREIGN KEY ("ProjectID")
        REFERENCES "Project" ("ProjectID"),
    CONSTRAINT "FK_Task_CreatedBy" FOREIGN KEY ("CreatedByID")
        REFERENCES "SystemAccount" ("AccountID") ON DELETE RESTRICT,
    CONSTRAINT "FK_Task_UpdatedBy" FOREIGN KEY ("UpdatedByID")
        REFERENCES "SystemAccount" ("AccountID") ON DELETE SET NULL
);

-- ============================================================
-- TABLE: Tag
-- ============================================================
CREATE TABLE "Tag" (
    "TagID"     SERIAL          PRIMARY KEY,
    "TagName"   VARCHAR(50)     NOT NULL UNIQUE,
    "Color"     VARCHAR(7)      NULL    -- Hex color code e.g. #3B82F6
);

-- ============================================================
-- TABLE: TaskTag (many-to-many: Task ↔ Tag)
-- ============================================================
CREATE TABLE "TaskTag" (
    "TaskID"    INT     NOT NULL,
    "TagID"     INT     NOT NULL,
    CONSTRAINT "PK_TaskTag"         PRIMARY KEY ("TaskID", "TagID"),
    CONSTRAINT "FK_TaskTag_Task"    FOREIGN KEY ("TaskID") REFERENCES "Task" ("TaskID") ON DELETE CASCADE,
    CONSTRAINT "FK_TaskTag_Tag"     FOREIGN KEY ("TagID")  REFERENCES "Tag"  ("TagID")  ON DELETE CASCADE
);

-- ============================================================
-- SEED: SystemAccount (BCrypt Hashed Passwords)
-- Admin: admin@tasktrack.com / Admin@123
-- Staff: staff@tasktrack.com / Staff@123
-- ============================================================
INSERT INTO "SystemAccount" ("AccountID", "FullName", "Email", "PasswordHash", "Role", "CreatedDate") VALUES
    (1, 'System Administrator', 'admin@tasktrack.com',       '$2a$11$e3dYg.KehydBbbHNJDmQAuMZuO3J.xNMx0Ze42UNGgeGedNLzsebW', 1, '2024-01-01 08:00:00'),
    (2, 'Standard Staff',       'staff@tasktrack.com',       '$2a$11$xDcjghgI4BdJkcQuxL/gkutF6xXNVMVLJg1xF4TAwKDLDCJELU7Vy', 0, '2024-01-02 08:30:00'),
    (3, 'Nguyen Vinh Phu',      'phunv.dev@tasktrack.com',   '$2a$11$e3dYg.KehydBbbHNJDmQAuMZuO3J.xNMx0Ze42UNGgeGedNLzsebW', 1, '2024-01-05 09:00:00'),
    (4, 'Sarah Connor',         'sarah.lead@tasktrack.com',  '$2a$11$xDcjghgI4BdJkcQuxL/gkutF6xXNVMVLJg1xF4TAwKDLDCJELU7Vy', 0, '2024-01-10 10:15:00'),
    (5, 'David Miller',         'david.pm@tasktrack.com',    '$2a$11$xDcjghgI4BdJkcQuxL/gkutF6xXNVMVLJg1xF4TAwKDLDCJELU7Vy', 0, '2024-01-12 11:20:00'),
    (6, 'Elena Rostova',        'elena.qa@tasktrack.com',    '$2a$11$xDcjghgI4BdJkcQuxL/gkutF6xXNVMVLJg1xF4TAwKDLDCJELU7Vy', 0, '2024-01-15 14:00:00');
SELECT setval(pg_get_serial_sequence('"SystemAccount"', 'AccountID'), (SELECT MAX("AccountID") FROM "SystemAccount"));

-- ============================================================
-- SEED: Department
-- ============================================================
INSERT INTO "Department" ("DepartmentID", "DepartmentName", "DepartmentDescription", "IsActive") VALUES
    (1, 'Engineering',          'Responsible for software architecture, backend APIs, frontend apps, and systems engineering.', TRUE),
    (2, 'Product Strategy',     'Handles product discovery, user journeys, feature roadmaps, and stakeholder alignment.',       TRUE),
    (3, 'Quality Assurance',    'Ensures high software quality, automated testing, performance benchmarks, and regression runs.',TRUE),
    (4, 'UI/UX Design',         'Covers product design systems, user research, wireframing, high-fidelity mockups, and UX.',    TRUE),
    (5, 'DevOps & Operations',  'Manages cloud infrastructure, continuous delivery, Kubernetes orchestration, and monitoring.',  TRUE),
    (6, 'Customer Success',     'Drives customer onboarding, support feedback loops, client escalation, and satisfaction.',      TRUE),
    (7, 'Security & Compliance','Maintains data compliance (GDPR/HIPAA), security audits, pen-testing, and access controls.',   TRUE),
    (8, 'Marketing & Growth',   'Manages brand awareness, growth hacking, technical blogging, and client acquisition.',          TRUE);
SELECT setval(pg_get_serial_sequence('"Department"', 'DepartmentID'), (SELECT MAX("DepartmentID") FROM "Department"));

-- ============================================================
-- SEED: Tag
-- ============================================================
INSERT INTO "Tag" ("TagID", "TagName", "Color") VALUES
    (1,  'Backend',        '#3B82F6'),
    (2,  'Frontend',       '#8B5CF6'),
    (3,  'Database',       '#06B6D4'),
    (4,  'Security',       '#EF4444'),
    (5,  'DevOps',         '#F59E0B'),
    (6,  'UI/UX',          '#EC4899'),
    (7,  'Bug',            '#DC2626'),
    (8,  'Feature',        '#10B981'),
    (9,  'Urgent',         '#B91C1C'),
    (10, 'Documentation',  '#64748B'),
    (11, 'Testing',        '#14B8A6'),
    (12, 'Performance',    '#F97316'),
    (13, 'Refactor',       '#6366F1'),
    (14, 'API',            '#0284C7'),
    (15, 'Mobile',         '#D946EF');
SELECT setval(pg_get_serial_sequence('"Tag"', 'TagID'), (SELECT MAX("TagID") FROM "Tag"));

-- ============================================================
-- SEED: Project (16 Projects)
-- ============================================================
INSERT INTO "Project" ("ProjectID", "ProjectName", "Description", "StartDate", "EndDate", "Status", "DepartmentID", "IsActive", "CreatedDate", "CreatedByID", "UpdatedByID") VALUES
    (1,  'Cloud Migration v2',        'Migrate legacy on-prem services to AWS containerized ECS clusters.',      '2024-01-10', '2024-06-30', 1, 5, TRUE, '2024-01-05 09:00:00', 1, 1),
    (2,  'Next.js Portal Overhaul',   'Redesign customer-facing dashboard using Next.js 14 and Tailwind CSS.',   '2024-01-15', '2024-07-15', 1, 1, TRUE, '2024-01-08 10:30:00', 3, 3),
    (3,  'Auth0 & JWT Hardening',     'Implement strict JWT authentication with refresh token rotation.',         '2024-02-01', '2024-04-30', 2, 7, TRUE, '2024-01-20 11:00:00', 1, 3),
    (4,  'Design System 3.0',         'Create unified Figma tokens, Tailwind preset and reusable UI components.', '2024-02-15', '2024-05-30', 2, 4, TRUE, '2024-02-01 14:00:00', 4, 4),
    (5,  'Automated E2E Suite',       'Set up Playwright cross-browser regression test suites on CI/CD pipeline.','2024-03-01', '2024-08-31', 1, 3, TRUE, '2024-02-15 15:30:00', 6, 6),
    (6,  'Payment Gateway Expansion', 'Integrate Stripe and Apple Pay with automated webhook idempotency.',      '2024-03-15', '2024-09-30', 1, 1, TRUE, '2024-03-01 09:15:00', 2, 2),
    (7,  'Mobile App iOS / Android',  'Develop cross-platform Flutter client for instant mobile task tracking.',  '2024-04-01', '2024-11-30', 0, 1, TRUE, '2024-03-10 16:45:00', 5, 5),
    (8,  'Search & Analytics Engine', 'Deploy Elasticsearch cluster with real-time task search and indexing.',    '2024-04-10', '2024-10-15', 1, 5, TRUE, '2024-03-20 11:10:00', 3, 3),
    (9,  'Customer Onboarding Flow',  'Streamline new team signup, invite links, and interactive guided tour.',   '2024-04-20', '2024-07-20', 2, 2, TRUE, '2024-04-01 13:00:00', 4, 4),
    (10, 'GDPR & Audit Compliance',   'Implement data retention policies, soft-delete audits, and export tools.', '2024-05-01', '2024-08-15', 1, 7, TRUE, '2024-04-15 10:00:00', 1, 1),
    (11, 'GraphQL Federation Pilot',  'Evaluate schema stitching across microservices for high throughput.',      '2024-05-15', '2024-09-15', 3, 1, TRUE, '2024-05-01 14:20:00', 2, 5),
    (12, 'Performance Profiling',     'Optimize EF Core queries, add Redis distributed caching, benchmark p99.',  '2024-06-01', '2024-09-01', 1, 1, TRUE, '2024-05-10 09:40:00', 3, 3),
    (13, 'Public Marketing Launch',   'Launch redesigned product landing page and interactive demo sandbox.',     '2024-06-15', '2024-08-01', 2, 8, TRUE, '2024-05-25 11:30:00', 5, 5),
    (14, 'Internal Knowledge Wiki',   'Centralize engineering architecture guides, runbooks and API references.', '2024-07-01', '2024-10-30', 1, 6, TRUE, '2024-06-10 15:00:00', 4, 4),
    (15, 'Incident Response Playbook','Standardize P1/P2 alerting, PagerDuty integration, and post-mortem logs.', '2024-07-15', '2024-11-15', 0, 5, TRUE, '2024-06-20 10:15:00', 1, 1),
    (16, 'Disaster Recovery Plan',    'Automated PostgreSQL point-in-time recovery and cross-region replication.','2024-08-01', '2024-12-31', 0, 5, TRUE, '2024-07-01 16:00:00', 3, 3);
SELECT setval(pg_get_serial_sequence('"Project"', 'ProjectID'), (SELECT MAX("ProjectID") FROM "Project"));

-- ============================================================
-- SEED: Task (52 Tasks)
-- Status: 0=To Do, 1=In Progress, 2=Done, 3=Cancelled
-- Priority: 0=Low, 1=Medium, 2=High, 3=Critical
-- ============================================================
INSERT INTO "Task" ("TaskID", "Title", "Description", "Status", "Priority", "DueDate", "ProjectID", "IsActive", "CreatedDate", "ModifiedDate", "CreatedByID", "UpdatedByID") VALUES
    -- Project 1 (Cloud Migration)
    (1,  'Containerize .NET API with Multi-stage Docker', 'Optimize base image size and configure non-root runtime user.', 2, 2, '2024-02-15', 1, TRUE, '2024-01-10 10:00:00', '2024-02-14 16:30:00', 1, 1),
    (2,  'Configure AWS ECS Fargate Task Definitions',    'Define CPU, memory limits, and secret injections from SSM.',    1, 3, '2024-04-10', 1, TRUE, '2024-01-15 11:00:00', '2024-03-01 14:00:00', 1, 3),
    (3,  'Set up Terraform Infrastructure as Code',       'Declare VPC, subnets, NAT gateways, and security group rules.', 2, 2, '2024-03-20', 1, TRUE, '2024-01-20 14:00:00', '2024-03-18 10:00:00', 1, 1),
    (4,  'Load Balancing & SSL Certificate Setup',        'Attach ACM TLS certificates to Application Load Balancer.',     0, 1, '2024-05-15', 1, TRUE, '2024-02-01 09:30:00', NULL, 3, NULL),

    -- Project 2 (Next.js Portal Overhaul)
    (5,  'Build Responsive Dashboard Navigation & Sidebar','Implement sleek collapsible sidebar and mobile drawer menu.', 2, 2, '2024-02-28', 2, TRUE, '2024-01-16 09:00:00', '2024-02-27 15:00:00', 3, 3),
    (6,  'Connect Home Dashboard to Real Backend Summary', 'Display dynamic progress cards, donut chart, and task counts.', 2, 3, '2024-03-15', 2, TRUE, '2024-01-20 11:00:00', '2024-03-12 18:00:00', 3, 3),
    (7,  'Implement Department CRUD Modals & Toasts',     'Add create/edit dialogs with real-time form validation.',       2, 2, '2024-03-25', 2, TRUE, '2024-02-01 10:00:00', '2024-03-24 16:00:00', 3, 4),
    (8,  'Implement Project Management & Progress Bars',  'Support project CRUD with department dropdown and date pickers.',2, 2, '2024-04-05', 2, TRUE, '2024-02-10 14:00:00', '2024-04-04 11:30:00', 3, 3),
    (9,  'Implement Task CRUD with Multi-select Tagging', 'Include rich tag selector, priority badge, and status filter.', 1, 3, '2024-05-10', 2, TRUE, '2024-02-15 16:00:00', '2024-04-12 12:00:00', 3, 2),
    (10, 'Global Omni Search with Real-time Filters',     'Search tasks, projects, and departments with instant debouncing.',1, 1, '2024-05-20', 2, TRUE, '2024-03-01 10:30:00', '2024-04-18 14:00:00', 4, 3),

    -- Project 3 (Auth & JWT Hardening)
    (11, 'Design SystemAccount Schema & Migration',       'Create table with password hash, unique email, role and audits.',2, 3, '2024-02-10', 3, TRUE, '2024-02-01 09:00:00', '2024-02-09 17:00:00', 1, 1),
    (12, 'Implement BCrypt Password Hashing Service',     'Ensure work factor 11 and prevent plain-text leakages.',        2, 3, '2024-02-20', 3, TRUE, '2024-02-05 10:00:00', '2024-02-18 11:00:00', 1, 3),
    (13, 'Implement JWT Middleware & Token Generator',    'Add ClaimTypes.Role, AccountID, expiration and digital sign.',   2, 3, '2024-03-01', 3, TRUE, '2024-02-12 11:30:00', '2024-02-28 16:45:00', 1, 1),
    (14, 'Build Refresh Token Rotation Endpoint',         'Issue cryptographically secure tokens stored in database.',      2, 2, '2024-03-15', 3, TRUE, '2024-02-18 14:00:00', '2024-03-14 15:20:00', 3, 1),
    (15, 'Protect Write Endpoints with [Authorize]',      'Block unauthenticated POST, PUT, DELETE with 401 Unauthorized.',2, 3, '2024-03-25', 3, TRUE, '2024-02-25 09:15:00', '2024-03-24 10:00:00', 1, 3),
    (16, 'Enforce Role-based Access for Admin Endpoints', 'Ensure Staff accounts receive 403 Forbidden on /api/accounts.',2, 3, '2024-04-05', 3, TRUE, '2024-03-05 15:00:00', '2024-04-03 16:00:00', 1, 1),

    -- Project 4 (Design System 3.0)
    (17, 'Build Accessible Modal Dialog System',          'Support backdrop blur, escape key, focus trapping and portal.',  2, 1, '2024-03-05', 4, TRUE, '2024-02-16 09:30:00', '2024-03-04 14:00:00', 4, 4),
    (18, 'Standardize Badge Components & Color Presets',  'Create badges for Status, Priority, and custom Hex tag pills.',  2, 1, '2024-03-20', 4, TRUE, '2024-02-20 11:00:00', '2024-03-19 16:30:00', 4, 4),
    (19, 'Design Dark Mode Theme Tokens',                 'Prepare CSS variables for dark contrast and seamless switches.', 3, 0, '2024-04-30', 4, TRUE, '2024-03-01 14:00:00', '2024-04-10 11:00:00', 4, 4),

    -- Project 5 (Automated E2E Suite)
    (20, 'Configure Playwright CI Matrix Runner',         'Run Chromium, Firefox and WebKit on GitHub Actions.',            2, 2, '2024-03-25', 5, TRUE, '2024-03-01 09:00:00', '2024-03-22 17:00:00', 6, 6),
    (21, 'Write E2E Auth Login & Logout Flow Test',       'Test successful login, error banner, and token cleanup.',        1, 2, '2024-05-15', 5, TRUE, '2024-03-10 10:30:00', '2024-04-02 11:15:00', 6, 6),
    (22, 'Write E2E Task Creation & Validation Test',     'Verify task form inputs, tag selections and toast alerts.',      1, 2, '2024-05-30', 5, TRUE, '2024-03-20 14:00:00', '2024-04-15 16:00:00', 6, 6),
    (23, 'Write 403 Forbidden Admin Page Protection Test','Confirm staff users cannot access account management.',          0, 2, '2024-06-15', 5, TRUE, '2024-04-01 11:00:00', NULL, 6, NULL),

    -- Project 6 (Payment Gateway Expansion)
    (24, 'Stripe Checkout API Integration',               'Implement session creation and redirect handling.',              2, 2, '2024-05-10', 6, TRUE, '2024-03-15 09:00:00', '2024-05-08 14:00:00', 2, 2),
    (25, 'Handle Stripe Webhook Events & Signatures',     'Verify event cryptographic signature and update subscription.',  1, 3, '2024-06-20', 6, TRUE, '2024-03-25 11:00:00', '2024-04-18 17:00:00', 2, 2),
    (26, 'Invoice Generation & PDF Export',               'Generate downloadable invoices with company tax details.',       0, 1, '2024-07-30', 6, TRUE, '2024-04-05 14:00:00', NULL, 2, NULL),

    -- Project 7 (Mobile App)
    (27, 'Set up Flutter Monorepo & Navigation Shell',    'Configure GoRouter with bottom navigation bar.',                 0, 1, '2024-06-30', 7, TRUE, '2024-04-01 09:00:00', NULL, 5, NULL),
    (28, 'Implement Offline SQLite Sync Engine',          'Cache tasks locally and sync to REST API when online.',          0, 2, '2024-08-31', 7, TRUE, '2024-04-10 11:30:00', NULL, 5, NULL),

    -- Project 8 (Search & Analytics Engine)
    (29, 'Elasticsearch Cluster Setup on Docker',         'Configure single-node dev cluster and replica mapping.',         2, 2, '2024-05-01', 8, TRUE, '2024-04-10 10:00:00', '2024-04-28 15:00:00', 3, 3),
    (30, 'Implement PostgreSQL Change Data Capture Sync', 'Sync task updates to Elasticsearch index via Debezium.',        1, 2, '2024-06-30', 8, TRUE, '2024-04-15 14:00:00', '2024-05-02 16:30:00', 3, 3),
    (31, 'Expose Fuzzy Full-text Search API',             'Add multi-match queries with typo tolerance on task title.',      0, 2, '2024-07-31', 8, TRUE, '2024-04-25 09:00:00', NULL, 3, NULL),

    -- Project 9 (Customer Onboarding)
    (32, 'Interactive Guided Walkthrough Tooltips',       'Use driver.js to highlight key navigation buttons for new users.',2, 1, '2024-05-20', 9, TRUE, '2024-04-20 10:00:00', '2024-05-18 11:00:00', 4, 4),
    (33, 'Sample Seed Data Generator for New Workspaces', 'Populate default projects and tasks upon company signup.',       2, 2, '2024-06-10', 9, TRUE, '2024-04-25 14:00:00', '2024-06-08 16:00:00', 4, 4),

    -- Project 10 (GDPR & Compliance)
    (34, 'Implement Soft-delete Cascading Strategy',      'Set IsActive=false and retain audit references securely.',       2, 3, '2024-05-30', 10, TRUE, '2024-05-01 09:30:00', '2024-05-28 15:30:00', 1, 1),
    (35, 'User Data Export Tool (JSON/CSV Zip)',          'Allow users to request and download full account data package.', 1, 2, '2024-07-15', 10, TRUE, '2024-05-10 11:00:00', '2024-06-01 10:00:00', 1, 1),

    -- Project 11 (GraphQL Federation)
    (36, 'Benchmark Hotspot Queries with GraphQL vs REST', 'Compare network payload and query latency over 100k records.',   3, 1, '2024-07-01', 11, TRUE, '2024-05-15 14:00:00', '2024-06-15 11:00:00', 2, 5),

    -- Project 12 (Performance Profiling)
    (37, 'Add Redis Distributed Cache for /api/departments','Cache department tree with 5-minute invalidation TTL.',       1, 2, '2024-07-20', 12, TRUE, '2024-06-01 09:00:00', '2024-06-25 14:00:00', 3, 3),
    (38, 'Optimize EF Core N+1 Queries with AsNoTracking',  'Apply SplitQuery and explicit projection on heavy task list.', 2, 3, '2024-06-30', 12, TRUE, '2024-06-05 11:00:00', '2024-06-28 17:00:00', 3, 3),
    (39, 'Index Tuning on Foreign Keys & Status Filters',   'Add B-Tree indices on ProjectID, DepartmentID, and DueDate.',  1, 2, '2024-08-10', 12, TRUE, '2024-06-10 14:00:00', '2024-07-01 15:00:00', 3, 3),

    -- Project 13 (Marketing Launch)
    (40, 'Design High-converting Hero Section',           'Add glowing gradient badges, interactive video and testimonials.',2, 1, '2024-07-15', 13, TRUE, '2024-06-15 10:00:00', '2024-07-12 16:30:00', 5, 5),
    (41, 'SEO Meta Tags, OpenGraph & Sitemap Generation', 'Configure OpenGraph dynamic social cards and robots.txt.',       2, 1, '2024-07-25', 13, TRUE, '2024-06-20 14:00:00', '2024-07-22 11:00:00', 5, 5),

    -- Project 14 (Internal Wiki)
    (42, 'Write Microservices Architecture Blueprint',    'Document clean architecture patterns, repository interfaces.',   1, 1, '2024-08-31', 14, TRUE, '2024-07-01 09:00:00', '2024-07-20 10:00:00', 4, 4),
    (43, 'Write Swagger API Testing Handbook',            'Guide QA team on testing Bearer auth tokens in Swagger UI.',      2, 1, '2024-07-30', 14, TRUE, '2024-07-05 11:00:00', '2024-07-28 14:00:00', 4, 4),

    -- Project 15 (Incident Response)
    (44, 'Configure PagerDuty On-Call Escalation Policies','Integrate Grafana alerts with Slack webhook and phone alerts.',  0, 2, '2024-09-30', 15, TRUE, '2024-07-15 14:00:00', NULL, 1, NULL),
    (45, 'Simulate P1 Outage and Runbook Drill',          'Perform mock database failover drill with engineering team.',     0, 3, '2024-10-15', 15, TRUE, '2024-07-20 16:00:00', NULL, 1, NULL),

    -- Project 16 (Disaster Recovery)
    (46, 'Automated Daily Database Snapshots on S3',      'Schedule cron pg_dump script with KMS envelope encryption.',     0, 3, '2024-09-15', 16, TRUE, '2024-08-01 10:00:00', NULL, 3, NULL),
    (47, 'Test Cross-Region Recovery Point Objective',    'Verify recovery time objective is under 15 minutes.',            0, 3, '2024-10-31', 16, TRUE, '2024-08-05 14:00:00', NULL, 3, NULL),

    -- Additional tasks to showcase diverse states & priorities
    (48, 'Fix Token Refresh Race Condition on Multi-tab', 'Implement broadcast channel sync to prevent concurrent refreshes.',1, 3, '2024-05-18', 3, TRUE, '2024-04-10 10:00:00', '2024-04-20 16:00:00', 3, 3),
    (49, 'Implement Role Badge Color Variant (Admin/Staff)','Add purple badge for Admin and blue badge for Staff in UI.',     2, 1, '2024-04-25', 4, TRUE, '2024-04-15 11:00:00', '2024-04-24 15:00:00', 4, 4),
    (50, 'Build User Profile (/profile) Page in Next.js', 'Allow users to view account details and update their password.',  2, 2, '2024-05-05', 2, TRUE, '2024-04-20 14:00:00', '2024-05-04 17:00:00', 3, 3),
    (51, 'Add Confirmation Dialog Before Deleting Account','Display warning if account has created tasks.',                  2, 2, '2024-05-12', 2, TRUE, '2024-04-22 09:00:00', '2024-05-11 11:00:00', 3, 3),
    (52, 'Set up GitHub Actions CI for Solution & Linting','Verify dotnet build and npm run build execute cleanly on push.', 2, 2, '2024-05-15', 5, TRUE, '2024-04-25 15:00:00', '2024-05-14 16:00:00', 6, 6);
SELECT setval(pg_get_serial_sequence('"Task"', 'TaskID'), (SELECT MAX("TaskID") FROM "Task"));

-- ============================================================
-- SEED: TaskTag (Many-to-Many Mappings - 84 Links)
-- ============================================================
INSERT INTO "TaskTag" ("TaskID", "TagID") VALUES
    -- Task 1: Docker
    (1, 1), (1, 5), (1, 10),
    -- Task 2: ECS Fargate
    (2, 5), (2, 4), (2, 9),
    -- Task 3: Terraform
    (3, 5), (3, 10),
    -- Task 4: Load Balancer
    (4, 5), (4, 4),
    -- Task 5: Sidebar
    (5, 2), (5, 6),
    -- Task 6: Home Dashboard
    (6, 1), (6, 2), (6, 8),
    -- Task 7: Department CRUD
    (7, 2), (7, 6), (7, 8),
    -- Task 8: Project Management
    (8, 2), (8, 6), (8, 8),
    -- Task 9: Task CRUD & Tags
    (9, 2), (9, 8), (9, 9),
    -- Task 10: Omni Search
    (10, 2), (10, 8), (10, 12),
    -- Task 11: Schema
    (11, 3), (11, 4),
    -- Task 12: BCrypt
    (12, 1), (12, 4), (12, 9),
    -- Task 13: JWT Middleware
    (13, 1), (13, 4), (13, 14),
    -- Task 14: Refresh Token
    (14, 1), (14, 4), (14, 8),
    -- Task 15: Protect Endpoints
    (15, 1), (15, 4), (15, 14),
    -- Task 16: RBAC
    (16, 1), (16, 4),
    -- Task 17: Modal System
    (17, 2), (17, 6),
    -- Task 18: Badges
    (18, 2), (18, 6),
    -- Task 19: Dark Mode
    (19, 2), (19, 6),
    -- Task 20: Playwright
    (20, 5), (20, 11),
    -- Task 21: Auth E2E
    (21, 4), (21, 11),
    -- Task 22: Task Form E2E
    (22, 2), (22, 11),
    -- Task 23: 403 Forbidden E2E
    (23, 4), (23, 11),
    -- Task 24: Stripe
    (24, 1), (24, 8), (24, 14),
    -- Task 25: Webhook
    (25, 1), (25, 4), (25, 9),
    -- Task 26: Invoice
    (26, 1), (26, 8),
    -- Task 27: Flutter Shell
    (27, 6), (27, 15),
    -- Task 28: SQLite Sync
    (28, 3), (28, 15),
    -- Task 29: Elasticsearch
    (29, 3), (29, 5),
    -- Task 30: CDC Sync
    (30, 3), (30, 5), (30, 12),
    -- Task 31: Fulltext Search
    (31, 1), (31, 8), (31, 14),
    -- Task 32: Guided Walkthrough
    (32, 2), (32, 6),
    -- Task 33: Sample Data
    (33, 1), (33, 3),
    -- Task 34: Soft Delete
    (34, 1), (34, 3), (34, 4),
    -- Task 35: Data Export
    (35, 1), (35, 4),
    -- Task 36: GraphQL
    (36, 1), (36, 12), (36, 14),
    -- Task 37: Redis Cache
    (37, 1), (37, 5), (37, 12),
    -- Task 38: EF Core Optimizations
    (38, 1), (38, 3), (38, 12),
    -- Task 39: Index Tuning
    (39, 3), (39, 12),
    -- Task 40: Hero Section
    (40, 2), (40, 6),
    -- Task 41: SEO
    (41, 2), (41, 10),
    -- Task 42: Blueprint
    (42, 10), (42, 13),
    -- Task 43: Handbook
    (43, 4), (43, 10), (43, 14),
    -- Task 44: PagerDuty
    (44, 5), (44, 9),
    -- Task 45: Outage Drill
    (45, 5), (45, 9),
    -- Task 46: Snapshots
    (46, 3), (46, 5),
    -- Task 47: DR Test
    (47, 3), (47, 5),
    -- Task 48: Multi-tab Race Condition
    (48, 2), (48, 4), (48, 7),
    -- Task 49: Role Badge
    (49, 2), (49, 6),
    -- Task 50: User Profile
    (50, 2), (50, 4), (50, 8),
    -- Task 51: Delete Account Confirmation
    (51, 2), (51, 4),
    -- Task 52: CI Check
    (52, 5), (52, 10), (52, 11);

-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
SELECT 'SystemAccounts' AS Entity, COUNT(*) AS Total FROM "SystemAccount"
UNION ALL
SELECT 'Departments', COUNT(*) FROM "Department"
UNION ALL
SELECT 'Projects', COUNT(*) FROM "Project"
UNION ALL
SELECT 'Tasks', COUNT(*) FROM "Task"
UNION ALL
SELECT 'Tags', COUNT(*) FROM "Tag"
UNION ALL
SELECT 'TaskTags', COUNT(*) FROM "TaskTag";
