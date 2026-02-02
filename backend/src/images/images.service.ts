import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WordPressService } from "./services/wordpress.service";
import { CreateImageDto, UploadToWordPressDto } from "./dto/create-image.dto";
import * as fs from "fs";
import * as path from "path";
import * as sharp from "sharp";

@Injectable()
export class ImagesService {
  constructor(
    private prisma: PrismaService,
    private wordPressService: WordPressService,
  ) {}

  // ===============================
  // UPLOAD IMAGE FROM EXTENSION
  // ===============================
  async uploadImage(createImageDto: CreateImageDto) {
    let { filename, originalUrl, imageBase64 } = createImageDto;

    let imageBuffer: Buffer;
    try {
      imageBuffer = Buffer.from(imageBase64, "base64");
    } catch {
      throw new BadRequestException("Invalid base64 image data");
    }

    // ✅ Convert 1 lần duy nhất → JPG
    imageBuffer = await sharp(imageBuffer).jpeg({ quality: 85 }).toBuffer();

    filename = filename.replace(/\.(webp|png|jpeg|jpg)$/i, ".jpg");

    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    return this.prisma.image.create({
      data: {
        filename,
        url: `/uploads/${filename}`,
        originalUrl,
        size: imageBuffer.length,
        mimeType: "image/jpeg",
        status: "pending",
      },
    });
  }

  // ===============================
  // UPLOAD IMAGE TO WORDPRESS
  // ===============================
  async uploadToWordPress(uploadToWordPressDto: UploadToWordPressDto) {
    const { imageId } = uploadToWordPressDto;

    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new BadRequestException("Image not found");
    }

    const filepath = path.join(process.cwd(), image.url);
    if (!fs.existsSync(filepath)) {
      throw new BadRequestException("Image file not found");
    }

    const imageBuffer = fs.readFileSync(filepath);

    const wpResult = await this.wordPressService.uploadMedia(
      imageBuffer,
      image.filename, // image.jpg
      image.mimeType, // image/jpeg
    );

    return this.prisma.image.update({
      where: { id: imageId },
      data: {
        wordpressMediaId: wpResult.id,
        wordpressUrl: wpResult.source_url,
        status: "published",
      },
    });
  }

  // ===============================
  async getImage(id: number) {
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) throw new BadRequestException("Image not found");
    return image;
  }

  async getAllImages() {
    return this.prisma.image.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteImage(id: number) {
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) throw new BadRequestException("Image not found");

    const filepath = path.join(process.cwd(), image.url);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

    await this.prisma.image.delete({ where: { id } });
    return { message: "Image deleted successfully" };
  }
}
