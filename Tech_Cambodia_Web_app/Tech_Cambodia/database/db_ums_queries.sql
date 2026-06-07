
--  db_ums  —  CRUD OPERATIONS & ADVANCED QUERIES
--  University Management System  |  Tech Cambodia

--  SECTION 1 : CRUD OPERATIONS
-- 1.1  sys_user

-- CREATE
INSERT INTO sys_user (username, email, password, full_name, role)
VALUES ('lecturer2', 'lec2@itc.edu.kh',
        '$2y$10$examplehashedpassword', 'Dr. Dara Pich', 'lecturer');

-- READ
SELECT user_id, username, full_name, role, is_active, created_at
FROM   sys_user
WHERE  is_active = 1
ORDER  BY role, full_name;

-- UPDATE – deactivate a user
UPDATE sys_user
SET    is_active = 0, updated_at = CURRENT_TIMESTAMP
WHERE  username = 'lecturer2';

-- DELETE (soft-delete already covered by is_active; hard delete below)
DELETE FROM sys_user WHERE username = 'lecturer2' AND is_active = 0;


-- 1.2  student

-- CREATE
INSERT INTO student (
    student_code, first_name_en, last_name_en, full_name_km,
    gender, date_of_birth, email_personal, email_itc, phone,
    program_id, admission_year, current_semester, status, address
) VALUES (
    'e20250001', 'Menghak', 'Prum', 'ប្រម ម៉េងហាក',
    'Male', '2005-05-10', 'menghak.p@gmail.com', 'e20250001@itc.edu.kh',
    '012999001', 1, 2025, 1, 'Active', 'Phnom Penh'
);

-- READ – full student profile with program & faculty
SELECT s.student_code,
       CONCAT(s.first_name_en, ' ', s.last_name_en) AS full_name_en,
       s.gender, s.date_of_birth, s.status,
       p.program_name_en, p.degree_level,
       d.dept_name_en,
       f.faculty_name_en
FROM   student        s
JOIN   program        p ON p.program_id  = s.program_id
JOIN   department     d ON d.dept_id     = p.dept_id
JOIN   faculty_academic f ON f.faculty_id = d.faculty_id
WHERE  s.student_code = 'e20250001';

-- UPDATE – advance semester
UPDATE student
SET    current_semester = current_semester + 1,
       updated_at = CURRENT_TIMESTAMP
WHERE  student_code = 'e20250001';

-- UPDATE – change status to Graduated
UPDATE student
SET    status = 'Graduated', updated_at = CURRENT_TIMESTAMP
WHERE  student_code = 'e20200002';

-- DELETE
DELETE FROM student WHERE student_code = 'e20250001';

-- 1.3  enrollment

-- CREATE – enroll a student in a section
INSERT INTO enrollment (student_id, section_id, enrollment_date, enrollment_type, status)
SELECT s.student_id, sec.section_id, CURDATE(), 'Regular', 'Enrolled'
FROM   student          s
JOIN   academic_section sec ON sec.section_code = 'ITE301-A-2024S1'
WHERE  s.student_code = 'e20230001';

-- Increment enrolled_count
UPDATE academic_section
SET    enrolled_count = enrolled_count + 1
WHERE  section_code = 'ITE301-A-2024S1';

-- READ – all sections a student is enrolled in
SELECT sec.section_code, c.course_code, c.course_name_en,
       sec.instructor, sec.academic_year, sec.semester,
       e.enrollment_type, e.status AS enroll_status
FROM   enrollment       e
JOIN   academic_section sec ON sec.section_id = e.section_id
JOIN   course           c   ON c.course_id    = sec.course_id
JOIN   student          s   ON s.student_id   = e.student_id
WHERE  s.student_code = 'e20210001'
ORDER  BY sec.academic_year, sec.semester;

-- UPDATE – drop a course
UPDATE enrollment
SET    status = 'Dropped', drop_date = CURDATE(),
       drop_reason = 'Medical leave', updated_at = CURRENT_TIMESTAMP
