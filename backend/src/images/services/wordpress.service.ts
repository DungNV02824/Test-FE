import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class WordPressService {
  private wpUrl: string;
  private wpUser: string;
  private wpAppPassword: string;

  constructor(private config: ConfigService) {
    this.wpUrl = this.config.get<string>("WORDPRESS_URL");
    this.wpUser = this.config.get<string>("WORDPRESS_USER");
    this.wpAppPassword = this.config.get<string>("WP_APP_PASSWORD");
  }

  async uploadMedia(imageBuffer: Buffer, filename: string, mimeType: string) {
    const auth = Buffer.from(`${this.wpUser}:${this.wpAppPassword}`).toString(
      "base64",
    );

    try {
      const response = await axios.post(
        `${this.wpUrl}/wp-json/wp/v2/media`,
        imageBuffer,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": mimeType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": imageBuffer.length,
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );

      return {
        id: response.data.id,
        source_url: response.data.source_url,
      };
    } catch (err: any) {
      console.error("WP ERROR:", err.response?.data);
      throw err;
    }
  }
}
