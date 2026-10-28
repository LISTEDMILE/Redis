import redis from "../redis.js";

// ============================================================
// 1. ADD / INCREASE PLAYER SCORE
// ============================================================

// Endpoint:
// POST /api/leaderboard/score
//
// Example request body:
//
// {
//   "player": "Rahul",
//   "points": 50
// }
//
// What we want to do:
//
// Rahul already has 100 points
// Rahul gets 50 more points
// Redis should make it:
//
// Rahul = 150
//
// We use Redis ZINCRBY for this.
//
// ZINCRBY means:
// "Increase the score of this player by this many points."
//
// Redis command looks like:
//
// ZINCRBY leaderboard 50 Rahul
//
// "leaderboard" -> name of our Redis Sorted Set
// 50            -> points to add
// Rahul         -> player name

export const addScore = async (req, res) => {
    try {
        // --------------------------------------------------------
        // STEP 1: Get data sent by the client
        // --------------------------------------------------------

        // req.body contains the JSON sent from Postman/frontend.
        //
        // Example:
        //
        // {
        //   player: "Rahul",
        //   points: 50
        // }

        const { player, points } = req.body;

        // --------------------------------------------------------
        // STEP 2: Increase player's score in Redis
        // --------------------------------------------------------

        const newScore = await redis.zincrby(
            "leaderboard", // Redis Sorted Set name
            points, // How many points to add
            player, // Player whose score we want to increase
        );

        // IMPORTANT:
        //
        // If Rahul doesn't exist:
        //
        // Rahul = 0
        // + 50
        // = 50
        //
        // If Rahul already has 100:
        //
        // Rahul = 100
        // + 50
        // = 150
        //
        // Redis automatically handles both cases.
        //
        // newScore contains the updated score.

        // --------------------------------------------------------
        // STEP 3: Send response to client
        // --------------------------------------------------------

        res.json({
            message: "Score added successfully",
            player,
            score: Number(newScore),
        });
    } catch (error) {
        // If something goes wrong while talking to Redis,
        // the error will come here.

        console.error(error);

        res.status(500).json({
            message: "Something went wrong",
        });
    }
};

// ============================================================
// 2. GET COMPLETE LEADERBOARD
// ============================================================

// Endpoint:
// GET /api/leaderboard
//
// This endpoint should give us all players
// from highest score to lowest score.
//
// Example:
//
// Rahul -> 200
// Aman  -> 150
// Rohit -> 100
//
// We use ZREVRANGE.
//
// Why ZREVRANGE?
//
// ZRANGE     -> lowest score to highest score
// ZREVRANGE  -> highest score to lowest score
//
// Since this is a leaderboard,
// we want the highest score first.
//
// Redis command:
//
// ZREVRANGE leaderboard 0 -1 WITHSCORES
//
// "leaderboard" -> Sorted Set name
// 0             -> start from first player
// -1            -> go until the last player
// WITHSCORES    -> also give us each player's score

export const getLeaderboard = async (req, res) => {
    try {
        // --------------------------------------------------------
        // STEP 1: Ask Redis for the leaderboard
        // --------------------------------------------------------

        const leaderboard = await redis.zrevrange(
            "leaderboard", // Sorted Set name

            0, // Start index
            // 0 means first player

            -1, // End index
            // -1 means last player

            "WITHSCORES", // Give player names AND their scores
        );

        // --------------------------------------------------------
        // STEP 2: Send Redis result to client
        // --------------------------------------------------------

        res.json(leaderboard);

        // Redis will return something like:
        //
        // [
        //   "Rahul",
        //   "200",
        //   "Aman",
        //   "150",
        //   "Rohit",
        //   "100"
        // ]
        //
        // Notice something important:
        //
        // Redis gives us:
        //
        // player
        // score
        // player
        // score
        //
        // We are currently sending this directly.
        //
        // Later we can convert it into a cleaner format:
        //
        // [
        //   {
        //     rank: 1,
        //     player: "Rahul",
        //     score: 200
        //   },
        //   ...
        //   ]
        //
        // But for learning Redis,
        // seeing the raw Redis result is actually useful.
    } catch (error) {
        // Something went wrong while getting data from Redis.

        console.error(error);

        res.status(500).json({
            message: "Something went wrong",
        });
    }
};

// ============================================================
// 3. GET ONE PLAYER'S SCORE AND RANK
// ============================================================

// Endpoint:
// GET /api/leaderboard/:player
//
// Example:
//
// GET /api/leaderboard/Rahul
//
// We want to know:
//
// Rahul's score?
// Rahul's rank?
//
// We will use TWO Redis commands:
//
// 1. ZSCORE
//    -> Gives player's score
//
// 2. ZREVRANK
//    -> Gives player's rank when sorted
//       from highest score to lowest score.

export const getPlayer = async (req, res) => {
    try {
        // --------------------------------------------------------
        // STEP 1: Get player name from URL
        // --------------------------------------------------------

        // If request is:
        //
        // /api/leaderboard/Rahul
        //
        // then:
        //
        // req.params.player
        //
        // will be:
        //
        // "Rahul"

        const { player } = req.params;

        // --------------------------------------------------------
        // STEP 2: Get player's score
        // --------------------------------------------------------

        const score = await redis.zscore(
            "leaderboard", // Sorted Set name
            player, // Player we are searching for
        );

        // Example:
        //
        // Rahul has 200 points
        //
        // score = "200"
        //
        // Redis returns the score as a string,
        // which is why later we use Number(score).

        // --------------------------------------------------------
        // STEP 3: Get player's rank
        // --------------------------------------------------------

        const rank = await redis.zrevrank(
            "leaderboard", // Sorted Set name
            player, // Player whose rank we want
        );

        // IMPORTANT:
        //
        // Redis uses ZERO-BASED ranking.
        //
        // Example:
        //
        // Rahul -> 0
        // Aman  -> 1
        // Rohit -> 2
        //
        // But users expect:
        //
        // Rahul -> 1
        // Aman  -> 2
        // Rohit -> 3
        //
        // That's why below we do:
        //
        // rank + 1

        // --------------------------------------------------------
        // STEP 4: Check if player exists
        // --------------------------------------------------------

        if (score === null) {
            // Redis returns null when the player
            // doesn't exist in the Sorted Set.

            return res.status(404).json({
                message: "Player not found",
            });
        }

        // --------------------------------------------------------
        // STEP 5: Send player's information
        // --------------------------------------------------------

        res.json({
            player,

            // Redis gives score as a string,
            // so convert it into a number.

            score: Number(score),

            // Redis rank starts from 0,
            // so add 1 for a normal human-readable rank.

            rank: rank + 1,
        });
    } catch (error) {
        // If Redis gives an error,
        // handle it here.

        console.error(error);

        res.status(500).json({
            message: "Something went wrong",
        });
    }
};
