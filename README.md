# BeeKeeper

A cozy strategy sim about managing hives across seasons. Balance forage, defense, and brood, keep queens thriving, and survive threats.

## Run (Web Dev)

1. `yarn`
2. `yarn dev`

## Run (Desktop via Tauri)

1. `yarn tauri:dev`

## Build (macOS)

1. `yarn tauri:build`

## Android

Tauri v2 supports Android. You will need Android Studio, the SDK, and Rust targets installed.

1. `yarn android:dev`
2. `yarn android:build`

Reference: [Tauri v2 Mobile Docs](https://tauri.app/start/prerequisites/)

If this is the first Android run, initialize the project once with `yarn android:init` after the SDK is installed.

## Gameplay

- Advance day or week to simulate season changes.
- Allocate each hive to forage, defense, or brood.
- Harvest hive stores into your stockpile (small harvesting loss).
- Treat hives to improve health and reduce threat risk.
- Split strong hives to expand your apiary.
- Requeen to change trait bonuses.
- Save and load progress (Tauri filesystem only).

## Notes

- Seasons last 30 days and cycle through Spring, Summer, Autumn, Winter.
- Queen traits alter honey, brood, defense, and threat chances.
- Hives consume stores daily, and winter consumption is highest.
- Harvesting is not perfectly efficient (you lose a small portion when extracting).
- If a hive drops too low in population or health, it collapses.
- Win condition: reach year 3+, maintain 3+ hives, store 220+ honey jars, and keep average health at 70%+.
- Difficulty ramps up each year (threats intensify and survival gets tougher).
