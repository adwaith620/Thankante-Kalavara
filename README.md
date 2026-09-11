# Thankan's Kalavara 🎯

## Basic Details
### Team Name: [Fill with the actual team name if available]
### Team Members
- Team Lead: Adwaith - [College name if available]
- Member 2: [Name if available] - [College if available]
- Member 3: [Name if available] - [College if available]

### Project Description
Thankan's Kalavara is a deliberately frustrating collection of absurd UI challenges and bad-UX mini-games. The interface intentionally makes simple tasks difficult. Players complete a sequence of challenges. The project includes hostile buttons, confusing controls, fake errors, unstable interfaces, and ridiculous interactions. The player must complete the full kalavara. A shared session timer tracks the entire run. The player receives a clean printable CERTIFIED THANKAN certificate. The project is designed as a humorous TinkerHub Useless Project.

### The Problem (that doesn't exist)
Modern interfaces are too convenient and predictable. Users normally:
- Click buttons that stay where they are.
- Enter information normally.
- Understand what controls do.
- Complete tasks quickly.

This project solves the imaginary problem of interfaces being too usable.

### The Solution (that nobody asked for)
The project replaces ordinary UI interactions with intentionally frustrating challenges. Features include:
- Fixed sequential game progression.
- Shared timer across the complete session.
- Random game selection feature.
- Game completion tracking.
- Daily leaderboard support.
- Printable certificate.
- The final title CERTIFIED THANKAN.

## Technical Details

### Technologies
- React
- TypeScript
- Vite
- Tailwind CSS
- Browser Local Storage
- Git and GitHub

### For Hardware:
- No hardware required

## Implementation
The project implements a core framework containing:
- **Game registry**: Stores 23 dynamically loading mini-games.
- **Sequential progression**: Auto-advances uncompleted games until all are cleared.
- **Shared session timer**: Initiated on the first game and stops after the final challenge is completed.
- **Game completion state**: Uses the Context/Store API connected with local storage.
- **Random game selection**: Biased to pick uncompleted games.
- **LocalStorage persistence**: Keeps progress between refreshes.
- **Certificate generation**: Generates a dynamic summary with a simulated tracking hash.
- **Print-friendly certificate layout**: Hides non-essential UI via CSS print queries.
- **Daily leaderboard integration**: Simulated backend structure backed by LocalStorage, grouping runs by the current date.
- **Responsive UI**: Adjusts for small/large screens.
- **Timer and animation cleanup**: Proper teardown on component unmount and game resets.

## Installation

```bash
npm install
```

# Run

```bash
npm run dev
```

## Game Flow
1. Open Thankan's Kalavara.
2. Start the challenge session.
3. The shared timer begins.
4. Complete the active games in order.
5. Progress moves to the next game after completion.
6. The timer continues across all games.
7. Completing the final game records the total session time.
8. The player can view the final result and certificate.
9. The leaderboard is updated locally.

## Project Documentation

### For Software:
The architecture revolves around a global store (`store.ts`) that manages progression, attempts, fails, and the session timer. A central `GameLayout.tsx` handles wrapping each individual game component, rendering their statuses, handling navigation logic to the next game in the sequence, and broadcasting completion back to the store. 

# Screenshots

![Landing Screen](Add landing screen screenshot here)
*Landing screen of Thankan's Kalavara.*

![Game Screen](Add game screenshot here)
*Example of an intentionally frustrating game.*

![Certificate](Add certificate screenshot here)
*Printable CERTIFIED THANKAN certificate.*

# Diagrams

Add a workflow or architecture diagram showing:
- Landing page
- Game registry
- Sequential game progression
- Shared session timer
- Completion tracking
- Final certificate
- Leaderboard submission

### Project Demo

# Video
[Add the project demo video link here]
*Demonstrates the Thankan's Kalavara experience from the first challenge to the final certificate.*

# Additional Demos
[Add any extra demo materials or links here]

## Team Contributions
- Adwaith: Project implementation, game mechanics, UI/UX, game progression, shared timer, certificate, branding, and integration.
- [Member 2]: [Specific contributions]
- [Member 3]: [Specific contributions]

---
Made with ❤️ at TinkerHub Useless Projects
