
--  University Management System — Database 
--  Tech of Cambodia
--  Import via phpMyAdmin → Import tab

CREATE DATABASE IF NOT EXISTS `db_ums`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `db_ums`;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- DROP ALL (safe re-import) 
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS gpa_record;
DROP TABLE IF EXISTS final_grade;
DROP TABLE IF EXISTS exam_result;
DROP TABLE IF EXISTS examination;
DROP TABLE IF EXISTS enrollment;
DROP TABLE IF EXISTS admission;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS academic_section;
DROP TABLE IF EXISTS program_course;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS classroom;
DROP TABLE IF EXISTS program;
DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS faculty_academic;
DROP TABLE IF EXISTS sys_user;

-- sys_user 
CREATE TABLE sys_user (
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  email      VARCHAR(120) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  full_name  VARCHAR(120) NOT NULL,
  role       ENUM('admin','registrar','lecturer','staff') NOT NULL DEFAULT 'staff',
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- faculty_academic
CREATE TABLE faculty_academic (
  faculty_id   INT AUTO_INCREMENT PRIMARY KEY,
  faculty_code VARCHAR(10)  NOT NULL UNIQUE,
  faculty_name_en VARCHAR(150) NOT NULL,
  faculty_name_km NVARCHAR(150) NULL,
  dean         VARCHAR(120) NULL,
  established_year YEAR   NULL,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- department 
CREATE TABLE department (
  dept_id      INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id   INT NOT NULL,
  dept_code    VARCHAR(10)  NOT NULL UNIQUE,
  dept_name_en VARCHAR(150) NOT NULL,
  dept_name_km NVARCHAR(150) NULL,
  head         VARCHAR(120) NULL,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES faculty_academic(faculty_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- program 
CREATE TABLE program (
  program_id      INT AUTO_INCREMENT PRIMARY KEY,
  dept_id         INT NOT NULL,
  program_code    VARCHAR(15)  NOT NULL UNIQUE,
  program_name_en VARCHAR(150) NOT NULL,
  program_name_km NVARCHAR(150) NULL,
  degree_level    ENUM('Associate','Bachelor','Master','Doctorate') NOT NULL DEFAULT 'Bachelor',
  duration_years  INT          NOT NULL DEFAULT 4,
  total_credits   INT          NOT NULL DEFAULT 144,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES department(dept_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- classroom 
CREATE TABLE classroom (
  room_id       INT AUTO_INCREMENT PRIMARY KEY,
  room_code     VARCHAR(20)  NOT NULL UNIQUE,
  building      VARCHAR(100) NULL,
  floor         INT          NULL,
  room_type     ENUM('Lecture','Lab','Seminar','Exam Hall','Computer Lab') NOT NULL DEFAULT 'Lecture',
  capacity      INT          NOT NULL,
  has_projector TINYINT(1)   NOT NULL DEFAULT 0,
  has_ac        TINYINT(1)   NOT NULL DEFAULT 0,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- course 
CREATE TABLE course (
  course_id              INT AUTO_INCREMENT PRIMARY KEY,
  dept_id                INT NOT NULL,
  course_code            VARCHAR(15)  NOT NULL UNIQUE,
  course_name_en         VARCHAR(200) NOT NULL,
  course_name_km         NVARCHAR(200) NULL,
  credit_hours           INT          NOT NULL DEFAULT 3 CHECK (credit_hours >= 1),
  lecture_hours          DECIMAL(4,1) NULL,
  lab_hours              DECIMAL(4,1) NOT NULL DEFAULT 0,
  course_level           ENUM('100','200','300','400','500','600') NOT NULL DEFAULT '100',
  course_type            ENUM('Core','Elective','Lab','Thesis') NOT NULL DEFAULT 'Core',
  description            TEXT         NULL,
  prerequisite_course_id INT          NULL,
  is_active              TINYINT(1)   NOT NULL DEFAULT 1,
  created_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES department(dept_id) ON DELETE RESTRICT,
  FOREIGN KEY (prerequisite_course_id) REFERENCES course(course_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- program_course (M:N junction) 
CREATE TABLE program_course (
  program_id       INT NOT NULL,
  course_id        INT NOT NULL,
  semester_offered INT NOT NULL CHECK (semester_offered BETWEEN 1 AND 10),
  is_mandatory     TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (program_id, course_id),
  FOREIGN KEY (program_id) REFERENCES program(program_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES course(course_id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--  academic_section 
CREATE TABLE academic_section (
  section_id        INT AUTO_INCREMENT PRIMARY KEY,
  section_code      VARCHAR(30)  NOT NULL UNIQUE,
  course_id         INT          NOT NULL,
  instructor        VARCHAR(120) NULL,
  academic_year     VARCHAR(10)  NOT NULL,
  semester          ENUM('Semester1','Semester2','Summer') NOT NULL DEFAULT 'Semester1',
  room_id           INT          NULL,
  schedule_day      SET('Mon','Tue','Wed','Thu','Fri','Sat') NULL,
  time_start        TIME         NULL,
  time_end          TIME         NULL,
  capacity          INT          NOT NULL DEFAULT 40,
  enrolled_count    INT          NOT NULL DEFAULT 0,
  delivery_mode     ENUM('In-Person','Online','Hybrid') NOT NULL DEFAULT 'In-Person',
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE RESTRICT,
  FOREIGN KEY (room_id)   REFERENCES classroom(room_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- student 
CREATE TABLE student (
  student_id        INT AUTO_INCREMENT PRIMARY KEY,
  student_code      VARCHAR(20)  NOT NULL UNIQUE,
  national_id       VARCHAR(20)  UNIQUE NULL,
  first_name_en     VARCHAR(80)  NOT NULL,
  last_name_en      VARCHAR(80)  NOT NULL,
  full_name_km      NVARCHAR(200) NULL,
  gender            ENUM('Male','Female','Other') NOT NULL,
  date_of_birth     DATE         NOT NULL,
  nationality       VARCHAR(50)  NULL DEFAULT 'Cambodian',
  email_personal    VARCHAR(120) NOT NULL UNIQUE,
  email_itc         VARCHAR(120) UNIQUE NULL,
  phone             VARCHAR(20)  NULL,
  photo_url         VARCHAR(255) NULL,
  program_id        INT          NOT NULL,
  admission_year    YEAR         NOT NULL,
  current_semester  INT          NOT NULL DEFAULT 1,
  status            ENUM('Active','Graduated','Suspended','Withdrawn','Deferred') NOT NULL DEFAULT 'Active',
  guardian_name     VARCHAR(150) NULL,
  guardian_phone    VARCHAR(20)  NULL,
  guardian_relation VARCHAR(50)  NULL,
  address           TEXT         NULL,
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES program(program_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- admission 
CREATE TABLE admission (
  admission_id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id           INT NOT NULL UNIQUE,
  application_date     DATE NOT NULL,
  admission_date       DATE NOT NULL,
  admission_type       ENUM('National_Exam','Direct','Transfer','International') NOT NULL,
  national_exam_score  DECIMAL(6,2) NULL,
  high_school_name     VARCHAR(200) NULL,
  high_school_gpa      DECIMAL(4,2) NULL,
  documents_verified   TINYINT(1)   NOT NULL DEFAULT 0,
  admitted_by          VARCHAR(100) NULL,
  remarks              TEXT         NULL,
  created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--  enrollment 
CREATE TABLE enrollment (
  enrollment_id   INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL,
  section_id      INT NOT NULL,
  enrollment_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  enrollment_type ENUM('Regular','Retake','Audit') NOT NULL DEFAULT 'Regular',
  status          ENUM('Enrolled','Dropped','Completed','Incomplete') NOT NULL DEFAULT 'Enrolled',
  drop_date       DATE    NULL,
  drop_reason     VARCHAR(200) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_enroll (student_id, section_id),
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES academic_section(section_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--  examination 
CREATE TABLE examination (
  exam_id           INT AUTO_INCREMENT PRIMARY KEY,
  section_id        INT          NOT NULL,
  exam_type         ENUM('Quiz','Midterm','Final','Lab','Assignment','Project') NOT NULL,
  exam_name         VARCHAR(100) NOT NULL,
  exam_date         DATE         NOT NULL,
  duration_minutes  INT          NOT NULL DEFAULT 120,
  total_marks       DECIMAL(6,2) NOT NULL DEFAULT 100.00,
  weight_percent    DECIMAL(5,2) NOT NULL,
  room_id           INT          NULL,
  invigilator       VARCHAR(100) NULL,
  remarks           TEXT         NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES academic_section(section_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id)    REFERENCES classroom(room_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- exam_result 
CREATE TABLE exam_result (
  result_id      INT AUTO_INCREMENT PRIMARY KEY,
  exam_id        INT          NOT NULL,
  student_id     INT          NOT NULL,
  marks_obtained DECIMAL(6,2) NOT NULL DEFAULT 0,
  is_absent      TINYINT(1)   NOT NULL DEFAULT 0,
  remarks        VARCHAR(200) NULL,
  entered_by     VARCHAR(100) NULL,
  entry_date     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_result (exam_id, student_id),
  FOREIGN KEY (exam_id)    REFERENCES examination(exam_id)  ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student(student_id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- final_grade 
CREATE TABLE final_grade (
  grade_id              INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id         INT          NOT NULL UNIQUE,
  total_weighted_score  DECIMAL(6,2) NOT NULL,
  letter_grade          CHAR(2)      NOT NULL,
  grade_point           DECIMAL(3,2) NOT NULL,
  is_passed             TINYINT(1)   NOT NULL DEFAULT 0,
  is_finalized          TINYINT(1)   NOT NULL DEFAULT 0,
  finalized_by          VARCHAR(100) NULL,
  finalized_at          TIMESTAMP    NULL,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollment(enrollment_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- gpa_record 
CREATE TABLE gpa_record (
  gpa_id            INT AUTO_INCREMENT PRIMARY KEY,
  student_id        INT NOT NULL,
  academic_year     VARCHAR(10) NOT NULL,
  semester          ENUM('Semester1','Semester2','Summer') NOT NULL,
  credits_attempted INT          NOT NULL DEFAULT 0,
  credits_earned    INT          NOT NULL DEFAULT 0,
  semester_gpa      DECIMAL(4,3) NOT NULL DEFAULT 0.000,
  cumulative_gpa    DECIMAL(4,3) NOT NULL DEFAULT 0.000,
  academic_standing ENUM('Excellent','Good Standing','Warning','Probation','Suspension Risk') NOT NULL DEFAULT 'Good Standing',
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_gpa (student_id, academic_year, semester),
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- audit_log 
CREATE TABLE audit_log (
  log_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NULL,
  action      VARCHAR(100) NOT NULL,
  table_name  VARCHAR(60)  NULL,
  record_id   INT          NULL,
  details     TEXT         NULL,
  ip_address  VARCHAR(45)  NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES sys_user(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- attendance 
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id   INT AUTO_INCREMENT PRIMARY KEY,
  section_id      INT          NOT NULL,
  student_id      INT          NOT NULL,
  attendance_date DATE         NOT NULL,
  status          ENUM('Present','Absent','Late','Excused') NOT NULL DEFAULT 'Present',
  remarks         VARCHAR(200) NULL,
  marked_by       INT          NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attend (section_id, student_id, attendance_date),
  FOREIGN KEY (section_id)  REFERENCES academic_section(section_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id)  REFERENCES student(student_id)          ON DELETE CASCADE,
  FOREIGN KEY (marked_by)   REFERENCES sys_user(user_id)            ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INDEXES 
CREATE INDEX idx_student_code     ON student(student_code);
CREATE INDEX idx_student_program  ON student(program_id);
CREATE INDEX idx_student_status   ON student(status);
CREATE INDEX idx_enroll_student   ON enrollment(student_id);
CREATE INDEX idx_enroll_section   ON enrollment(section_id);
CREATE INDEX idx_enroll_status    ON enrollment(status);
CREATE INDEX idx_section_course   ON academic_section(course_id);
CREATE INDEX idx_section_year_sem ON academic_section(academic_year, semester);
CREATE INDEX idx_exam_section     ON examination(section_id);
CREATE INDEX idx_result_student   ON exam_result(student_id);
CREATE INDEX idx_gpa_student      ON gpa_record(student_id);
CREATE INDEX idx_gpa_standing     ON gpa_record(academic_standing);
CREATE INDEX idx_course_dept      ON course(dept_id);
CREATE INDEX idx_dept_faculty     ON department(faculty_id);

SET FOREIGN_KEY_CHECKS = 1;

-- SEED DATA
-- Password for all users: Admin@123
INSERT INTO sys_user (username,email,password,full_name,role) VALUES
('admin',    'admin@itc.edu.kh',  '$2y$10$cddkRbOIjb1y6z6PbVmp6uJ5ywp6ZbII7GlSgKrlZ35ZEHkaSmHGa','Administrator',   'admin'),
('registrar','reg@itc.edu.kh',   '$2y$10$0giwzY8dmAiyYf0.4YzxseL3a7dpVlEA.WG4m43UUi8Gcy1t40pvG','Registrar Office','registrar'),
('lecturer1','lec1@itc.edu.kh',  '$2y$10$EoKCtaw1GjX0Ae8b5Dgs0.Nry0bU58jqS7pjogZZwslr5DHhGJiiO','Dr. Sokha Chan',  'lecturer'),
('staff1',   'staff1@itc.edu.kh','$2y$10$0LlHRXzPBsG9hj04KFhVcuIXPcc04fm74tT4SiJykF2qIVLM7VHZK','Staff One',       'staff');

INSERT INTO faculty_academic (faculty_code,faculty_name_en,faculty_name_km,dean,established_year) VALUES
('FITE', 'Faculty of Information Technology & Engineering','មហាវិទ្យាល័យបច្ចេកវិទ្យាព័ត៌មាន', 'Prof. Dr. Chenda Sok', 2002),
('FGCE', 'Faculty of Civil Engineering',                   'មហាវិទ្យាល័យវិស្វកម្មសំណង់',        'Prof. Dr. Phanith Keo',2003),
('FMEC', 'Faculty of Mechanical & Electrical Engineering', 'មហាវិទ្យាល័យវិស្វកម្មម៉ាស៊ីន',       'Prof. Dr. Ratha Lim', 2003),
('FSCI', 'Faculty of Science & Applied Mathematics',       'មហាវិទ្យាល័យវិទ្យាសាស្ត្រ',          'Prof. Dr. Vanna Heng', 2004);

INSERT INTO department (faculty_id,dept_code,dept_name_en,head) VALUES
(1,'ITE', 'Information Technology Engineering',    'Dr. Borin Pich'),
(1,'CSE', 'Computer Science & Engineering',        'Dr. Sophea Mao'),
(2,'CVE', 'Civil Engineering',                     'Dr. Ratanak Keo'),
(2,'ARC', 'Architecture',                          'Dr. Nary Sok'),
(3,'MEC', 'Mechanical Engineering',                'Dr. Piseth Chan'),
(3,'ELE', 'Electrical & Electronics Engineering',  'Dr. Dara Heng'),
(4,'MAT', 'Applied Mathematics',                   'Dr. Lina Chhun'),
(4,'PHY', 'Physics',                               'Dr. Sreyka Lim');

INSERT INTO program (dept_id,program_code,program_name_en,degree_level,duration_years,total_credits) VALUES
(1,'ITE-B', 'Bachelor of Information Technology Engineering','Bachelor',5,180),
(2,'CSE-B', 'Bachelor of Computer Science & Engineering',    'Bachelor',5,180),
(3,'CVE-B', 'Bachelor of Civil Engineering',                 'Bachelor',5,180),
(4,'ARC-B', 'Bachelor of Architecture',                      'Bachelor',5,180),
(5,'MEC-B', 'Bachelor of Mechanical Engineering',            'Bachelor',5,180),
(6,'ELE-B', 'Bachelor of Electrical Engineering',            'Bachelor',5,180),
(1,'ITE-M', 'Master of Information Technology',              'Master',  2,60),
(2,'CSE-M', 'Master of Computer Science',                    'Master',  2,60);

INSERT INTO classroom (room_code,building,floor,room_type,capacity,has_projector,has_ac) VALUES
('B101','Block B',1,'Lecture',50,1,1),
('B102','Block B',1,'Lecture',50,1,1),
('B201','Block B',2,'Seminar',30,1,1),
('B202','Block B',2,'Seminar',30,1,0),
('C101','Block C',1,'Lab',40,1,1),
('C102','Block C',1,'Computer Lab',35,1,1),
('C201','Block C',2,'Lab',40,1,1),
('D101','Block D',1,'Exam Hall',120,0,1),
('D102','Block D',1,'Exam Hall',120,0,1),
('A100','Block A',1,'Lecture',200,1,1);

INSERT INTO course (dept_id,course_code,course_name_en,credit_hours,lab_hours,course_level,course_type,description) VALUES
(1,'ITE101','Introduction to Programming',         3,1,'100','Core',  'Fundamentals of programming with C and Python'),
(1,'ITE102','Computer Organization & Architecture',3,0,'100','Core',  'CPU, memory hierarchy, assembly language basics'),
(1,'ITE201','Data Structures & Algorithms',        3,1,'200','Core',  'Arrays, linked lists, trees, graphs, sorting algorithms'),
(1,'ITE202','Operating Systems',                   3,1,'200','Core',  'Process management, memory, file systems, concurrency'),
(1,'ITE301','Database Systems',                    3,1,'300','Core',  'Relational model, SQL, normalization, transactions'),
(1,'ITE302','Computer Networks',                   3,1,'300','Core',  'OSI model, TCP/IP, routing, switching, network security'),
(1,'ITE401','Software Engineering',                3,0,'400','Core',  'SDLC, design patterns, agile, UML, testing'),
(1,'ITE402','Artificial Intelligence',             3,1,'400','Elective','Search, knowledge representation, ML fundamentals'),
(1,'ITE501','Cybersecurity',                       3,1,'500','Elective','Threats, encryption, ethical hacking, compliance'),
(1,'ITE502','Cloud Computing',                     3,1,'500','Elective','AWS/Azure fundamentals, containers, microservices'),
(2,'CSE101','Discrete Mathematics',                3,0,'100','Core',  'Logic, sets, relations, graph theory, combinatorics'),
(2,'CSE201','Object-Oriented Programming',         3,1,'200','Core',  'Java OOP, inheritance, polymorphism, design patterns'),
(2,'CSE301','Web Development',                     3,2,'300','Core',  'HTML, CSS, JavaScript, PHP, RESTful API design'),
(2,'CSE401','Machine Learning',                    3,1,'400','Elective','Supervised/unsupervised learning, neural networks'),
(7,'MAT101','Calculus I',                          3,0,'100','Core',  'Limits, derivatives, integrals, applications'),
(7,'MAT102','Linear Algebra',                      3,0,'100','Core',  'Vectors, matrices, eigenvalues, linear transformations'),
(7,'MAT201','Calculus II',                         3,0,'200','Core',  'Multivariable calculus, series, differential equations'),
(7,'MAT301','Probability & Statistics',            3,0,'300','Core',  'Probability distributions, hypothesis testing, regression');

-- Set prerequisites
UPDATE course SET prerequisite_course_id=(SELECT course_id FROM (SELECT course_id FROM course WHERE course_code='ITE101') t) WHERE course_code='ITE201';
UPDATE course SET prerequisite_course_id=(SELECT course_id FROM (SELECT course_id FROM course WHERE course_code='ITE201') t) WHERE course_code='ITE301';
UPDATE course SET prerequisite_course_id=(SELECT course_id FROM (SELECT course_id FROM course WHERE course_code='MAT101') t) WHERE course_code='MAT201';

INSERT INTO student (student_code,first_name_en,last_name_en,full_name_km,gender,date_of_birth,nationality,email_personal,email_itc,phone,program_id,admission_year,current_semester,status,address) VALUES
('e20210001','Sokha',  'Chan',   'ចាន់ សុខា',   'Male',  '2002-03-15','Cambodian','sokha.chan@gmail.com',  'e20210001@itc.edu.kh','012345671',1,2021,7,'Active','Phnom Penh'),
('e20210002','Sreymom','Pich',   'ពិច ស្រីមម',  'Female','2002-07-22','Cambodian','sreymom.p@gmail.com',   'e20210002@itc.edu.kh','012345672',1,2021,7,'Active','Siem Reap'),
('e20210003','Piseth', 'Keo',    'កែវ ពិសិទ្ធ', 'Male',  '2003-01-10','Cambodian','piseth.keo@gmail.com',  'e20210003@itc.edu.kh','012345673',2,2021,7,'Active','Battambang'),
('e20210004','Chanthy','Lim',    'លីម ច័ន្ទធី',  'Female','2001-11-05','Cambodian','chanthy.lim@gmail.com', 'e20210004@itc.edu.kh','012345674',1,2021,7,'Active','Kampong Cham'),
('e20220001','Ratha',  'Heng',   'ហេង រតនា',    'Male',  '2003-08-30','Cambodian','ratha.heng@gmail.com',  'e20220001@itc.edu.kh','012345675',1,2022,5,'Active','Phnom Penh'),
('e20220002','Nary',   'Sok',    'សុក ណារី',    'Female','2003-04-18','Cambodian','nary.sok@gmail.com',    'e20220002@itc.edu.kh','012345676',2,2022,5,'Active','Kandal'),
('e20220003','Dara',   'Mao',    'មៅ ដារ៉ា',    'Male',  '2003-06-25','Cambodian','dara.mao@gmail.com',    'e20220003@itc.edu.kh','012345677',2,2022,5,'Active','Takeo'),
('e20220004','Bopha',  'Seng',   'សេង បុប្ផា',  'Female','2003-09-12','Cambodian','bopha.seng@gmail.com',  'e20220004@itc.edu.kh','012345678',3,2022,5,'Active','Prey Veng'),
('e20230001','Kimhak', 'Touch',  'ទូច គឹមហាក',  'Male',  '2004-12-20','Cambodian','kimhak.t@gmail.com',   'e20230001@itc.edu.kh','012345679',1,2023,3,'Active','Phnom Penh'),
('e20230002','Sokunthy','Nov',   'ណូវ សុគុណធី', 'Female','2004-02-14','Cambodian','sokunthy.n@gmail.com',  'e20230002@itc.edu.kh','012345680',1,2023,3,'Active','Phnom Penh'),
('e20230003','Visal',  'Ith',    'អ៊ីត វិសាល',  'Male',  '2004-05-20','Cambodian','visal.ith@gmail.com',   'e20230003@itc.edu.kh','012345681',2,2023,3,'Active','Kampot'),
('e20230004','Leakhena','Khun',  'ខុន លក្ខិណា', 'Female','2003-08-15','Cambodian','leakhena.k@gmail.com',  'e20230004@itc.edu.kh','012345682',3,2023,3,'Active','Sihanoukville'),
('e20230005','Menghong','Ros',   'រស់ ម៉េងហុង', 'Male',  '2004-03-08','Cambodian','menghong.r@gmail.com',  'e20230005@itc.edu.kh','012345683',1,2023,3,'Active','Phnom Penh'),
('e20240001','Sreynich','Ung',   'អ៊ុង ស្រីនិច', 'Female','2005-11-25','Cambodian','sreynich.u@gmail.com',  'e20240001@itc.edu.kh','012345684',1,2024,1,'Active','Phnom Penh'),
('e20240002','Botum',  'Sim',    'ស៊ីម បូទុំ',  'Female','2005-07-14','Cambodian','botum.sim@gmail.com',   'e20240002@itc.edu.kh','012345685',2,2024,1,'Active','Kompong Thom'),
('e20210005','Pheakdey','Vong',  'វង់ ភ័ក្ដី',  'Male',  '2001-09-01','Cambodian','pheakdey.v@gmail.com',  'e20210005@itc.edu.kh','012345686',1,2021,7,'Suspended','Phnom Penh'),
('e20200001','Sreyleak','Khem',  'ខែម ស្រីលក្ខ','Female','2000-04-22','Cambodian','sreyleak.k@gmail.com',  'e20200001@itc.edu.kh','012345687',1,2020,9,'Active','Phnom Penh'),
('e20200002','Bunthoeun','Prum', 'ប្រម បុណ្យធឿន','Male', '2000-11-11','Cambodian','bunthoeun.p@gmail.com', 'e20200002@itc.edu.kh','012345688',2,2020,9,'Graduated','Siem Reap');

INSERT INTO admission (student_id,application_date,admission_date,admission_type,national_exam_score,documents_verified,admitted_by) VALUES
(1, '2021-07-01','2021-09-01','National_Exam',85.50,1,'Registrar Office'),
(2, '2021-07-01','2021-09-01','National_Exam',82.00,1,'Registrar Office'),
(3, '2021-07-02','2021-09-01','National_Exam',78.50,1,'Registrar Office'),
(4, '2021-07-02','2021-09-01','National_Exam',90.00,1,'Registrar Office'),
(5, '2022-07-01','2022-09-01','National_Exam',83.00,1,'Registrar Office'),
(6, '2022-07-01','2022-09-01','National_Exam',79.50,1,'Registrar Office'),
(7, '2022-07-02','2022-09-01','National_Exam',76.00,1,'Registrar Office'),
(8, '2022-07-02','2022-09-01','Direct',        NULL, 1,'Registrar Office'),
(9, '2023-07-01','2023-09-01','National_Exam',88.00,1,'Registrar Office'),
(10,'2023-07-01','2023-09-01','National_Exam',85.50,1,'Registrar Office'),
(11,'2023-07-02','2023-09-01','National_Exam',74.00,1,'Registrar Office'),
(12,'2023-07-02','2023-09-01','National_Exam',81.50,1,'Registrar Office'),
(13,'2023-07-03','2023-09-01','National_Exam',77.00,1,'Registrar Office'),
(14,'2024-07-01','2024-09-01','National_Exam',92.00,1,'Registrar Office'),
(15,'2024-07-01','2024-09-01','National_Exam',87.50,1,'Registrar Office'),
(16,'2021-07-03','2021-09-01','National_Exam',70.00,1,'Registrar Office'),
(17,'2020-07-01','2020-09-01','National_Exam',88.00,1,'Registrar Office'),
(18,'2020-07-01','2020-09-01','National_Exam',82.00,1,'Registrar Office');

INSERT INTO academic_section (section_code,course_id,instructor,academic_year,semester,room_id,schedule_day,time_start,time_end,capacity,delivery_mode) VALUES
('ITE301-A-2024S1',5, 'Dr. Borin Pich',   '2024-2025','Semester1',1,'Mon,Wed','07:30:00','09:00:00',45,'In-Person'),
('ITE301-B-2024S1',5, 'Dr. Borin Pich',   '2024-2025','Semester1',2,'Tue,Thu','07:30:00','09:00:00',45,'In-Person'),
('ITE201-A-2024S1',3, 'Dr. Sophea Mao',   '2024-2025','Semester1',1,'Mon,Wed','09:15:00','10:45:00',45,'In-Person'),
('ITE402-A-2024S1',8, 'Dr. Sokha Chan',   '2024-2025','Semester1',3,'Tue,Thu','09:15:00','10:45:00',30,'In-Person'),
('ITE401-A-2024S1',7, 'Dr. Borin Pich',   '2024-2025','Semester1',3,'Fri',    '07:30:00','10:30:00',30,'In-Person'),
('CSE301-A-2024S1',13,'Dr. Sophea Mao',   '2024-2025','Semester1',6,'Mon,Wed','13:00:00','14:30:00',35,'In-Person'),
('MAT301-A-2024S1',18,'Dr. Lina Chhun',   '2024-2025','Semester1',2,'Tue,Thu','13:00:00','14:30:00',40,'In-Person'),
('ITE501-A-2024S1',9, 'Dr. Dara Heng',    '2024-2025','Semester1',5,'Thu',    '13:00:00','16:00:00',30,'In-Person'),
('ITE101-A-2024S1',1, 'Dr. Sokha Chan',   '2024-2025','Semester1',1,'Mon,Wed','15:00:00','16:30:00',45,'In-Person'),
('MAT101-A-2024S1',15,'Dr. Lina Chhun',   '2024-2025','Semester1',2,'Tue,Thu','15:00:00','16:30:00',50,'In-Person');

INSERT INTO enrollment (student_id,section_id,enrollment_date,enrollment_type,status) VALUES
(1,1,'2024-09-02','Regular','Enrolled'),
(2,1,'2024-09-02','Regular','Enrolled'),
(3,2,'2024-09-02','Regular','Enrolled'),
(4,1,'2024-09-02','Regular','Enrolled'),
(17,1,'2024-09-02','Regular','Enrolled'),
(1,3,'2024-09-02','Regular','Enrolled'),
(2,3,'2024-09-02','Regular','Enrolled'),
(4,3,'2024-09-02','Regular','Enrolled'),
(5,4,'2024-09-02','Regular','Enrolled'),
(6,4,'2024-09-02','Regular','Enrolled'),
(7,4,'2024-09-02','Regular','Enrolled'),
(1,5,'2024-09-02','Regular','Enrolled'),
(2,5,'2024-09-02','Regular','Enrolled'),
(3,5,'2024-09-02','Regular','Enrolled'),
(5,6,'2024-09-02','Regular','Enrolled'),
(6,6,'2024-09-02','Regular','Enrolled'),
(9,9,'2024-09-02','Regular','Enrolled'),
(10,9,'2024-09-02','Regular','Enrolled'),
(13,9,'2024-09-02','Regular','Enrolled'),
(14,10,'2024-09-02','Regular','Enrolled'),
(15,10,'2024-09-02','Regular','Enrolled');

-- Update enrolled_count
UPDATE academic_section SET enrolled_count=(SELECT COUNT(*) FROM enrollment WHERE section_id=academic_section.section_id AND status='Enrolled');

INSERT INTO examination (section_id,exam_type,exam_name,exam_date,duration_minutes,total_marks,weight_percent,room_id,invigilator) VALUES
(1,'Assignment','Lab Assignment 1',  '2024-10-15',120,20,10,NULL,'Dr. Borin Pich'),
(1,'Midterm',   'Midterm Examination','2024-11-10',120,100,40,8, 'Dr. Borin Pich'),
(1,'Final',     'Final Examination',  '2025-01-20',180,100,50,8, 'Dr. Borin Pich'),
(2,'Assignment','Lab Assignment 1',  '2024-10-16',120,20,10,NULL,'Dr. Borin Pich'),
(2,'Midterm',   'Midterm Examination','2024-11-11',120,100,40,9, 'Dr. Borin Pich'),
(2,'Final',     'Final Examination',  '2025-01-21',180,100,50,9, 'Dr. Borin Pich'),
(3,'Quiz',      'Quiz 1',            '2024-10-20', 30, 20,10,NULL,'Dr. Sophea Mao'),
(3,'Midterm',   'Midterm Examination','2024-11-12',120,100,40,8, 'Dr. Sophea Mao'),
(3,'Final',     'Final Examination',  '2025-01-22',180,100,50,8, 'Dr. Sophea Mao'),
(5,'Assignment','Project Proposal',  '2024-10-25',  0, 20,10,NULL,'Dr. Borin Pich'),
(5,'Midterm',   'Midterm Examination','2024-11-14',120,100,40,8, 'Dr. Borin Pich'),
(5,'Final',     'Final Examination',  '2025-01-24',180,100,50,8, 'Dr. Borin Pich');

INSERT INTO exam_result (exam_id,student_id,marks_obtained,entered_by) VALUES
(1,1,18,'Dr. Borin Pich'),(1,2,16,'Dr. Borin Pich'),(1,4,19,'Dr. Borin Pich'),(1,17,15,'Dr. Borin Pich'),
(2,1,82,'Dr. Borin Pich'),(2,2,75,'Dr. Borin Pich'),(2,4,90,'Dr. Borin Pich'),(2,17,60,'Dr. Borin Pich'),
(3,1,85,'Dr. Borin Pich'),(3,2,78,'Dr. Borin Pich'),(3,4,92,'Dr. Borin Pich'),(3,17,55,'Dr. Borin Pich'),
(7,1,17,'Dr. Sophea Mao'),(7,2,15,'Dr. Sophea Mao'),(7,4,18,'Dr. Sophea Mao'),
(8,1,88,'Dr. Sophea Mao'),(8,2,72,'Dr. Sophea Mao'),(8,4,91,'Dr. Sophea Mao'),
(9,1,86,'Dr. Sophea Mao'),(9,2,76,'Dr. Sophea Mao'),(9,4,93,'Dr. Sophea Mao'),
(10,1,18,'Dr. Borin Pich'),(10,2,16,'Dr. Borin Pich'),(10,3,19,'Dr. Borin Pich'),
(11,1,80,'Dr. Borin Pich'),(11,2,74,'Dr. Borin Pich'),(11,3,88,'Dr. Borin Pich'),
(12,1,84,'Dr. Borin Pich'),(12,2,78,'Dr. Borin Pich'),(12,3,90,'Dr. Borin Pich');

-- Final grades: ITE301-A students
INSERT INTO final_grade (enrollment_id,total_weighted_score,letter_grade,grade_point,is_passed,is_finalized) VALUES
(1, 84.50,'B', 3.0,1,1),
(2, 76.80,'C+',2.5,1,1),
(4, 91.20,'A', 4.0,1,1),
(5, 59.00,'D', 1.0,1,1);

-- Final grades: ITE201-A students
INSERT INTO final_grade (enrollment_id,total_weighted_score,letter_grade,grade_point,is_passed,is_finalized) VALUES
(6, 86.30,'B', 3.0,1,1),
(7, 74.20,'C+',2.5,1,1),
(8, 92.10,'A', 4.0,1,1);

-- Final grades: ITE401-A students
INSERT INTO final_grade (enrollment_id,total_weighted_score,letter_grade,grade_point,is_passed,is_finalized) VALUES
(12,83.00,'B', 3.0,1,0),
(13,76.20,'C+',2.5,1,0),
(14,89.60,'A', 4.0,1,0);

-- GPA records
INSERT INTO gpa_record (student_id,academic_year,semester,credits_attempted,credits_earned,semester_gpa,cumulative_gpa,academic_standing) VALUES
(1,'2024-2025','Semester1',9,9,3.333,3.500,'Excellent'),
(2,'2024-2025','Semester1',9,9,2.667,2.800,'Good Standing'),
(4,'2024-2025','Semester1',9,9,3.667,3.750,'Excellent'),
(5,'2024-2025','Semester1',1,1,0.500,1.200,'Warning'),
(17,'2024-2025','Semester1',3,3,1.000,2.100,'Warning');