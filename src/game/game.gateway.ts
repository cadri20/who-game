import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket} from "socket.io";
import { CodeGeneratorService } from "./code-generator.service";
import { GameService } from "./game.service";
import { OnModuleInit } from "@nestjs/common";

function getRoom(socket: Socket) {
    console.log(socket.rooms)
    return Array.from(socket.rooms)[1];
}

@WebSocketGateway()
export class GameGateway implements OnModuleInit{
    constructor(
        private readonly codeGeneratorService: CodeGeneratorService,
        private readonly gameService: GameService
        ){

    }

    @WebSocketServer() server: Server;

    onModuleInit() {
        this.server.on('connection', (client: Socket) => {
            client.on('disconnecting', () => this.handleDisconnecting(client));
        });
    }

    handleDisconnecting(client: Socket) {
        console.log(client.id)
        const roomCode = getRoom(client);
        console.log('roomCode ' + roomCode)
        const nick = this.gameService.getNick(client.id);
        if(this.gameService.isHost(roomCode, nick)){
            this.gameService.destroyRoom(roomCode);
            this.server.to(roomCode).emit('roomDestroyed');
        }else{
            this.gameService.removePlayer(roomCode, nick, client.id);
            this.server.to(roomCode).emit('playersUpdate', {players: this.gameService.getPlayers(roomCode)});
        }
    }
    
    @SubscribeMessage('createRoom')
    createRoom(client: Socket, data: any) {
        const roomCode = this.codeGeneratorService.generateCode();
        this.gameService.registerSocket(data.nick, client.id);
        client.join(roomCode);
        this.gameService.createRoom(roomCode);
        this.gameService.addPlayer(data.nick, roomCode);
        this.gameService.setHost(roomCode, data.nick);

        client.emit('createRoom', {roomCode: roomCode});
    }

    @SubscribeMessage('joinRoom')
    joinRoom(client: Socket, data: any) {
        if(this.gameService.roomExists(data.roomCode)){
            if(this.gameService.isRoomFull(data.roomCode)){
                client.emit('error', {error: 'room-full'});
                return;
            }else{
                this.gameService.registerSocket(data.nick, client.id);
                client.join(data.roomCode);
                this.gameService.addPlayer(data.nick, data.roomCode);
                this.server.to(data.roomCode).emit('playersUpdate', {players: this.gameService.getPlayers(data.roomCode)});
                client.emit('joinRoom', {roomCode: data.roomCode});
            }
        }
        else{
            client.emit('joinRoom', {roomCode: null});
        }
    }

    @SubscribeMessage('startGame')
    startGame(client: Socket, data: any) {
        
        console.log(client.rooms)
        const roomCode = getRoom(client);
        console.log('roomCode ' + roomCode)
        this.gameService.startGame(roomCode);
        const question = this.gameService.nextQuestion(roomCode);
        const options = this.gameService.getPlayers(roomCode);
        this.server.to(roomCode).emit('question', {question, options});

    }

    @SubscribeMessage('submitAnswer')
    submitAnswer(client: Socket, data: any) {
        const roomCode = getRoom(client);
        this.gameService.submitAnswer(roomCode, data.nick, data.answer);
        if(this.gameService.allPlayersHasAnswered(roomCode)){
            const mostVoted = this.gameService.getCurrentMostVoted(roomCode);
            const votes = this.gameService.getVotes(roomCode);
            this.server.to(roomCode).emit('questionAnswered', {mostVoted, votes});
        }else{
            const playersWithoutAnswer = this.gameService.getPlayersWithoutAnswer(roomCode);
            client.emit('submitAnswer', {playersWithoutAnswer});
        }
    }

    @SubscribeMessage('nextQuestion')
    nextQuestion(client: Socket, data: any) {
        const roomCode = getRoom(client);
        if (this.gameService.isHost(roomCode, data.nick)) {
            if (this.gameService.thereAreMoreQuestions(roomCode)) {
                const question = this.gameService.nextQuestion(roomCode);
                const options = this.gameService.getPlayers(roomCode);
                this.server.to(roomCode).emit('question', { question, options });
            } else {
                const mostVoted = this.gameService.getMostVoted(roomCode);
                this.server.to(roomCode).emit('gameOver', { mostVoted});
            }
        }
        
    }


    
}