WHERE  student_id  = (SELECT student_id FROM student WHERE student_code = 'e20230001')
  AND  section_id  = (SELECT section_id FROM academic_section WHERE section_code = 'ITE301-A-2024S1');

-- DELETE – remove an enrollment record
DELETE FROM enrollment
WHERE  student_id = (SELECT student_id FROM student WHERE student_code = 'e20230001')
  AND  section_id = (SELECT section_id FROM academic_section WHERE section_code = 'ITE301-A-2024S1');


-- 1.4  exam_result

-- CREATE
INSERT INTO exam_result (exam_id, student_id, marks_obtained, entered_by)
VALUES (3, 9, 78.00, 'Dr. Borin Pich');

-- READ – all results for a student in a given section
SELECT ex.exam_type, ex.exam_name, ex.exam_date,
       er.marks_obtained, ex.total_marks,
       ROUND(er.marks_obtained / ex.total_marks * 100, 2) AS pct,
       ex.weight_percent
FROM   exam_result      er
JOIN   examination      ex ON ex.exam_id    = er.exam_id
JOIN   academic_section sec ON sec.section_id = ex.section_id
JOIN   student          s   ON s.student_id   = er.student_id
WHERE  s.student_code  = 'e20210001'
  AND  sec.section_code = 'ITE301-A-2024S1'
ORDER  BY ex.exam_date;

-- UPDATE – correct a mark
UPDATE exam_result
SET    marks_obtained = 80.00
WHERE  exam_id = 3 AND student_id = 9;

-- DELETE
DELETE FROM exam_result WHERE exam_id = 3 AND student_id = 9;


-- 1.5  final_grade

-- CREATE – compute & insert weighted score then assign letter grade
INSERT INTO final_grade (enrollment_id, total_weighted_score,
                         letter_grade, grade_point, is_passed, is_finalized)
SELECT e.enrollment_id,
       ROUND(
           SUM( (er.marks_obtained / ex.total_marks) * ex.weight_percent ), 2
       )                                   AS total_weighted_score,
       CASE
           WHEN SUM((er.marks_obtained/ex.total_marks)*ex.weight_percent) >= 90 THEN 'A'
           WHEN SUM((er.marks_obtained/ex.total_marks)*ex.weight_percent) >= 80 THEN 'B'
           WHEN SUM((er.marks_obtained/ex.total_marks)*ex.weight_percent) >= 70 THEN 'C+'
           WHEN SUM((er.marks_obtained/ex.total_marks)*ex.weight_percent) >= 60 THEN 'C'
           WHEN SUM((er.marks_obtained/ex.total_marks)*ex.weight_percent) >= 50 THEN 'D'
           ELSE 'F'
       END                                 AS letter_grade,
       CASE
           WHEN SUM((er.marks_obtained/ex.total_marks)*ex.weight_percent) >= 90 THEN 4.0
           WHEN SUM((er.marks_obtained/ex.total_marks)*ex.weight_percent) >= 80 THEN 3.0
           WHEN SUM((er.marks_obtained/ex.total_marks)*ex.weight_percent) >= 70 THEN 2.5
           WHEN SUM((er.marks_obtained/ex.total_marks)*ex.weight_percent) >= 60 THEN 2.0
           WHEN SUM((er.marks_obtained/ex.total_marks)*ex.weight_percent) >= 50 THEN 1.0
           ELSE 0.0
       END                                 AS grade_point,
       IF(SUM((er.marks_obtained/ex.total_marks)*ex.weight_percent) >= 50, 1, 0),
       0
FROM   enrollment       e
JOIN   academic_section sec ON sec.section_id = e.section_id
JOIN   examination      ex  ON ex.section_id  = sec.section_id
JOIN   exam_result      er  ON er.exam_id = ex.exam_id AND er.student_id = e.student_id
WHERE  e.enrollment_id = 17
GROUP  BY e.enrollment_id;

