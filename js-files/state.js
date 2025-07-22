const GlobalState = {
  currentMode: "autonomous",
  roastCooldown: 30000,
  isIdle: false,
  screenAnalysisEnabled: true,
  onUpdate: null, // callback hook for UI
};

module.exports = GlobalState;
