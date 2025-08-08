Here’s a refined and focused prompt template designed to get high-quality results from an assistant acting as a game designer, based on everything we’ve discussed:


---

🎮 Prompt Template – Tactical Text-Driven Wargame Design Assistant

> You're a senior game designer. Your role is to help me design a new genre of game: a tactical, text-based military wargame. It has no graphics—only structured text, player commands, and generated reports. I want to simulate fog-of-war, morale, logistics, and command-level decisions through text.

Here's what I need from you:

1. Genre clarity – Help define what makes this game unique. Compare it to existing games without repeating ideas.


2. Game mechanics – Break down how player input (commands) maps to world state changes and simulation ticks.


3. System design – Describe systems like units, behaviors, world zones, logistics, and reports. Keep everything text-driven.


4. Simulation engine – Design a minimal version of the engine loop: how ticks are processed, orders resolved, and reports generated.


5. Command grammar – Define a syntax for structured player input (like CLI or tactical DSL). Avoid bloated NLP—keep it interpretable.


6. Modularity – Design this to work in CLI first, and scale up to multiplayer later.


7. Tech stack guidance – If asked, recommend suitable tools (e.g., XState, Miniplex ECS, Drizzle + SQLite, etc.).



Be focused, minimal, and clear. Do not romanticize. Stick to mechanics, design constraints, and simulation fidelity.




---

✅ Example Use

You can drop this into any LLM or assistant prompt window, then add a follow-up like:

> "Let’s design the turn simulation loop. I want each tick to process commands, resolve actions, and generate logs—no UI, just pure text."



or:

> "Give me 5 structured command examples that a player might use. Then describe how the game engine would interpret and simulate them."




---

Let me know if you want a variant tailored for use inside GPTs, ChatGPT custom instructions, or developer tooling.



Here’s a prompt you can use with an LLM to get a high-quality answer based on our conversation and your project goals:


---

🧠 Prompt for LLM:

> I'm building a text-based tactical wargame (TTW) called WAR TACTICS, where players issue commands like:
"Move Alpha to Ridge-3 before dawn under radio silence"
The game has no visuals—only text commands and outputs. Orders are parsed into structured directives, and the game world progresses in tick-based steps (e.g., 5–15 min per tick). Units have traits like morale, supplies, fatigue, initiative. The world is composed of abstract zones (e.g., Ridge, Bridgepoint), and includes fog of war, signal jamming, and autonomous behavior.

Before introducing LLMs, I want to implement the game logic that handles how the system reacts after a command is issued, and how the game world reacts independently (e.g., morale loss, AI movement, weather).

Specifically:

How can I structure the game tick logic to handle both:

Player-issued commands

Autonomous world or unit behavior (environment, AI, state-based reactions)


What are the systems or modules I should implement first to handle:

Command resolution

Combat triggers

Morale/fatigue checks

Enemy strategy

World state changes like weather or jamming


What are good data structures and tick-based flows to simulate these systems deterministically?


Please respond with an overview of how the game engine should handle:

1. Command parsing and queuing


2. Tick-based simulation loop


3. Emergent behaviors triggered by internal state


4. Environmental events and enemy logic



Keep it deterministic and modular—LLMs will only be used later for natural language parsing and report generation.




---

Let me know if you want to expand this to include architecture hints (e.g., ECS with miniplex, XState flows, or React-based debug tooling).

