class Player {
  constructor(rankIndex, points, first, second, third, fourth) {
    this._rankIndex = rankIndex; // Ex: 0, 1, 2 etc
    this._points = points; // 1020
    this._first = first; // 33
    this._second = second; // 25
    this._third = third; // 20
    this._fourth = fourth; // 22
  }

  simulationMode = true;
  promotionMode = false;

  get first() {
    return this._first;
  }
  get second() {
    return this._second;
  }
  get third() {
    return this._third;
  }
  get fourth() {
    return this._fourth;
  }

  get points() {
    return this._points;
  }
  set points(points) {
    this._points = points;
  }

  get rank() {
    return Ranks[this._rankIndex];
  }
  get rankIndex() {
    return this._rankIndex;
  }
  set rankIndex(index) {
    if (index <= 0) {
      this._rankIndex = 0;
    } else if (index >= Ranks.length) {
      this.rankIndex = Ranks.length - 1;
    } else {
      this._rankIndex = index;
    }
  }

  get averagePlacement() {
    return (this.first + this.second + this.third + this.fourth) / 4;
  }

  get recommendedRoom() {
    return this.rank.id.includes("sa")
      ? (this._recommendedRoom = Rooms["ja"])
      : this.rank.id.includes("ma")
      ? (this._recommendedRoom = Rooms["ja"])
      : this.rank.id.includes("ex")
      ? (this._recommendedRoom = Rooms["go"])
      : this.rank.id.includes("ad")
      ? (this._recommendedRoom = Rooms["si"])
      : (this._recommendedRoom = Rooms["br"]);
  }

  promotePlayer() {
    if (this._rankIndex < Ranks.length - 1) {
      this.rankIndex++;
    }
    this.points = this.rank.startingPoints;
  }

  demotePlayer() {
    if (this._rankIndex > 0) {
      this.rankIndex--;
      this.points = this.rank.startingPoints;
    } else {
      if (this.points < 0) {
        this.points = 0;
      }
    }
  }

  playGame(mode, room) {
    // Simulate a game in the recommended room and set the player's points according to the results of the room
    const getRandomResult = () => {
      const firsts = Array(this.first).fill(0);
      const seconds = Array(this.second).fill(1);
      const thirds = Array(this.third).fill(2);
      const fourths = Array(this.fourth).fill(3);
      const weighedArray = [...firsts, ...seconds, ...thirds, ...fourths];
      const idx = Math.floor(Math.random() * weighedArray.length);
      return weighedArray[idx];
    };

    const result = getRandomResult();
    console.log(
      `[${room.name} Table] At ${this.rank.name} Player placed ${
        result + 1
      } th.`
    );

    if (result < 3) {
      this.points += room[mode].points[result];
      console.log(`Won ${room[mode].points[result]} points.`);
    } else {
      this.points -= this.rank.penalty[mode];
      console.log(`Lost ${this.rank.penalty[mode]} points.`);
    }

    if (this.simulationMode) {
      if (result === 0) {
        this.points += 45; // 35,000 -> +45
        console.log(
          "Player additionally won 45 points from points in this game placing 1st."
        );
      } else if (result === 1) {
        this.points += 5; // 25,000 -> +5
        console.log(
          "Player additionally won 5 points from points in this game placing 2nd."
        );
      } else if (result === 2) {
        this.points -= 15; // 25,000 -> -15
        console.log(
          "Player additionally lost 15 points from points in this game placing 3rd."
        );
      } else {
        this.points -= 35; // 15,000 -> -35
        console.log(
          "Player additionally lost 35 points from points in this game placing 4th."
        );
      }
    }

    console.log(
      `Progress: ${this.points}/${this.rank.targetPoints} points. [${this.rank.startingPoints}]`
    );

    // If the player's points are less than 0, demote them
    if (this.points < 0) {
      console.log("Player was demoted from " + this.rank.name);
      this.demotePlayer();
      console.log(`Player is now at ${this.rank.name}`);
    }

    // If the player's points are greater than the target points, increase the rank and reset the points back to the following ranks starting points
    if (this.points >= this.rank.targetPoints) {
      console.log("Player was promoted from " + this.rank.name);
      this.promotePlayer();
      console.log(`Player is now at ${this.rank.name}`);
    }
  }

