// tournamentRoutes.cjs

const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournamentController.cjs");

router.post("/create", tournamentController.createTournament);
router.post("/accept", tournamentController.acceptTournamentInvitation);
router.post("/reject", tournamentController.rejectTournamentInvitation);
router.get("/active/:userId", tournamentController.getActiveTournament);
router.get("/active/:userId", tournamentController.getActiveTournament);
router.get("/active/:userId", tournamentController.getActiveTournament);
router.get(
  "/invitations/:userId",
  tournamentController.getTournamentInvitations
);

module.exports = router;
