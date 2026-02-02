import { Module } from "@nestjs/common";
import { ImagesController } from "./images.controller";
import { ImagesService } from "./images.service";
import { WordPressService } from "./services/wordpress.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ImagesController],
  providers: [ImagesService, WordPressService],
})
export class ImagesModule {}
