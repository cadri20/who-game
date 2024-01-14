import { Injectable } from "@nestjs/common";
import { get } from "http";
import { Game } from "./game.interface";
import { max } from "rxjs";

@Injectable()
export class GameService{
    private readonly rooms = new Map<string, Game>();
    private sockets = new Map<string, string>();
    
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
        return this.rooms.get(roomId).host === nick;
    }

    addPlayer(nick: string, roomId: string){
        this.rooms.get(roomId).addPlayer(nick);
    }

    isRoomFull(roomId: string): boolean{
        const maxPlayers = process.env.NODE_ENV === 'development' ? 2 : 8;
        return this.rooms.get(roomId).players.length === maxPlayers;
    }

    removePlayer(roomId: string, nick: string, socketId: string){
        this.rooms.get(roomId).removePlayer(nick);
        this.sockets.delete(socketId);
    }
    getPlayers(roomId: string): string[]{
        return this.rooms.get(roomId).players;
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

    getVotes(roomId: string): any{
        return Object.fromEntries(this.rooms.get(roomId).currentAnswers);
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

}