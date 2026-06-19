# 🚀 Reactor 5

> Experimental 2D slot game built with **Cocos Creator** using **MVVM architecture**, **TypeScript**, and a controllable player character.

## Overview

**Reactor 5** is an experimental project that combines a traditional 5×5 slot machine with a small interactive sci-fi environment.

Instead of pressing a single **Spin** button, the player controls a maintenance robot inside a space station and interacts with different terminals that trigger various gameplay modes and visual presentations.

The objective is to create a more immersive slot experience while keeping the gameplay fast and responsive.

---

## Core Features

* 🎮 Controllable robot character
* 🛰️ Interactive space station hub
* 🎰 5×5 slot machine
* 🖥️ Multiple station terminals
* ✨ Different spin presentation modes
* 🎁 Bonus and Free Spins systems
* 🏗️ MVVM architecture
* 🔔 GlobalEventEmitter-based communication
* 🧩 Modular service-oriented design

---

## Project Structure

```text
assets/
└── scripts/
    ├── app/
    ├── core/
    │   ├── GlobalEventEmitter.ts
    │   └── GameContext.ts
    │
    ├── models/
    ├── viewmodels/
    ├── views/
    ├── services/
    ├── controllers/
    └── components/
```

---

## Architecture

The project follows the **MVVM (Model–View–ViewModel)** pattern.

### Model

Contains application state and business data.

Examples:

* PlayerModel
* SlotModel
* WalletModel
* BonusModel

### View

Responsible only for rendering and presentation.

Examples:

* PlayerView
* ReelView
* HUDView
* TerminalView

### ViewModel

Acts as the bridge between Models and Views.

Responsibilities include:

* processing user interactions;
* coordinating services;
* updating models;
* exposing state to views.

---

## Communication

Cross-system communication is handled through a centralized `GlobalEventEmitter`.

Example events:

```text
terminal:activated
spin:requested
spin:started
spin:completed
win:calculated
bonus:triggered
bonus:opened
balance:updated
```

Low-level component interactions should remain local whenever possible.

---

## Services

The business logic is encapsulated in dedicated services:

* `SlotService`
* `RNGService`
* `BonusService`
* `AnimationService`
* `AudioService`
* `SaveService`

Services should remain independent from rendering code.

---

## Planned Terminals

### 🟢 Standard Terminal

Default spin presentation.

### 🔵 Reverse Terminal

Alternative reel animation (reverse direction).

### 🟣 Experimental Terminal

Prototype visual effects and special presentation modes.

### 🟡 Bonus Terminal

Access bonus features such as:

* Free Spins
* bonus progression
* special station interactions

---

## Development Principles

* Keep View free from business logic.
* Keep Model independent from Cocos-specific rendering.
* Prefer composition over inheritance.
* Keep systems modular and easy to extend.
* Separate gameplay logic from animations.
* Add new terminal types without modifying existing implementations whenever possible.

---

## MVP Goals

* [ ] Robot movement
* [ ] Terminal interaction
* [ ] Functional 5×5 slot
* [ ] Multiple spin presentation modes
* [ ] Win animations
* [ ] Bonus system
* [ ] MVVM implementation
* [ ] GlobalEventEmitter integration
* [ ] Modular service layer

---

## Tech Stack

* **Engine:** Cocos Creator
* **Language:** TypeScript
* **Architecture:** MVVM
* **Communication:** GlobalEventEmitter
* **Version Control:** Git

---

## Future Ideas

* Space station upgrades
* Unlockable terminals
* Robot customization
* Mini-games
* Achievement system
* Daily missions
* Seasonal content
* Additional visual themes

---

## License

Private project.