-- READ
SELECT s.student_code,
       CONCAT(s.first_name_en, ' ', s.last_name_en) AS student_name,
       c.course_code, c.course_name_en,
       fg.total_weighted_score, fg.letter_grade, fg.grade_point,
       fg.is_passed, fg.is_finalized
FROM   final_grade fg
JOIN   enrollment       e   ON e.enrollment_id  = fg.enrollment_id
JOIN   student          s   ON s.student_id     = e.student_id
JOIN   academic_section sec ON sec.section_id   = e.section_id
JOIN   course           c   ON c.course_id      = sec.course_id
ORDER  BY s.student_code, c.course_code;

-- UPDATE – finalize grades
UPDATE final_grade fg
JOIN   enrollment e ON e.enrollment_id = fg.enrollment_id
JOIN   academic_section sec ON sec.section_id = e.section_id
SET    fg.is_finalized = 1,
       fg.finalized_by = 'Registrar Office',
       fg.finalized_at = CURRENT_TIMESTAMP,
       fg.updated_at   = CURRENT_TIMESTAMP
WHERE  sec.section_code = 'ITE401-A-2024S1';

-- DELETE – remove a grade record
DELETE FROM final_grade WHERE enrollment_id = 17;

-- 1.6  attendance

-- CREATE – mark attendance for a class day
INSERT INTO attendance (section_id, student_id, attendance_date, status, marked_by)
SELECT e.section_id, e.student_id, '2024-10-28', 'Present', 1
FROM   enrollment e
WHERE  e.section_id = 1 AND e.status = 'Enrolled';

-- READ – attendance summary per student per section
SELECT s.student_code,
       CONCAT(s.first_name_en, ' ', s.last_name_en) AS name,
       COUNT(*)                                        AS total_sessions,
       SUM(a.status = 'Present')                       AS present,
       SUM(a.status = 'Absent')                        AS absent,
       SUM(a.status = 'Late')                          AS late,
       ROUND(SUM(a.status='Present')*100.0/COUNT(*),1) AS attendance_pct
FROM   attendance       a
JOIN   student          s   ON s.student_id   = a.student_id
WHERE  a.section_id = 1
GROUP  BY s.student_id
ORDER  BY attendance_pct DESC;

-- UPDATE – change Absent to Excused
UPDATE attendance
SET    status = 'Excused', remarks = 'Medical certificate submitted',
       updated_at = CURRENT_TIMESTAMP
WHERE  section_id = 1 AND student_id = 2 AND attendance_date = '2024-10-28';

-- DELETE – remove a wrongly-entered record
DELETE FROM attendance
WHERE  section_id = 1 AND student_id = 2 AND attendance_date = '2024-10-28';


-- 1.7  gpa_record

-- CREATE
INSERT INTO gpa_record (student_id, academic_year, semester,
    credits_attempted, credits_earned, semester_gpa, cumulative_gpa, academic_standing)
VALUES (3, '2024-2025', 'Semester1', 9, 9, 3.167, 3.167, 'Good Standing');

-- READ
SELECT s.student_code,
       CONCAT(s.first_name_en,' ',s.last_name_en) AS name,
       g.academic_year, g.semester,
       g.credits_attempted, g.credits_earned,
       g.semester_gpa, g.cumulative_gpa, g.academic_standing
FROM   gpa_record g
JOIN   student    s ON s.student_id = g.student_id
ORDER  BY s.student_code, g.academic_year, g.semester;

-- UPDATE
UPDATE gpa_record
SET    cumulative_gpa = 3.400, academic_standing = 'Excellent',
       updated_at = CURRENT_TIMESTAMP
WHERE  student_id = 3 AND academic_year = '2024-2025' AND semester = 'Semester1';

-- DELETE
DELETE FROM gpa_record
WHERE  student_id = 3 AND academic_year = '2024-2025' AND semester = 'Semester1';

--  SECTION 2 : ADVANCED QUERIES

