
export class Game{
    players: string[];
    host: string;
    questions: string[];
    currentQuestion: number;
    currentAnswers: Map<string, string>;
    currentVotes: Map<string, number>;
    mostVotedPerRound: string[][];

    constructor(questions: string[] = []){
        this.players = [];
        this.questions = questions
        this.currentQuestion = 0;
        this.currentVotes = new Map<string, number>();
        this.currentAnswers = new Map<string, string>();
        this.mostVotedPerRound = [];
    }

    addPlayer(nick: string){
        this.players.push(nick);
    }

    removePlayer(nick: string){
        this.players = this.players.filter(player => player !== nick);
    }

    startGame(){
        this.currentQuestion = 0;
    }

    resetVotes(){
        this.currentVotes = new Map<string, number>();
        this.currentAnswers = new Map<string, string>();
        for(const player of this.players){
            this.currentVotes.set(player, 0);
        }
    }

    nextQuestion(): string{
    
        this.resetVotes();
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

        this.mostVotedPerRound.push(mostVotedPlayers);
        return mostVotedPlayers;
    }

    //get the most voted player in all the rounds
    get mostVoted(): string[]{
        //convert the mostVotedPerRound matrix into a map with the player as key and the number of times he was the most voted as value
        const mostVotedMap = new Map<string, number>();
        for(const mostVotedRound of this.mostVotedPerRound){
            for(const player of mostVotedRound){
                let votes = mostVotedMap.get(player);
                if(!votes){
                    mostVotedMap.set(player, 0);
                    votes = 0;
                }
                mostVotedMap.set(player, votes + 1);
            }
        }

        //get the most voted player
        const mostVoted = Math.max(...mostVotedMap.values());
        const mostVotedPlayers = [];
        for(const [player, votes] of mostVotedMap.entries()){
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

export interface QuestionCategory{
    key: string;
    category: string;
}