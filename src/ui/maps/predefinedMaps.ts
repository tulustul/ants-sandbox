const prefix = location.host.includes("github.io") ? "/ants-sandbox" : "";

export default {
  tour: {
    "1: Single ant": `${prefix}/maps/tour/tour_1.map`,
    "2: Maze": `${prefix}/maps/tour/tour_2.map`,
  },
  mazes: {
    "Maze 1": `${prefix}/maps/mazes/maze_1.map`,
    "Maze 2": `${prefix}/maps/mazes/maze_2.map`,
    "Maze 3": `${prefix}/maps/mazes/maze_3.map`,
    "Maze circular 1": `${prefix}/maps/mazes/maze_circular_1.map`,
    "Maze circular 2": `${prefix}/maps/mazes/maze_circular_2.map`,
    "Maze hexagonal": `${prefix}/maps/mazes/maze_hexagonal.map`,
    "Maze triangular": `${prefix}/maps/mazes/maze_triangular.map`,
  },
  people: {
    Vateusz: `${prefix}/maps/people/Vateusz.map`,
    "Elon Musk": `${prefix}/maps/people/ElonMusk.map`,
    Avengers: `${prefix}/maps/people/Avengers.map`,
  },
  other: {
    "Circle of food": `${prefix}/maps/other/circle_of_food.map`,
  },
};
