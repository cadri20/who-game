import { Module } from "@nestjs/common";
import { GameGateway } from "./game.gateway";
import { GameService } from "./game.service";
import { QuestionService } from "src/questions/question.service";
import { CodeGeneratorService } from "./code-generator.service";
import { FirestoreQuestionService } from "src/questions/question.service";

@Module({
    imports: [],
    controllers: [],
    providers: [GameService, GameGateway, CodeGeneratorService,
      {
        provide: QuestionService,
        useClass: FirestoreQuestionService
      }
    ],
  })
export class GameModule {}