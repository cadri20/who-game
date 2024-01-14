import { Module } from "@nestjs/common";
import { GameGateway } from "./game.gateway";
import { GameService } from "./game.service";
import { CodeGeneratorService } from "./code-generator.service";

@Module({
    imports: [],
    controllers: [],
    providers: [GameService, GameGateway, CodeGeneratorService],
  })
export class GameModule {}