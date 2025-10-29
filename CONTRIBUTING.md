# Contributing to APIQuiz

First off, thank you for considering contributing to APIQuiz! It's people like you that make APIQuiz such a great tool.

We're excited to see your contributions. To ensure a smooth and collaborative process, please take a moment to review these guidelines.

## Code of Conduct

This project and everyone participating in it is governed by the [APIQuiz Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## How Can I Contribute?

### Reporting Bugs

If you encounter a bug, please [open an issue](https://github.com/YOUR_USERNAME/APIQuiz/issues/new?template=bug_report.md) and provide as much detail as possible.

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, please [open an issue](https://github.com/YOUR_USERNAME/APIQuiz/issues/new?template=feature_request.md) to discuss it.

### Your First Code Contribution

Unsure where to begin contributing to APIQuiz? You can start by looking through these `good-first-issue` and `help-wanted` issues:

- [Good first issues](https://github.com/YOUR_USERNAME/APIQuiz/labels/good%20first%20issue)
- [Help wanted issues](https://github.com/YOUR_USERNAME/APIQuiz/labels/help%20wanted)

### Pull Requests

1.  **Fork the repository** and create your branch from `main`.
2.  **Set up your development environment** (see below).
3.  **Make your changes** and ensure they follow the code style.
4.  **Write tests** to cover your changes.
5.  **Ensure all tests pass** by running `npm test`.
6.  **Commit your changes** using a descriptive commit message that follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format.
7.  **Push your branch** to your fork.
8.  **Open a pull request** to the `main` branch of the original repository.

## Development Setup

To get the project running locally, you'll need to have Node.js and npm installed.

1.  Clone your fork of the repository:
    ```sh
    git clone https://github.com/YOUR_USERNAME/APIQuiz.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd APIQuiz
    ```
3.  Install the dependencies:
    ```sh
    npm install
    ```
4.  Set up your environment variables. Copy the `.env.sample` file to a new file named `.env` and fill in the required values.
    ```sh
    cp .env.sample .env
    ```
5.  Set up the database. You'll need to have a PostgreSQL server running. Create a new database and run the `backend/schema.sql` script to create the tables.
6.  Run the development server:
    ```sh
    npm run dev
    ```

## Code Style

We use [ESLint](https://eslint.org/) to enforce a consistent code style. Before you commit your changes, please run the linter to make sure your code conforms to our style guidelines.

```sh
npm run lint
```

## Thank You!

Your contributions are valuable to us. Thank you for your time and effort!