This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Quiz App Project Overview

This is a web-based quiz application designed to facilitate interactive quizzes for students, with an administrative interface for managing sessions, questions, and participants.

### Key Features:

-   **Admin Dashboard:** Provides an overview of key statistics such as total questions, active sessions, and total students.
-   **Session Management:** Administrators can create new quiz sessions, activate or deactivate existing ones, and delete sessions. Each session has a unique QR code for student joining.
-   **Participant Management:** For each session, administrators can view a list of joined students and remove participants if necessary.
-   **Student Joining:** Students can join an active quiz session by scanning a QR code and entering their pre-registered student ID.
-   **Dynamic Data Display:** The admin dashboard and session management pages display real-time data fetched from the backend.

### Getting Started (Development):

1.  **Database Setup:**
    *   Ensure you have a MySQL-compatible database server running.
    *   Create a database named `quiz_app_db`.
    *   Apply the schema by running the SQL commands in `backend/schema.sql` against your `quiz_app_db`. This will create the necessary tables and populate initial data.

2.  **Environment Variables:**
    *   Create a `.env.local` file in the project root, based on `.env.sample`.
    *   Configure your database connection details (e.g., `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`).
    *   Set `NEXT_PUBLIC_BASE_URL` to your application's base URL (e.g., `http://localhost:3000`).

3.  **Install Dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    # or yarn dev
    ```
    Open `http://localhost:3000` in your browser.

### Future Enhancements:

-   **Quiz Question Management:** UI for admins to add, edit, and delete questions from the `questions_bank`.
-   **Student Quiz Interface:** Implement the actual quiz-taking experience for students.
-   **Scoring System:** Develop logic for scoring quizzes and displaying results.
-   **Real-time Updates:** Integrate WebSockets for live updates on participant lists and quiz progress.

## Conclusion

This `quiz_app` project is continuously evolving. We aim to create a robust and engaging platform for educational assessments and interactive learning experiences. Your contributions and feedback are highly valued as we move forward with its development.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
