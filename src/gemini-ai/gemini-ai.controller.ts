import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExtractTextFromImageAction } from './actions';

@Controller('ai')
export class GeminiAIController {
  constructor(private extractTextFromImageAction: ExtractTextFromImageAction) {}

  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed!'), false);
        }
      },
    }),
  )
  @Post('/extract-text-from-image')
  extractTextFromImage(@UploadedFile() file: Express.Multer.File) {
    return this.extractTextFromImageAction.execute(file);
  }
}