-- Q1  Student Transcript
--     Full academic history: course → grade → GPA per semester
SELECT s.student_code,
       CONCAT(s.first_name_en,' ',s.last_name_en) AS student_name,
       p.program_name_en,
       sec.academic_year,
       sec.semester,
       c.course_code,
       c.course_name_en,
       c.credit_hours,
       fg.total_weighted_score,
       fg.letter_grade,
       fg.grade_point,
       fg.is_passed
FROM   student          s
JOIN   program          p   ON p.program_id    = s.program_id
JOIN   enrollment       e   ON e.student_id    = s.student_id
JOIN   academic_section sec ON sec.section_id  = e.section_id
JOIN   course           c   ON c.course_id     = sec.course_id
LEFT JOIN final_grade   fg  ON fg.enrollment_id = e.enrollment_id
WHERE  s.student_code = 'e20210001'
ORDER  BY sec.academic_year, sec.semester, c.course_code;


-- Q2  Section Gradebook
--     Weighted final scores computed inline from exam_result
SELECT s.student_code,
       CONCAT(s.first_name_en,' ',s.last_name_en)  AS student_name,
       ROUND(SUM( (er.marks_obtained / ex.total_marks) * ex.weight_percent ), 2)
                                                     AS computed_weighted_score,
       fg.total_weighted_score                       AS stored_score,
       fg.letter_grade,
       fg.grade_point
FROM   academic_section sec
JOIN   enrollment       e   ON e.section_id   = sec.section_id
JOIN   student          s   ON s.student_id   = e.student_id
JOIN   examination      ex  ON ex.section_id  = sec.section_id
JOIN   exam_result      er  ON er.exam_id     = ex.exam_id
                           AND er.student_id  = e.student_id
LEFT JOIN final_grade   fg  ON fg.enrollment_id = e.enrollment_id
WHERE  sec.section_code = 'ITE301-A-2024S1'
GROUP  BY s.student_id, fg.grade_id
ORDER  BY computed_weighted_score DESC;


-- Q3  Dean's List
--     Students with cumulative GPA >= 3.50 (current semester)

SELECT s.student_code,
       CONCAT(s.first_name_en,' ',s.last_name_en) AS name,
       p.program_name_en,
       g.academic_year, g.semester,
       g.cumulative_gpa,
       g.academic_standing
FROM   gpa_record g
JOIN   student    s ON s.student_id = g.student_id
JOIN   program    p ON p.program_id = s.program_id
WHERE  g.cumulative_gpa >= 3.50
  AND  g.academic_year  = '2024-2025'
  AND  g.semester       = 'Semester1'
ORDER  BY g.cumulative_gpa DESC;

-- Q4  Academic Standing Distribution
--     How many students fall into each standing category?
SELECT g.academic_standing,
       COUNT(DISTINCT g.student_id) AS student_count,
       ROUND(AVG(g.cumulative_gpa), 3)  AS avg_cgpa,
       ROUND(MIN(g.cumulative_gpa), 3)  AS min_cgpa,
       ROUND(MAX(g.cumulative_gpa), 3)  AS max_cgpa
FROM   gpa_record g
WHERE  g.academic_year = '2024-2025'
  AND  g.semester      = 'Semester1'
GROUP  BY g.academic_standing
ORDER  BY avg_cgpa DESC;



-- Q5  Course Failure Rate
--     Courses with the highest failure rates across all sections

SELECT c.course_code, c.course_name_en,
       COUNT(fg.grade_id)                         AS total_grades,
       SUM(fg.is_passed = 0)                       AS failed,
       ROUND(SUM(fg.is_passed=0)*100.0/COUNT(*),2) AS failure_rate_pct,
       ROUND(AVG(fg.grade_point),3)                AS avg_grade_point
FROM   final_grade      fg
JOIN   enrollment       e   ON e.enrollment_id  = fg.enrollment_id
JOIN   academic_section sec ON sec.section_id   = e.section_id
JOIN   course           c   ON c.course_id      = sec.course_id
WHERE  fg.is_finalized = 1
GROUP  BY c.course_id
ORDER  BY failure_rate_pct DESC;



