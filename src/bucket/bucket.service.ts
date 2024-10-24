import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { generateToken } from "src/lib/utils";

export interface UploadFile {
    name: string;
    blob: any;
    contentType: string;
}

@Injectable()
export class BucketService {
    private s3;

    constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }

    async uploadFile(file: UploadFile) {
        try {

            const randomToken = generateToken();

            const params = {
                Bucket: process.env.AWS_BUCKET_S3,
                Key: randomToken + "." + file.name.split('.').pop(),
                Body: file.blob,
                ContentType: file.contentType,
            };

            const data = await this.s3.send(new PutObjectCommand(params));
            return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    }
}