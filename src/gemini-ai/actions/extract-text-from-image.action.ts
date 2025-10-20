import { BadRequestException, Injectable } from '@nestjs/common';
import { GeminiAIService } from '../gemini-ai.service';

@Injectable()
export class ExtractTextFromImageAction {
  constructor(private service: GeminiAIService) {}

  async execute(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    const base64ImageData = Buffer.from(file.buffer).toString('base64');

    const response = await this.service.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: file.mimetype,
            data: base64ImageData,
          },
        },
        {
          text: `
            ### ROLE
            You are a professional OCR assistant designed to extract text from real-world photos, including blurry, shadowed, or handwritten content.

            ### INPUT
            You will receive one or more photo images of notes, documents, or text taken using a phone camera. These may contain:
            - Blurry areas
            - Shadows
            - Background clutter
            - Handwriting or mixed fonts
            - Text at an angle

            ### OBJECTIVE
            Your job is to transcribe as accurately as possible **only the actual text visible** in the image(s). Do not guess or rewrite content. If text is unreadable or blurry beyond recognition, replace it with "???".

            ### RULES
            1. Return the extracted text as a **single HTML-formatted string**.
            2. Preserve and apply **only these HTML tags**:
            - '<b>' for bold text
            - '<i>' for italic text
            - '<br />' for new lines
            3. If a section is completely unreadable, insert '"???"'.
            4. Do not invent, rewrite, or summarize text.
            5. Do not wrap with '<html>' or '<body>'. Return **only the content string**.

            ### EXAMPLES
            If the original text is:
            Meeting Notes
            – Finish API <important>
            – Call Fiqri
            <b>Meeting Notes</b><br />
            – Finish API <i>&lt;important&gt;</i><br />
            – Call Fiqri

            #FAILURE CASE
            If no readable text is detected, return empty string ""
        `,
        },
      ],
    });

    return {
      text: response.text || 'Text can not be extracted from this image',
    };
  }
}