-- Q6  Attendance at Risk
--     Students below 80 % attendance — risk losing credit

SELECT s.student_code,
       CONCAT(s.first_name_en,' ',s.last_name_en) AS student_name,
       sec.section_code, c.course_name_en,
       COUNT(*)                                    AS total_sessions,
       SUM(a.status = 'Present')                   AS present,
       ROUND(SUM(a.status='Present')*100.0/COUNT(*),1) AS attendance_pct
FROM   attendance       a
JOIN   student          s   ON s.student_id   = a.student_id
JOIN   academic_section sec ON sec.section_id = a.section_id
JOIN   course           c   ON c.course_id    = sec.course_id
GROUP  BY a.student_id, a.section_id
HAVING attendance_pct < 80
ORDER  BY attendance_pct ASC;

-- Q7  Section Capacity vs Enrollment
--     Rooms that are near or over capacity

SELECT sec.section_code,
       c.course_name_en,
       cl.room_code, cl.building,
       sec.capacity                                   AS sec_capacity,
       sec.enrolled_count,
       cl.capacity                                    AS room_capacity,
       ROUND(sec.enrolled_count*100.0/sec.capacity,1) AS fill_pct
FROM   academic_section sec
JOIN   course           c  ON c.course_id = sec.course_id
LEFT JOIN classroom     cl ON cl.room_id  = sec.room_id
WHERE  sec.academic_year = '2024-2025'
ORDER  BY fill_pct DESC;


-- Q8  Prerequisite Compliance Check
--     Students enrolled in a course without having passed the prerequisite

SELECT s.student_code,
       CONCAT(s.first_name_en,' ',s.last_name_en) AS student_name,
       c.course_code                               AS enrolled_course,
       pre.course_code                             AS prerequisite,
       'NOT PASSED'                                AS compliance_status
FROM   enrollment       e
JOIN   academic_section sec ON sec.section_id  = e.section_id
JOIN   course           c   ON c.course_id     = sec.course_id
JOIN   course           pre ON pre.course_id   = c.prerequisite_course_id
JOIN   student          s   ON s.student_id    = e.student_id
WHERE  c.prerequisite_course_id IS NOT NULL
  AND  e.status = 'Enrolled'
  AND  NOT EXISTS (
       SELECT 1
       FROM   enrollment       e2
       JOIN   academic_section s2  ON s2.section_id   = e2.section_id
       JOIN   final_grade      fg2 ON fg2.enrollment_id = e2.enrollment_id
       WHERE  e2.student_id = e.student_id
         AND  s2.course_id  = pre.course_id
         AND  fg2.is_passed = 1
  );


-- Q9  Program Enrollment Trend by Year
--     Head-count per program per admission year

SELECT p.program_code, p.program_name_en,
       s.admission_year,
       COUNT(*) AS student_count,
       SUM(s.status = 'Active')    AS active,
       SUM(s.status = 'Graduated') AS graduated,
       SUM(s.status NOT IN ('Active','Graduated')) AS other
FROM   student  s
JOIN   program  p ON p.program_id = s.program_id
GROUP  BY p.program_id, s.admission_year
ORDER  BY p.program_code, s.admission_year;


-- Q10  Top-Performing Students Per Program (Window Function)
--      Ranked by cumulative GPA within each program

SELECT program_code, student_code, student_name, cumulative_gpa, gpa_rank
FROM (
    SELECT p.program_code,
           s.student_code,
           CONCAT(s.first_name_en,' ',s.last_name_en) AS student_name,
           g.cumulative_gpa,
           RANK() OVER (
               PARTITION BY p.program_id
               ORDER BY g.cumulative_gpa DESC
           ) AS gpa_rank
    FROM   gpa_record  g
    JOIN   student     s ON s.student_id = g.student_id
    JOIN   program     p ON p.program_id = s.program_id
    WHERE  g.academic_year = '2024-2025'
      AND  g.semester      = 'Semester1'
) ranked
WHERE gpa_rank <= 3
ORDER BY program_code, gpa_rank;


