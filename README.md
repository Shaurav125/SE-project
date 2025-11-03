# Groundwater Predictor

An advanced Hydrogeological Forecasting application.

## Project Setup

This project is built with React, TypeScript, and Vite. It provides a modern, fast, and efficient development experience for local development in editors like VS Code.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- A package manager like `npm`
- An `API_KEY` environment variable containing your API key for the forecasting service. This must be available in the execution environment where the application is built and run.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd groundwater-predictor
    ```
2.  **Install the dependencies:**
    ```bash
    npm install
    ```

---

## Code Quality

This project is configured with ESLint and Prettier to ensure code consistency and quality.

- **`npm run lint`**: Lints the codebase for potential errors.
- **`npm run lint:fix`**: Lints and automatically fixes issues.
- **`npm run format`**: Formats all files using Prettier.

It's recommended to install the recommended VS Code extensions to get real-time feedback and automatic formatting on save.

---

## Available Scripts

### `npm run dev`

Runs the app in development mode. Open [http://localhost:5173](http://localhost:5173) (the port may vary) to view it in the browser. The server will automatically reload when you make changes.

### `npm run build`

Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run preview`

Serves the production build from the `dist` folder locally. This is a good way to test the final build before deploying.

---

## Deployment

This project is configured for easy deployment to any static hosting service.

### Deploying to GitHub Pages (Recommended)

1.  **Set Homepage in `package.json`**:
    - Open the `package.json` file.
    - Change the `homepage` value to match your GitHub Pages URL structure:
      ```json
      "homepage": "https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPO_NAME>",
      ```

2.  **Deploy**:
    - Run the following command in your terminal:
      ```bash
      npm run deploy
      ```
    - This command will first build your project and then push the contents of the `dist` folder to a new `gh-pages` branch on your GitHub repository.

3.  **Configure GitHub Repository**:
    - Go to your repository's settings on GitHub.
    - Navigate to the "Pages" section.
    - Under "Build and deployment", select the source as "Deploy from a branch".
    - Set the branch to `gh-pages` with the `/ (root)` folder.
    - Save your changes. Your site should be live at the URL specified in your `homepage` field within a few minutes.

### Deploying to Vercel or Netlify

1.  **Push to GitHub**: Make sure your code is on a GitHub repository.
2.  **Import Project**: Go to your Vercel or Netlify dashboard and import the repository. The platform will automatically detect that it's a Vite project and use the correct build settings (`npm run build`) and output directory (`dist`).
3.  **Configure Environment Variable**: In your hosting platform's project settings, add an environment variable named `API_KEY` and set its value to your API key.
4.  **Deploy**: Click the deploy button. Your site will be live in a few moments.
