
# Retro Manager - 1993 Edition

A comprehensive, classic-style football management simulation built with Next.js, Tailwind CSS, and Lucide icons. Experience the depth of 90s management with a modern tech stack.

## 🚀 Getting Started (Newbie Guide)

### 1. Sync & Store Your Code (GitHub)
To save your work permanently to your repository:

*   **Via IDE UI (Recommended)**:
    1.  Click the **GitHub icon** in the top-right toolbar.
    2.  Authorize and link to `skinks/retromanager`.
    3.  Click the **Sync** button (circular arrows) to push your code.
*   **Via Terminal**:
    1.  Open the Terminal in this IDE.
    2.  Run `git init`
    3.  Run `git remote add origin https://github.com/skinks/retromanager.git`
    4.  Run `git add .`
    5.  Run `git commit -m "stable build v1.9.3"`
    6.  Run `git push -u origin main` (Note: You may need a GitHub Personal Access Token).

### 2. Go Live (Firebase Hosting)
To host your game so anyone can play it on the web:
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add Project"** and create a name for your game.
3.  In the left sidebar, find **"App Hosting"**.
4.  Click **"Get Started"** and connect your `skinks/retromanager` GitHub repository.
5.  Firebase will automatically build and deploy your game every time you push a change!

## 🎮 Game Features

- **Quad-Division League System**: 80 authentic-style teams competing across four divisions.
- **Deep Tactical Control**: 5 formations and 5 play styles.
- **Dynamic Match Simulation**: Real-time commentary and goal celebration pauses.
- **Season Summaries**: Comprehensive reviews at the end of every 38-week campaign.
- **Smart Initialization**: Starting a new game automatically assigns the **Strongest 11** for your team.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS (20% Glass-HUD Transparency)
- **Icons**: Lucide React
- **Persistence**: LocalStorage (Career saves)
