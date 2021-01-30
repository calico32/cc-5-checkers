# checkers

coding club #5

real time multiplayer with socket.io

live ver at <https://checkers.wiisportsresorts.dev>

idk if you're allowed to make only one jump when you have two possible jumps in a row so i just force the max number of jumps for each path

## extra stuff

- remote multiplayer with websockets, play over the internet with friends (or just the computer)
- very good looking web app
- win/lose/tie (+ confetti too)
- move descriptions ("player moved from a5 to c3, capturing b4" and stuff)
- secure (mostly) - docker and nginx, no xss (to my knowledge)

## tech

- **snowpack** for frontend bundling, **webpack** for backend bundling
- **svelte** as component lib
- **express** as webserver
- **socket.io** as websocket framework
