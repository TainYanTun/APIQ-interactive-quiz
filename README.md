# 🧠 APIQ: The Ultimate Interactive Quiz Application

![QuizMaster Banner](https://via.placeholder.com/1200x400?text=QuizMaster+Interactive+Quiz+App)

## ✨ Unleash the Power of Knowledge and Competition!

This is a dynamic and interactive quiz application designed to bring excitement and engagement to learning and assessment. Whether you're an educator looking to test your students, a trainer conducting interactive sessions, or just hosting a fun trivia night, APIQ provides a seamless and engaging experience for both administrators and participants.

Built with modern web technologies, QuizMaster offers real-time interaction, robust administration tools, and a user-friendly interface, making it the perfect platform for any knowledge-based challenge.

## 🚀 Features at a Glance

### Administrator Dashboard

*   **Session Management:** Create, start, pause, and end quiz sessions with ease.
*   **Question Bank:** A comprehensive system to add, edit, delete, and categorize questions by topic, difficulty, and round.
*   **Real-time Control:** Advance questions, reveal answers, and manage buzzer states in real-time.
*   **Participant Oversight:** Monitor active participants, remove inactive ones, and track their progress.
*   **Scoring Modes:** Switch between individual and department-based scoring to suit your quiz format.
*   **Live Leaderboard:** Display real-time scores and rankings to fuel competition.
*   **Presentation View:** A dedicated, clean interface for projecting questions and scores to an audience.

### Student Interface

*   **Easy Session Join:** Students can quickly join a quiz session using a unique session ID.
*   **Real-time Question Display:** Questions appear instantly as the administrator advances them.
*   **Buzzer System:** Engage in quick-fire rounds with an interactive buzzer.
*   **Answer Submission:** Submit answers directly through the application.
*   **Personalized Scores:** View individual scores and overall rankings.

## 🛠️ Technologies Under the Hood

*   **Frontend:**
    *   **Next.js:** A powerful React framework for building fast and scalable web applications.
    *   **React:** For building interactive user interfaces.
    *   **TypeScript:** For type-safe and robust code.
    *   **Tailwind CSS:** For utility-first styling and rapid UI development.
    *   **Zod:** For schema validation.
*   **Backend:**
    *   **Node.js:** JavaScript runtime for server-side logic.
    *   **WebSockets (ws):** For real-time, bidirectional communication between server and clients.
    *   **MySQL2/Promise:** A robust MySQL client for Node.js with Promise API.
    *   **Bcrypt:** For secure password hashing.
*   **Database:**
    *   **MySQL:** A popular open-source relational database management system.

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js** (LTS version recommended)
*   **npm** (comes with Node.js) or **Yarn**
*   **MySQL Server** (version 8.0+ recommended)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/quiz-app.git
    cd quiz-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

### Database Setup

1.  **Create a MySQL database:**

    ```sql
    CREATE DATABASE quiz_app;
    ```

2.  **Configure environment variables:**

    Create a `.env` file in the root of the project based on `.env.sample` and fill in your database credentials:

    ```env
    DB_HOST=localhost
    DB_USER=your_mysql_user
    DB_PASSWORD=your_mysql_password
    DB_DATABASE=quiz_app
    ```

3.  **Run database migrations:**

    Execute the SQL schema to create the necessary tables:

    ```bash
    mysql -u your_mysql_user -p quiz_app < backend/schema.sql
    ```
    (You will be prompted for your MySQL password)

4.  **Populate initial questions (optional):**

    ```bash
    node populate-questions.js
    ```

### Running the Application

1.  **Start the Next.js development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    The application will be accessible at `http://localhost:3000`.

2.  **Start the WebSocket server:**

    In a separate terminal, run:

    ```bash
    node socket-server.mjs
    ```

    The WebSocket server will run on `ws://localhost:3001`.

## 💡 Usage

### Admin Panel

Navigate to `http://localhost:3000/admin` to access the administrator dashboard. You'll need to log in with an admin account (you can create one manually in the `admins` table in your database or use a script if provided).

From here, you can:

*   Create new quiz sessions.
*   Add questions to sessions.
*   Start, pause, and manage live quizzes.
*   View the live scoreboard and presentation view.

### Student Participation

Students can join a quiz session by navigating to `http://localhost:3000/join` and entering the session ID provided by the administrator.

## 🤝 Contributing

We welcome contributions! If you have suggestions for improvements, new features, or bug fixes, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to the branch (`git push origin feature/YourFeature`).
6.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 📞 Contact

If you have any questions or need further assistance, please open an issue on the GitHub repository.
