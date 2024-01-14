import { Game } from "./game.interface";

describe("Game", () => {
    const game = new Game();
    
    describe('get most voted player in all the rounds', () => {
        it('should return three players', () => {
            game.mostVotedPerRound = [["player1", "player2"], ["player1", "player3"], ["player2", "player3"]];
            expect(game.mostVoted).toEqual(["player1", "player2", "player3"]);
        });
        it('should return one player', () => {
            game.mostVotedPerRound = [["player1", "player2"], ["player1", "player3"], ["player1", "player3"]];
            expect(game.mostVoted).toEqual(["player1"]);
        });

    });


});