  playMultipleGames(numberOfGames, mode, room) {
    for (let i = 0; i < numberOfGames; i++) {
      console.log("Playing game n: ", i + 1);
      this.playGame(mode, room || this.recommendedRoom);
    }
  }
}

class Room {
  constructor(
    name,
    firstPointsEast,
    firstPointsSouth,
    secondPointsEast,
    secondPointsSouth,
    requiredRanks
  ) {
    this.name = name;
    this.east = {
      points: [firstPointsEast, secondPointsEast, 0],
    };
    this.south = {
      points: [firstPointsSouth, secondPointsSouth, 0],
    };
    this.requiredRanks = requiredRanks;
  }
}

class Rank {
  constructor(
    id,
    name,
    startingPoints,
    targetPoints,
    penaltyEast,
    PenaltySouth
  ) {
    this.id = id;
    this.name = name;
    this.startingPoints = startingPoints;
    this.targetPoints = targetPoints;
    this.penalty = {
      east: penaltyEast,
      south: PenaltySouth,
    };
  }
}

const Ranks = [
  new Rank("ad1", "Adept/Janshi ★", 300, 600, 10, 20),
  new Rank("ad2", "Adept/Janshi ★★", 400, 800, 20, 40),
  new Rank("ad3", "Adept/Janshi ★★★", 500, 1000, 30, 60),
  new Rank("ex1", "Expert/Janketsu ★", 600, 1200, 40, 80),
  new Rank("ex2", "Expert/Janketsu ★★", 700, 1400, 50, 100),
  new Rank("ex3", "Expert/Janketsu ★★★", 1000, 2000, 60, 120),
  new Rank("ma1", "Master/Jangou ★", 1400, 2800, 80, 165),
  new Rank("ma2", "Master/Jangou ★★", 1600, 3200, 90, 180),
  new Rank("ma3", "Master/Jangou ★★★", 1800, 3600, 100, 195),
  new Rank("sa1", "Saint/Jansei ★", 2000, 4000, 110, 210),
  new Rank("sa2", "Saint/Jansei ★★", 3000, 6000, 120, 225),
  new Rank("sa3", "Saint/Jansei ★★★", 4500, 9000, 130, 240),
];

const Rooms = {
  br: new Room("Bronze", 10, 20, 5, 10, ["ad1", "ad2", "ad3"]),
  si: new Room("Silver", 20, 40, 10, 20, [
    "ad1",
    "ad2",
    "ad3",
    "ex1",
    "ex2",
    "ex3",
  ]),
  go: new Room("Gold", 40, 80, 20, 40, [
    "ex1",
    "ex2",
    "ex3",
    "ma1",
    "ma2",
    "ma3",
  ]),
  ja: new Room("Jade", 55, 110, 30, 55, [
    "ma1",
    "ma2",
    "ma3",
    "sa1",
    "sa2",
    "sa3",
  ]),
  th: new Room("Throne", 60, 120, 30, 60, ["sa1", "sa2", "sa3"]),
};

const calculateRank = (
  rankIndex,
  startingPoints,
  first,
  second,
  third,
  fourth
) => {
  const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const createNewPlayer = () =>
    new Player(rankIndex, startingPoints, first, second, third, fourth);

  const originalPlayer = createNewPlayer();
  const games = 150;
  const simulations = 200;
  const ranks = [];

  for (let i = 0; i < simulations; i++) {
    let newPlayer = createNewPlayer();
    newPlayer.playMultipleGames(games, "east", Rooms.go);
    console.log(
      `Player started at ${originalPlayer.rank.name} ${originalPlayer.points} and ended at ${newPlayer.rank.name} ${newPlayer.points} after ${games} games.`
    );
    ranks.push(newPlayer.rankIndex);
  }

  const averageRank = Math.floor(average(ranks));
  const maxRank = Math.max(...ranks);

  const maxRankOccurrence = ranks.filter((rank) => rank === maxRank).length;
  const avgRankOccurrence = ranks.filter((rank) => rank === averageRank).length;

  console.log(
    "Max rank " +
      Ranks[maxRank].name +
      " occurred " +
      maxRankOccurrence +
      "out of " +
      simulations +
      " times."
  );

  console.log("Average Rank: ", Ranks[averageRank].name);
  console.log(
    "Average Rank Occurrence: ",
    avgRankOccurrence + " times out of " + simulations + " times."
  );

  console.table(ranks);
};

calculateRank(3, 1142, 28, 32, 20, 20);