-- Q11  Instructor Workload
--      Sections, total enrolled students, and credit-hours taught

SELECT sec.instructor,
       COUNT(DISTINCT sec.section_id) AS sections_taught,
       SUM(sec.enrolled_count)         AS total_students,
       SUM(c.credit_hours)             AS total_credit_hours,
       GROUP_CONCAT(DISTINCT c.course_code ORDER BY c.course_code SEPARATOR ', ')
                                       AS courses
FROM   academic_section sec
JOIN   course           c   ON c.course_id = sec.course_id
WHERE  sec.academic_year = '2024-2025'
  AND  sec.is_active     = 1
GROUP  BY sec.instructor
ORDER  BY total_credit_hours DESC;

-- Q12  Exam Score Distribution (Histogram buckets)
--      For a specific examination

SELECT CONCAT(FLOOR(er.marks_obtained/10)*10, '-',
              FLOOR(er.marks_obtained/10)*10 + 9) AS score_range,
       COUNT(*)                                    AS student_count,
       ROUND(AVG(er.marks_obtained),2)             AS avg_in_range,
       REPEAT('█', COUNT(*))                       AS bar
FROM   exam_result er
WHERE  er.exam_id = 2          -- Midterm of ITE301-A
GROUP  BY FLOOR(er.marks_obtained/10)
ORDER  BY FLOOR(er.marks_obtained/10);


-- Q13  Students Who Have Never Been Absent
--      In a given section

SELECT s.student_code,
       CONCAT(s.first_name_en,' ',s.last_name_en) AS student_name
FROM   enrollment e
JOIN   student    s ON s.student_id = e.student_id
WHERE  e.section_id = 1
  AND  e.status     = 'Enrolled'
  AND  s.student_id NOT IN (
       SELECT DISTINCT a.student_id
       FROM   attendance a
       WHERE  a.section_id = 1
         AND  a.status     = 'Absent'
  );

-- Q14  Cumulative Credits Earned Per Student
--      Using a running total (CTE + window function)

