
const Player = require("../models/Player");
const Team = require("../models/Team");
const Match = require("../models/Match");
const Result = require("../models/Result");
const { generateGeminiText } = require("../utils/gemini");
const { MATCH_DETAIL_POPULATE } = require("../utils/matchPopulate");


const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function findTeamsForPlayer(playerId) {
  return Team.find({ members: playerId })
    .select("teamName sportType")
    .lean();
}

function playerMatchSide(playerTeamIds, m) {
  const a =
    m.teamA && typeof m.teamA === "object" && m.teamA !== null && "_id" in m.teamA
      ? String(m.teamA._id)
      : String(m.teamA ?? "");
  const b =
    m.teamB && typeof m.teamB === "object" && m.teamB !== null && "_id" in m.teamB
      ? String(m.teamB._id)
      : String(m.teamB ?? "");
  const inA = playerTeamIds.has(a);
  const inB = playerTeamIds.has(b);
  if (inA && !inB) return "A";
  if (inB && !inA) return "B";
  if (inA && inB) return "A";
  return null;
}

// @desc    AI-generated summary for a player (matches, scores, notes)
// @route   GET /api/players/:id/ai-summary
// @access  Private
const getPlayerAiSummary = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(503).json({
        message:
          "AI summary is not configured. Set GEMINI_API_KEY in the server environment (never expose it in the client).",
      });
    }

    const player = await Player.findById(req.params.id)
      .populate("participationHistory", "title sportType startDate endDate status")
      .lean();

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const teams = await findTeamsForPlayer(player._id);
    const teamIds = teams.map((t) => t._id);
    const playerTeamIds = new Set(teamIds.map((id) => String(id)));

    const matches =
      teamIds.length === 0
        ? []
        : await Match.find({
            $or: [{ teamA: { $in: teamIds } }, { teamB: { $in: teamIds } }],
          })
            .populate("event", "title sportType startDate endDate status")
            .populate("teamA", "teamName sportType")
            .populate("teamB", "teamName sportType")
            .populate("venue", "venueName")
            .sort({ date: -1, startTime: -1 })
            .lean();

    const matchIds = matches.map((m) => m._id);
    const results =
      matchIds.length === 0
        ? []
        : await Result.find({ match: { $in: matchIds } }).lean();

    const resultByMatch = new Map(results.map((r) => [String(r.match), r]));
    const playerIdStr = String(player._id);

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let completedWithScore = 0;

    const matchLines = [];

    for (const m of matches) {
      const eventTitle = m.event?.title ?? null;
      const sport = m.event?.sportType ?? m.teamA?.sportType ?? m.teamB?.sportType ?? null;
      const dateStr = m.date ? new Date(m.date).toISOString().slice(0, 10) : null;
      const teamAName = m.teamA?.teamName ?? "Team A";
      const teamBName = m.teamB?.teamName ?? "Team B";
      const venueName = m.venue?.venueName ?? null;
      const side = playerMatchSide(playerTeamIds, m);
      const resDoc = resultByMatch.get(String(m._id));

      let line = `- ${dateStr ?? "?"} · ${teamAName} vs ${teamBName} · status: ${m.status ?? "?"}`;
      if (venueName) line += ` · ${venueName}`;
      if (eventTitle) line += ` · event: ${eventTitle}`;
      if (sport) line += ` · sport: ${sport}`;

      if (resDoc && side) {
        completedWithScore += 1;
        const myScore = side === "A" ? resDoc.scoreA : resDoc.scoreB;
        const opScore = side === "A" ? resDoc.scoreB : resDoc.scoreA;
        goalsFor += myScore;
        goalsAgainst += opScore;
        const myTeamName = side === "A" ? teamAName : teamBName;
        line += ` · result: ${resDoc.scoreA}-${resDoc.scoreB} (player's team: ${myTeamName}, ${myScore} for / ${opScore} against)`;

        if (!resDoc.winner) {
          draws += 1;
          line += " · outcome: draw";
        } else if (String(resDoc.winner) === (side === "A" ? String(m.teamA._id) : String(m.teamB._id))) {
          wins += 1;
          line += " · outcome: win";
        } else {
          losses += 1;
          line += " · outcome: loss";
        }

        const noteRow = (resDoc.playerNotes || []).find(
          (row) => row.player && String(row.player) === playerIdStr
        );
        const note = typeof noteRow?.note === "string" ? noteRow.note.trim() : "";
        if (note) line += ` · coach/staff note for this player: ${note}`;
      } else if (m.status === "completed" && !resDoc) {
        line += " · (completed; no scorecard in system)";
      }

      matchLines.push(line);
    }

    const participation = Array.isArray(player.participationHistory)
      ? player.participationHistory.map((ev) => ({
          title: ev.title,
          sportType: ev.sportType,
          status: ev.status,
        }))
      : [];

    const contextPayload = {
      player: {
        fullName: player.fullName,
        studentId: player.studentId,
        department: player.department,
        age: player.age,
        gender: player.gender,
        sportTypes: player.sportTypes,
        email: player.email,
      },
      teams: teams.map((t) => ({ teamName: t.teamName, sportType: t.sportType })),
      participationEvents: participation,
      aggregateFromResults: {
        matchesWithRecordedResult: completedWithScore,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
      },
      matches: matchLines,
    };

    const prompt = `You are a concise sports writer for SLIIT university athletics. Write an encouraging, professional player profile summary (about 180–320 words) based ONLY on the JSON data below. 
Do not invent statistics or matches. If data is sparse, say so briefly and focus on teams, sports, and event participation.
Use short paragraphs. Do not use markdown headings; plain text only.

DATA:
${JSON.stringify(contextPayload, null, 2)}`;

    const summary = await generateGeminiText(apiKey, DEFAULT_MODEL, prompt);

    return res.status(200).json({
      summary,
      model: DEFAULT_MODEL,
    });
  } catch (error) {
    return res.status(502).json({
      message: error.message || "Could not generate AI summary",
    });
  }
};

