import { Injectable } from "@nestjs/common";

@Injectable()
export class CodeGeneratorService {

    constructor() {
    }
    generateCode(): string {
        if(process.env.NODE_ENV == 'development'){
            return 'AAAA';
        }else{
            return this.generateRandomCode();
        }
    }

    private generateRandomCode(): string{
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += this.getRandomChar();
        }
        return code;
    }

    private getRandomChar(): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return chars.charAt(Math.floor(Math.random() * chars.length));
    }
}