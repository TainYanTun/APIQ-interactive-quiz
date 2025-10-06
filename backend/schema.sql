-- 1. departments
CREATE TABLE IF NOT EXISTS departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- 2. students
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department_id INT,
    image_url VARCHAR(255),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 3. sessions
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(50) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1
);

-- 4. session_participants
CREATE TABLE IF NOT EXISTS session_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(50) NOT NULL,
    is_representative TINYINT(1) DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    UNIQUE(student_id, session_id)
);

-- 5. scores
CREATE TABLE IF NOT EXISTS scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT,
    points INT DEFAULT 0,
    session_id VARCHAR(50),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- 6. questions_bank
CREATE TABLE IF NOT EXISTS questions_bank (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    difficulty INT DEFAULT 1,
    round INT DEFAULT 1,
    topic VARCHAR(100) DEFAULT 'General',
    question_type VARCHAR(50) DEFAULT 'text',
    options TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1
);

-- 7. admins
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert data into admins
INSERT INTO admins (id, username, password, created_at) VALUES
(1, 'Pann', '$2b$10$8V6K1n13IYdB2h3Mj1GSUuDBg9.P3fS8Sct9gPN9Humr8UrkG6rLy', '2025-09-23 20:04:49'),
(2, 'Rindra', '$2b$10$8V6K1n13IYdB2h3Mj1GSUuDBg9.P3fS8Sct9gPN9Humr8UrkG6rLy', '2025-09-23 20:04:49'),
(3, 'Derek', '$2b$10$8V6K1n13IYdB2h3Mj1GSUuDBg9.P3fS8Sct9gPN9Humr8UrkG6rLy', '2025-09-23 20:04:49');

-- Insert data into departments
INSERT INTO departments (id, name) VALUES
(1, 'Information Technology'),
(2, 'Computer Science'),
(3, 'Business Administration');

-- Insert data into students
INSERT INTO students (id, student_id, name, department_id, image_url) VALUES
(10, '202200295', 'Diana Wong', 2, 'https://example.com/images/202200295.jpg'),
(11, '202200296', 'Ethan Park', 3, 'https://example.com/images/202200296.jpg'),
(12, '202200297', 'Farah Ahmad', 3, 'https://example.com/images/202200297.jpg'),
(13, '202200254', 'John Harbor', 2, NULL),
(16, '202200298', 'Gerald', 1, NULL);

