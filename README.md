# TraceIt 

A smart, AI-powered lost and found application for college campuses, built with the MERN stack and Google Gemini.

## ✨ Key Features

- **AI-Powered Semantic Search:** Utilizes Google Gemini's embedding models to find matches based on the *meaning* of an item's description, not just keywords.
- **Detailed Item Reporting:** Users can report found items or request lost items with a detailed, multi-level classification system.
- **Photo & Video Uploads:** Users can upload media to provide a clearer description of an item.
- **Secure User Authentication:** JWT-based authentication for secure user registration and login.
- **Item Claim & Retrieval System:** A full workflow for users to claim items, provide proof of ownership, and for reporters to approve or reject claims.
- **Gamified Rewards System:** Reporters earn "Service Points" for every successfully returned item, with rewards for reaching milestones.
- **Bilingual Support:** Fully internationalized with seamless switching between **English** and **Hindi**.
- **Light & Dark Mode:** A modern, themeable interface for user comfort.

## 🛠️ Tech Stack

- **Frontend:** React.js, React Router, Axios, i18next
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Atlas Vector Search)
- **AI:** Google Gemini API (for text embeddings)
- **Authentication:** JSON Web Tokens (JWT)
- **File Handling:** Multer

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need the following tools installed on your computer:
- [Node.js](https://nodejs.org/) (which includes npm)
- [Git](https://git-scm.com/)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account for the database.
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/traceit-app.git](https://github.com/your-username/traceit-app.git)
    cd traceit-app
    ```

2.  **Setup the Backend:**
    - Navigate to the server directory:
      ```bash
      cd server
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Create a `.env` file in the `server` directory and add the following variables:
      ```env
      MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
      JWT_SECRET=YOUR_JWT_SECRET_KEY
      GEMINI_API_KEY=YOUR_GEMINI_API_KEY
      ```

3.  **Setup the Frontend:**
    - Navigate to the client directory from the root folder:
      ```bash
      cd client
      ```
    - Install dependencies:
      ```bash
      npm install
      ```

4.  **Run the Application:**
    - Navigate back to the root project directory:
      ```bash
      cd ..
      ```
    - Run the development script to start both the backend and frontend servers concurrently:
      ```bash
      npm run dev
      ```
    - The application should now be running at `http://localhost:3000`.

## 📂 Project Structure

The repository is structured as a monorepo with two main folders:
