# ❌⭕ Real-Time Multiplayer Tic-Tac-Toe

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20Here-brightgreen?style=for-the-badge&logo=google-chrome)](https://tic-tac-toe.swarnabhadev.in)
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/swarnabhadev)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE)

A robust, real-time multiplayer Tic-Tac-Toe game that allows players to create private rooms, join via unique codes, and battle it out instantly from any device. 

**Play it live here:** [https://tic-tac-toe.swarnabhadev.in](https://tic-tac-toe.swarnabhadev.in)

---

## 📸 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/700x400?text=Game+Lobby+Screenshot" alt="Game Lobby" width="45%">
  <img src="https://via.placeholder.com/700x400?text=Gameplay+Screenshot" alt="Gameplay" width="45%">
</div>

---

## ✨ Key Features

* **Real-Time Gameplay:** Instant move updates and game state synchronization using WebSockets.
* **Room-Based Matchmaking:** Create private rooms and share unique codes to play with friends anywhere.
* **Live Score Tracking:** Persistent tracking of Wins, Losses, and Draws during the session.
* **Player State Management:** Handles user disconnections ("Opponent has left") and game resets seamlessly.
* **Responsive Design:** Optimized for both desktop and mobile play.

---

## 🛠️ Tech Stack

This project leverages the **MERN** stack ecosystem for scalable, full-stack performance.

* **Frontend:** [React.js](https://reactjs.org/) (UI & State Management)
* **Backend:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* **Real-Time Communication:** [Socket.io](https://socket.io/)
* **Styling:** CSS3 / Styled-Components

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites

* Node.js (v14 or higher)
* npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/Immortal-27/tic-tac-toe.git](https://github.com/Immortal-27/tic-tac-toe.git)
    cd tic-tac-toe
    ```

2.  **Install Server Dependencies**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies**
    ```bash
    cd ../client
    npm install
    ```

### Running the App

1.  **Start the Backend Server**
    ```bash
    # Inside /server directory
    npm start
    ```
    *Server will typically run on http://localhost:5000*

2.  **Start the React Client**
    ```bash
    # Inside /client directory
    npm start
    ```
    *Client will run on http://localhost:3000*

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or bug fixes:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

---

## 👤 Author

**Swarnabha Bhattacharjee**

* Website: [tic-tac-toe.swarnabhadev.in](https://tic-tac-toe.swarnabhadev.in)
* GitHub: [@Immortal-27](https://github.com/Immortal-27)
* LinkedIn: [Swarnabha Bhattacharjee](https://linkedin.com/in/swarnabha-bhattacharjee)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.