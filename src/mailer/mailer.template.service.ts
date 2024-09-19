import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import * as hanldebars from "handlebars";

@Injectable()
export class MailerTemplateService {
    private templatePath = path.join(__dirname, '..', 'templates');

    async compileTemplate(templateName: string, data: any): Promise<string> {
        const filePath = path.join(this.templatePath, `${templateName}.hbs`);
        const templateContent = fs.readFileSync(filePath, 'utf-8');
        const template = hanldebars.compile(templateContent);
        return template(data);
    }
}