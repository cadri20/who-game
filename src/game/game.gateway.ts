import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket} from "socket.io";
import { CodeGeneratorService } from "./code-generator.service";
import { GameService } from "./game.service";
import { OnModuleInit } from "@nestjs/common";
import { QuestionService } from "src/questions/question.service";

function getRoom(socket: Socket) {
    console.log(socket.rooms)
    return Array.from(socket.rooms)[1];
}

@WebSocketGateway()
export class GameGateway implements OnModuleInit{
    constructor(
        private readonly codeGeneratorService: CodeGeneratorService,
        private readonly gameService: GameService,
        private readonly questionService: QuestionService
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
    async createRoom(client: Socket, data: any) {
        const roomCode = this.codeGeneratorService.generateCode();
        this.gameService.registerSocket(data.nick, client.id);
        client.join(roomCode);
        this.gameService.createRoom(roomCode);
        this.gameService.addPlayer(data.nick, roomCode);
        this.gameService.setHost(roomCode, data.nick);
        const categories = await this.questionService.getCategories();
        client.emit('createRoom', {roomCode: roomCode, categories});
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
    async startGame(client: Socket, data: any) {
        const category = data.category;
        console.log('category ' + category)
        console.log(client.rooms)
        const roomCode = getRoom(client);
        console.log('roomCode ' + roomCode)
        await this.gameService.setQuestionsCategory(roomCode, category);
        this.gameService.startGame(roomCode);
        const question = this.gameService.nextQuestion(roomCode);
        const options = this.gameService.getPlayers(roomCode);
        this.server.to(roomCode).emit('question', {question, options});

    }

    @SubscribeMessage('submitAnswer')
    submitAnswer(client: Socket, data: any) {
        const roomCode = getRoom(client);
        const nick = this.gameService.getNick(client.id);
        this.gameService.submitAnswer(roomCode, nick, data.answer);
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
        const nick = this.gameService.getNick(client.id);
        if (this.gameService.isHost(roomCode, nick)) {
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