WITH earned AS (
    SELECT e.student_id,
           sec.academic_year,
           sec.semester,
           SUM(CASE WHEN fg.is_passed = 1 THEN c.credit_hours ELSE 0 END) AS sem_credits_earned
    FROM   enrollment       e
    JOIN   academic_section sec ON sec.section_id   = e.section_id
    JOIN   course           c   ON c.course_id      = sec.course_id
    LEFT JOIN final_grade   fg  ON fg.enrollment_id = e.enrollment_id
    GROUP  BY e.student_id, sec.academic_year, sec.semester
)
SELECT s.student_code,
       CONCAT(s.first_name_en,' ',s.last_name_en) AS student_name,
       p.total_credits AS required_credits,
       SUM(earned.sem_credits_earned)
           OVER (PARTITION BY earned.student_id
                 ORDER BY earned.academic_year, earned.semester
                 ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
           AS cumulative_credits_earned
FROM   earned
JOIN   student  s ON s.student_id  = earned.student_id
JOIN   program  p ON p.program_id  = s.program_id
ORDER  BY s.student_code, earned.academic_year, earned.semester;

-- Q15  Students Ready to Graduate
--      Active students who have earned >= program total credits
--      and cumulative GPA >= 2.00

SELECT s.student_code,
       CONCAT(s.first_name_en,' ',s.last_name_en) AS student_name,
       p.program_name_en,
       p.total_credits                             AS required,
       SUM(CASE WHEN fg.is_passed=1 THEN c.credit_hours ELSE 0 END)
                                                   AS earned,
       MAX(g.cumulative_gpa)                       AS cgpa
FROM   student          s
JOIN   program          p   ON p.program_id    = s.program_id
JOIN   enrollment       e   ON e.student_id    = s.student_id
JOIN   academic_section sec ON sec.section_id  = e.section_id
JOIN   course           c   ON c.course_id     = sec.course_id
LEFT JOIN final_grade   fg  ON fg.enrollment_id = e.enrollment_id
LEFT JOIN gpa_record    g   ON g.student_id    = s.student_id
WHERE  s.status = 'Active'
GROUP  BY s.student_id
HAVING earned  >= p.total_credits
   AND cgpa    >= 2.00;


-- Q16  Audit Log – Recent Actions by Table
SELECT al.created_at, u.username, al.action,
       al.table_name, al.record_id, al.details, al.ip_address
FROM   audit_log al
LEFT JOIN sys_user u ON u.user_id = al.user_id
ORDER  BY al.created_at DESC
LIMIT  50;



-- Q17  Faculty & Department Summary
--      Student headcount and average GPA rolled up to faculty level

SELECT f.faculty_code, f.faculty_name_en,
       d.dept_code, d.dept_name_en,
       COUNT(DISTINCT s.student_id)           AS total_students,
       SUM(s.status = 'Active')               AS active_students,
       ROUND(AVG(g.cumulative_gpa), 3)        AS avg_cumulative_gpa
FROM   faculty_academic f
JOIN   department       d ON d.faculty_id = f.faculty_id
JOIN   program          p ON p.dept_id    = d.dept_id
JOIN   student          s ON s.program_id = p.program_id
LEFT JOIN gpa_record    g ON g.student_id = s.student_id
                          AND g.academic_year = '2024-2025'
GROUP  BY f.faculty_id, d.dept_id
ORDER  BY f.faculty_code, d.dept_code;



-- Q18  Course Prerequisite Chain  (Recursive CTE)
--      Show full prerequisite path for every course

WITH RECURSIVE prereq_chain AS (
    -- Anchor: courses with no prerequisite
    SELECT course_id, course_code, course_name_en,
           prerequisite_course_id,
           CAST(course_code AS CHAR(500)) AS chain,
           0 AS depth
    FROM   course
    WHERE  prerequisite_course_id IS NULL

    UNION ALL

    -- Recursive: courses that depend on the previous level
    SELECT c.course_id, c.course_code, c.course_name_en,
           c.prerequisite_course_id,
           CONCAT(pc.chain, ' → ', c.course_code),
           pc.depth + 1
    FROM   course       c
    JOIN   prereq_chain pc ON pc.course_id = c.prerequisite_course_id
)
SELECT chain, course_name_en, depth
FROM   prereq_chain
ORDER  BY chain;



-- Q19  National Exam Scores vs Academic GPA Correlation
--      Compare admission score with first-semester GPA

SELECT s.student_code,
       CONCAT(s.first_name_en,' ',s.last_name_en) AS student_name,
       a.national_exam_score,
       g.semester_gpa                              AS sem1_gpa,
       g.cumulative_gpa,
       CASE
           WHEN a.national_exam_score >= 85 THEN 'High Admission'
           WHEN a.national_exam_score >= 75 THEN 'Mid Admission'
           ELSE                                  'Low Admission'
       END AS admission_band
FROM   student     s
JOIN   admission   a ON a.student_id  = s.student_id
JOIN   gpa_record  g ON g.student_id  = s.student_id
                     AND g.academic_year = '2024-2025'
                     AND g.semester      = 'Semester1'
WHERE  a.national_exam_score IS NOT NULL
ORDER  BY a.national_exam_score DESC;



-- Q20  Retake Rate Per Course
--      How often students re-enroll (enrollment_type='Retake')

SELECT c.course_code, c.course_name_en,
       COUNT(*)                                          AS total_enrollments,
       SUM(e.enrollment_type = 'Retake')                 AS retakes,
       ROUND(SUM(e.enrollment_type='Retake')*100.0/COUNT(*),2) AS retake_pct
FROM   enrollment       e
JOIN   academic_section sec ON sec.section_id = e.section_id
JOIN   course           c   ON c.course_id    = sec.course_id
GROUP  BY c.course_id
ORDER  BY retake_pct DESC;
