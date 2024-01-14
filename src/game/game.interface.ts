
export class Game{
    players: string[];
    host: string;
    questions: string[];
    currentQuestion: number;
    currentAnswers: Map<string, string>;
    currentVotes: Map<string, number>;
    mostVoted: string[];

    constructor(){
        this.players = [];
        this.questions = ['quien es el mas guapo', 'quien es el mas feo', 'quien es el mas tonto', 'quien es el mas listo', 'quien es el mas alto', 'quien es el mas bajo', 'quien es el mas gordo', 'quien es el mas delgado', 'quien es el mas fuerte', 'quien es el mas debil', 'quien es el mas rapido', 'quien es el mas lento', 'quien es el mas rico', 'quien es el mas pobre', 'quien es el mas guapo', 'quien es el mas feo', 'quien es el mas tonto', 'quien es el mas listo', 'quien es el mas alto', 'quien es el mas bajo', 'quien es el mas gordo', 'quien es el mas delgado', 'quien es el mas fuerte', 'quien es el mas debil', 'quien es el mas rapido', 'quien es el mas lento', 'quien es el mas rico', 'quien es el mas pobre']
        this.currentQuestion = 0;
        this.currentVotes = new Map<string, number>();
        this.currentAnswers = new Map<string, string>();
        this.mostVoted = [];
    }

    addPlayer(nick: string){
        this.players.push(nick);
    }

    startGame(){
        this.currentQuestion = 0;
    }

    resetVotes(){
        this.currentVotes = new Map<string, number>();
        for(const player of this.players){
            this.currentVotes.set(player, 0);
        }
    }

    nextQuestion(): string{
        this.resetVotes();
        if(this.currentQuestion != 0){
            this.currentAnswers = new Map<string, string>()
            this.mostVoted.push(...this.currentMostVoted);
            
        }
        const question = this.questions[this.currentQuestion];
        this.currentQuestion++;
        return question;
    }

    submitAnswer(nick: string, answer: string){
        this.currentAnswers.set(nick, answer);
        const votes = this.currentVotes.get(answer);
        this.currentVotes.set(answer, votes + 1);
    }

    get allPlayersHasAnswered(): boolean{
        return this.currentAnswers.size === this.players.length;
    }

    get currentMostVoted(): string[]{
        const mostVoted = Math.max(...this.currentVotes.values());
        const mostVotedPlayers = [];
        for(const [player, votes] of this.currentVotes.entries()){
            if(votes === mostVoted){
                mostVotedPlayers.push(player);
            }
        }
        return mostVotedPlayers;
    }

    get playersWithoutAnswer(): string[]{
        const playersWithoutAnswer = [];
        for(const player of this.players){
            if(!this.currentAnswers.has(player)){
                playersWithoutAnswer.push(player);
            }
        }
        return playersWithoutAnswer;
    }

    get moreQuestions(): boolean{
        return this.currentQuestion != this.questions.length;
    }
}