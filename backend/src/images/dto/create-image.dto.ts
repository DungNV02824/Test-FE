import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  originalUrl: string;

  @IsNotEmpty()
  imageBase64: string;

  @IsString()
  @IsOptional()
  mimeType?: string;
}

export class UploadToWordPressDto {
  @IsNotEmpty()
  imageId: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
