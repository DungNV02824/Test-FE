import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  BadRequestException,
} from "@nestjs/common";
import { ImagesService } from "./images.service";
import { CreateImageDto, UploadToWordPressDto } from "./dto/create-image.dto";

@Controller("api/images")
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post("upload")
  async uploadImage(@Body() createImageDto: CreateImageDto) {
    return this.imagesService.uploadImage(createImageDto);
  }

  @Post("upload-to-wordpress")
  async uploadToWordPress(@Body() uploadToWordPressDto: UploadToWordPressDto) {
    return this.imagesService.uploadToWordPress(uploadToWordPressDto);
  }

  @Get()
  async getAllImages() {
    return this.imagesService.getAllImages();
  }

  @Get(":id")
  async getImage(@Param("id") id: string) {
    const imageId = parseInt(id, 10);
    if (isNaN(imageId)) {
      throw new BadRequestException("Invalid image ID");
    }
    return this.imagesService.getImage(imageId);
  }

  @Delete(":id")
  async deleteImage(@Param("id") id: string) {
    const imageId = parseInt(id, 10);
    if (isNaN(imageId)) {
      throw new BadRequestException("Invalid image ID");
    }
    return this.imagesService.deleteImage(imageId);
  }
}
