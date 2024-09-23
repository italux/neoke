# AI-Powered Software Experiment

This project is a personal experiment to explore whether it's possible to write a complete piece of software using **exclusively AI** tools, by merely copying and pasting code suggestions. The objective was to build a working application while relying entirely on AI-generated code, making minimal manual adjustments. 

### Experiment Overview

The results, from my perspective, show that around **70-80% of the code provided works without any adjustments**, while the remaining 20-30% required some manual fixes or fine-tuning. The project uses a combination of modern AI tools to generate and refine the code:

- **[v0.dev](https://v0.dev)** by Vercel to quickly generate UI layouts and components.
- **ChatGPT** with GPT-4o and o1-preview to handle backend logic, write API calls, and implement core functionality.
- **GitHub Copilot** to fill in small gaps, such as fixing syntax errors, adjusting CSS, or creating smaller components like buttons.

This approach was highly efficient, and it was fascinating to see how these tools can work together to create a functional application.

## Tools Used

- **Next.js** for building the frontend and backend using React and Node.js.
- **Vercel v0.dev** for UI layout generation.
- **ChatGPT** for backend logic and API integration.
- **GitHub Copilot** for syntax fixes and minor adjustments.
- **CodeRabbit AI** for code review and code changes suggestions.


## Installation and Running the App Locally

To run this project on your local machine, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/italux/neoke.git
cd neoke
```

### 2. Install dependencies

Make sure you have Node.js installed on your machine. Then, install the necessary packages by running:

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project and configure any environment variables needed (such as API keys or database credentials).

### 4. Run the development server

Start the Next.js development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 5. Build for production

To build the application for production, run:

```bash
npm run build
```

This will create an optimized build of the application.

### 6. Start the production server

After building, you can start the production server with:

```bash
npm start
```

### 7. Running tests (Optional)

If you have tests set up, you can run them using:

```bash
npm run test
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.