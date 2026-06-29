# Stream Visual Extension

A lightweight desktop overlay for streaming Japanese kanji quizzes.

## Features
- Shows a quiz popup overlay for Twitch chat triggers or timed intervals
- Uses a local web UI with pywebview
- Supports optional Renshuu API integration

## Setup
1. Install Python dependencies
2. Create a local config file from the example below
3. Start the overlay with the provided batch files

## Example config
Copy `config.example.json` to `config.json` and fill in your values locally.

## Notes
- Local runtime files such as `config.json` and `ui/sync-state.json` are ignored by Git
- The repository is intended to be public, but only the repository owner should push changes
