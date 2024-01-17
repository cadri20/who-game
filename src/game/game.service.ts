import { Injectable } from "@nestjs/common";
import { get } from "http";
import { Game, Vote } from "./game.interface";
import { max } from "rxjs";
import { QuestionService } from "src/questions/question.service";

@Injectable()
export class GameService{
    private readonly rooms = new Map<string, Game>();
    private sockets = new Map<string, string>();

    constructor(private readonly questionService: QuestionService) {
    }
    
    registerSocket(nick: string , socketId: string){
        this.sockets.set(socketId, nick);
    }

    getNick(socketId: string): string{
        return this.sockets.get(socketId);
    }

    createRoom(id: string){
        this.rooms.set(id, new Game());
    }

    setHost(roomId: string, nick: string){
        this.rooms.get(roomId).host = nick;
    }

    isHost(roomId: string, nick: string): boolean{
        const room = this.rooms.get(roomId);
        if(room){
            return room.host === nick;
        }else{
            return false;
        }

    }

    addPlayer(nick: string, roomId: string){
        console.log('add ' + nick + ' to ' + roomId)
        this.rooms.get(roomId).addPlayer(nick);
    }

    isRoomFull(roomId: string): boolean{
        const maxPlayers = process.env.NODE_ENV === 'development' ? 8 : 8;
        return this.rooms.get(roomId).players.length === maxPlayers;
    }

    removePlayer(roomId: string, nick: string, socketId: string){
        const room = this.rooms.get(roomId);    
        if(room){
            room.removePlayer(nick);
        }
        this.sockets.delete(socketId);
    }
    getPlayers(roomId: string): string[]{
        return this.rooms.get(roomId)?.players ?? [];
    }

    startGame(roomId: string){
        this.rooms.get(roomId).startGame();
    }

    nextQuestion(roomId: string): string{
        return this.rooms.get(roomId).nextQuestion();
    }

    submitAnswer(roomId: string, nick: string, answer: string){
        this.rooms.get(roomId).submitAnswer(nick, answer);
    }

    allPlayersHasAnswered(roomId: string): boolean{
        return this.rooms.get(roomId).allPlayersHasAnswered;
    }

    getCurrentMostVoted(roomId: string): string[]{
        return this.rooms.get(roomId).currentMostVoted;
    }

    getVotes(roomId: string): Vote[]{
        const answers = this.rooms.get(roomId).currentAnswers;
        const votes: Vote[] = [];
        for(const [nick, answer] of answers){
            votes.push({voter: nick, votedPlayer: answer});
        }

        return votes;
    }

    getPlayersWithoutAnswer(roomId: string): string[]{
        return this.rooms.get(roomId).playersWithoutAnswer;
    }

    thereAreMoreQuestions(roomId: string): boolean{
        return this.rooms.get(roomId).moreQuestions;
    }

    getMostVoted(roomId: string): string[]{
        return this.rooms.get(roomId).mostVoted;
    }

    roomExists(roomId: string): boolean{
        return this.rooms.has(roomId);
    }

    destroyRoom(roomId: string){
        this.rooms.delete(roomId);
    }

    playAgain(roomId: string){
        this.rooms.get(roomId).restart();
    }

    async setQuestionsCategory(roomId: string, category: string){
        let questions: string[];
        if(category == 'all'){
            questions = await this.questionService.getAllQuestions();
        }else{
            questions = await this.questionService.getQuestions(category);
        }
        
        this.rooms.get(roomId).questions = questions;
    }


}