-- Insert data into questions_bank
INSERT INTO questions_bank 
(id, text, answer, category, difficulty, round, topic, question_type, options, created_at, is_active) VALUES
(1, 'What is the capital of France?', 'Paris', 'General Knowledge', 1, 1, 'Geography', 'text', NULL, '2025-09-24 21:28:33', 1),
(2, 'Who wrote Hamlet?', 'William Shakespeare', 'General Knowledge', 2, 1, 'Literature', 'text', NULL, '2025-09-24 21:28:33', 1),
(3, 'What is the largest planet in our Solar System?', 'Jupiter', 'General Knowledge', 1, 1, 'Astronomy', 'text', NULL, '2025-09-24 21:28:33', 1),
(4, 'Which ocean is the deepest?', 'Pacific Ocean', 'General Knowledge', 2, 1, 'Geography', 'text', NULL, '2025-09-24 21:28:33', 1),
(5, 'What is the chemical symbol for water?', 'H2O', 'General Knowledge', 1, 1, 'Science', 'text', NULL, '2025-09-24 21:28:33', 1),
(6, 'Who painted the Mona Lisa?', 'Leonardo da Vinci', 'General Knowledge', 2, 1, 'Art', 'text', NULL, '2025-09-24 21:28:33', 1),
(7, 'What is the fastest land animal?', 'Cheetah', 'General Knowledge', 1, 1, 'Biology', 'text', NULL, '2025-09-24 21:28:33', 1),
(8, 'What year did World War II end?', '1945', 'General Knowledge', 2, 1, 'History', 'text', NULL, '2025-09-24 21:28:33', 1),
(9, 'Which country is known as the Land of the Rising Sun?', 'Japan', 'General Knowledge', 1, 1, 'Geography', 'text', NULL, '2025-09-24 21:28:33', 1),
(10, 'What is the tallest mountain in the world?', 'Mount Everest', 'General Knowledge', 2, 1, 'Geography', 'text', NULL, '2025-09-24 21:28:33', 1),
(11, 'What is the plural of "mouse"?', 'mice', 'English', 1, 1, 'Grammar', 'text', NULL, '2025-09-24 21:28:33', 1),
(12, 'Fill in the blank: He __ to the store.', 'went', 'English', 1, 1, 'Grammar', 'text', NULL, '2025-09-24 21:28:33', 1),
(13, 'What is a synonym of "happy"?', 'joyful', 'English', 1, 1, 'Vocabulary', 'text', NULL, '2025-09-24 21:28:33', 1),
(14, 'Choose the correct article: I saw _ elephant.', 'an', 'English', 1, 1, 'Grammar', 'text', NULL, '2025-09-24 21:28:33', 1),
(15, 'What is the antonym of "cold"?', 'hot', 'English', 1, 1, 'Vocabulary', 'text', NULL, '2025-09-24 21:28:33', 1),
(16, 'Which is correct? "Their" or "There"?', 'There', 'English', 1, 1, 'Grammar', 'text', NULL, '2025-09-24 21:28:33', 1),
(17, 'What is the past tense of "run"?', 'ran', 'English', 1, 1, 'Grammar', 'text', NULL, '2025-09-24 21:28:33', 1),
(18, 'Correct the sentence: "She dont like apples."', 'She doesn''t like apples.', 'English', 2, 1, 'Grammar', 'text', NULL, '2025-09-24 21:28:33', 1),
(19, 'What is the meaning of "benevolent"?', 'kind', 'English', 2, 1, 'Vocabulary', 'text', NULL, '2025-09-24 21:28:33', 1),
(20, 'Choose the right word: "Its/It''s a sunny day."', 'It''s', 'English', 1, 1, 'Grammar', 'text', NULL, '2025-09-24 21:28:33', 1),
(21, 'What is 5 + 7?', '12', 'Math', 1, 1, 'Arithmetic', 'text', NULL, '2025-09-24 21:28:33', 1),
(22, 'What is 12 × 3?', '36', 'Math', 1, 1, 'Multiplication', 'text', NULL, '2025-09-24 21:28:33', 1),
(23, 'Solve for x: 2x + 3 = 7', '2', 'Math', 2, 1, 'Algebra', 'text', NULL, '2025-09-24 21:28:33', 1),
(24, 'What is the square of 9?', '81', 'Math', 1, 1, 'Algebra', 'text', NULL, '2025-09-24 21:28:33', 1),
(25, 'What is 100 ÷ 4?', '25', 'Math', 1, 1, 'Arithmetic', 'text', NULL, '2025-09-24 21:28:33', 1),
(26, 'What is the perimeter of a square with side 5?', '20', 'Math', 1, 1, 'Geometry', 'text', NULL, '2025-09-24 21:28:33', 1),
(27, 'What is 15% of 200?', '30', 'Math', 2, 1, 'Percentage', 'text', NULL, '2025-09-24 21:28:33', 1),
(28, 'Convert 0.75 to fraction', '3/4', 'Math', 2, 1, 'Fractions', 'text', NULL, '2025-09-24 21:28:33', 1),
(29, 'Solve: 7 × 8', '56', 'Math', 1, 1, 'Multiplication', 'text', NULL, '2025-09-24 21:28:33', 1),
(30, 'What is the square root of 144?', '12', 'Math', 1, 1, 'Algebra', 'text', NULL, '2025-09-24 21:28:33', 1),
(31, 'Who is the first president of the United States?', 'George Washington', 'Social Study', 1, 1, 'History', 'text', NULL, '2025-09-24 21:28:33', 1),
(32, 'What is the capital of Thailand?', 'Bangkok', 'Social Study', 1, 1, 'Geography', 'text', NULL, '2025-09-24 21:28:33', 1),
(33, 'Which continent is Egypt in?', 'Africa', 'Social Study', 1, 1, 'Geography', 'text', NULL, '2025-09-24 21:28:33', 1),
(34, 'Who wrote the Declaration of Independence?', 'Thomas Jefferson', 'Social Study', 2, 1, 'History', 'text', NULL, '2025-09-24 21:28:33', 1),
(35, 'What is the largest democracy in the world?', 'India', 'Social Study', 2, 1, 'Politics', 'text', NULL, '2025-09-24 21:28:33', 1),
(36, 'Which war ended in 1945?', 'World War II', 'Social Study', 2, 1, 'History', 'text', NULL, '2025-09-24 21:28:33', 1),
(37, 'What is the currency of Japan?', 'Yen', 'Social Study', 1, 1, 'Economics', 'text', NULL, '2025-09-24 21:28:33', 1),
(38, 'Who was known as the Iron Lady?', 'Margaret Thatcher', 'Social Study', 2, 1, 'Politics', 'text', NULL, '2025-09-24 21:28:33', 1),
(39, 'Which country hosted the 2016 Olympics?', 'Brazil', 'Social Study', 1, 1, 'Sports', 'text', NULL, '2025-09-24 21:28:33', 1),
(40, 'What is the main language spoken in Canada?', 'English/French', 'Social Study', 1, 1, 'Language', 'text', NULL, '2025-09-24 21:28:33', 1),
(41, 'What does HTML stand for?', 'HyperText Markup Language', 'IT', 1, 1, 'Web Development', 'text', NULL, '2025-09-24 21:28:35', 1),
(42, 'What does CSS stand for?', 'Cascading Style Sheets', 'IT', 1, 1, 'Web Development', 'text', NULL, '2025-09-24 21:28:35', 1),
(43, 'What is the main language used for backend development in Node.js?', 'JavaScript', 'IT', 1, 1, 'Programming', 'text', NULL, '2025-09-24 21:28:35', 1),
(44, 'What does CPU stand for?', 'Central Processing Unit', 'IT', 1, 1, 'Hardware', 'text', NULL, '2025-09-24 21:28:35', 1),
(45, 'What is the primary purpose of an IP address?', 'Identify devices on a network', 'IT', 1, 1, 'Networking', 'text', NULL, '2025-09-24 21:28:35', 1),
(46, 'Which protocol is used to send emails?', 'SMTP', 'IT', 2, 1, 'Networking', 'text', NULL, '2025-09-24 21:28:35', 1),
(47, 'What does SQL stand for?', 'Structured Query Language', 'IT', 1, 1, 'Databases', 'text', NULL, '2025-09-24 21:28:35', 1),
(48, 'What is the main function of RAM?', 'Temporary storage for running programs', 'IT', 1, 1, 'Hardware', 'text', NULL, '2025-09-24 21:28:35', 1),
(49, 'Which company developed Windows?', 'Microsoft', 'IT', 1, 1, 'Software', 'text', NULL, '2025-09-24 21:28:35', 1),
(50, 'What does VPN stand for?', 'Virtual Private Network', 'IT', 2, 1, 'Networking', 'text', NULL, '2025-09-24 21:28:35', 1);
