import { Body, Controller, Post } from "@nestjs/common";
import { BucketService } from "./bucket.service";
import { getContentType } from "src/lib/utils";

@Controller("bucket")
export class BucketController {
    constructor(private bucketService: BucketService) { }

    @Post("/test-upload")
    async testUpload(@Body() data: { base64: string }) {
        if (!data?.base64.startsWith('data:')) {
            throw new Error('Invalid file data');
        }

        const base64Content = data.base64.split(',')[1];
        const fileBuffer = Buffer.from(base64Content, 'base64');
        const contentType = getContentType(data.base64);

        const upload = await this.bucketService.uploadFile({
            blob: fileBuffer,
            contentType,
            name: 'fiqriardiansyah.png',
        });

        return upload;
    }
}