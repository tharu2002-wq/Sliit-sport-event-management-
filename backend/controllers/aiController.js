const getPlayerAiSummary = async (req, res) => {
  return res.status(200).json({
    message: "AI player summary is currently unavailable.",
    playerId: req.params.id,
  });
};

const getMatchAiSummary = async (req, res) => {
  return res.status(200).json({
    message: "AI match summary is currently unavailable.",
    matchId: req.params.id,
  });
};

module.exports = {
  getPlayerAiSummary,
  getMatchAiSummary,
};