function teamContextFromMatchTeam(t) {
  if (!t || typeof t !== "object") return null;
  const captain =
    t.captain && typeof t.captain === "object"
      ? { fullName: t.captain.fullName, studentId: t.captain.studentId }
      : null;
  const members = Array.isArray(t.members)
    ? t.members.map((p) =>
        p && typeof p === "object"
          ? { fullName: p.fullName, studentId: p.studentId }
          : null
      )
    : [];
  return {
    teamName: t.teamName,
    sportType: t.sportType,
    captain,
    members: members.filter(Boolean),
  };
}

// @desc    AI-generated recap for a completed match (fixture, venue, rosters, result)
// @route   GET /api/matches/:id/ai-summary
// @access  Private
const getMatchAiSummary = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(503).json({
        message:
          "AI summary is not configured. Set GEMINI_API_KEY in the server environment (never expose it in the client).",
      });
    }

    const match = await Match.findById(req.params.id).populate(MATCH_DETAIL_POPULATE).lean();

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status !== "completed") {
      return res.status(400).json({
        message: "AI match summary is only available for matches marked as completed.",
      });
    }

    const resultDoc = await Result.findOne({ match: match._id })
      .populate("winner", "teamName")
      .populate({
        path: "playerNotes.player",
        select: "fullName studentId",
      })
      .lean();

    const ev = match.event;
    const venue = match.venue;

    const playerNotesForContext = (resultDoc?.playerNotes || [])
      .map((row) => {
        const pl = row.player;
        const note = typeof row.note === "string" ? row.note.trim() : "";
        return {
          player:
            pl && typeof pl === "object"
              ? { fullName: pl.fullName, studentId: pl.studentId }
              : null,
          note,
        };
      })
      .filter((r) => r.note || r.player);

    const contextPayload = {
      match: {
        status: match.status,
        date: match.date ? new Date(match.date).toISOString().slice(0, 10) : null,
        startTime: match.startTime,
        endTime: match.endTime,
        round: match.round,
        notes: typeof match.notes === "string" ? match.notes.trim() : "",
      },
      event: ev
        ? {
            title: ev.title,
            sportType: ev.sportType,
            startDate: ev.startDate,
            endDate: ev.endDate,
            status: ev.status,
            description:
              typeof ev.description === "string" && ev.description.length > 2000
                ? `${ev.description.slice(0, 2000)}…`
                : ev.description,
          }
        : null,
      venue: venue
        ? {
            venueName: venue.venueName,
            location: venue.location,
            capacity: venue.capacity,
            status: venue.status,
          }
        : null,
      teamA: teamContextFromMatchTeam(match.teamA),
      teamB: teamContextFromMatchTeam(match.teamB),
      result: resultDoc
        ? {
            scoreA: resultDoc.scoreA,
            scoreB: resultDoc.scoreB,
            winnerTeamName: resultDoc.winner?.teamName ?? null,
            isDraw: !resultDoc.winner,
            officialNotes: typeof resultDoc.notes === "string" ? resultDoc.notes.trim() : "",
            playerNotes: playerNotesForContext,
          }
        : { message: "No result record in the system for this match yet." },
    };

    const prompt = `You are a concise sports writer for SLIIT university athletics. Write a professional match recap (about 180–320 words) based ONLY on the JSON data below.
Cover the fixture context, the two sides and squads where listed, venue and schedule if present, and the outcome plus any official or per-player notes if provided. Do not invent scores, players, or events not in the data.
If the result section says there is no result record, say that briefly and recap what is known from the fixture.
Use short paragraphs. Do not use markdown headings; plain text only.

DATA:
${JSON.stringify(contextPayload, null, 2)}`;

    const summary = await generateGeminiText(apiKey, DEFAULT_MODEL, prompt);

    return res.status(200).json({
      summary,
      model: DEFAULT_MODEL,
    });
  } catch (error) {
    return res.status(502).json({
      message: error.message || "Could not generate AI match summary",
    });
  }
};

module.exports = {
  getPlayerAiSummary,
  getMatchAiSummary,
};
