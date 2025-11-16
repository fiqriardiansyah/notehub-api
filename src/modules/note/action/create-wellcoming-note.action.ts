import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { NoteType } from 'src/enum/note.enum';

@Injectable()
export class CreateWellcomingNoteAction {
  constructor(private readonly prisma: PrismaService) {}

  async execute(user: { id: string; name: string }) {
    const welcomingTitle = 'Welcome to Notespacehub 👋';
    const welcomingNote = `{"time":1748689535732,"blocks":[{"id":"3yAjcDZR9F","type":"paragraph","data":{"text":"Hi {{username}}, we're excited to have you here! 🎉"}},{"id":"A87nrO2LVC","type":"paragraph","data":{"text":"Here's what you can do with NotespaceHub:"}},{"id":"nC4lmOdNg1","type":"paragraph","data":{"text":"✅ Write and organize notes"}},{"id":"LobcrCw6RB","type":"paragraph","data":{"text":"✅ Create to-do lists with deadlines"}},{"id":"ifhNFt_m9g","type":"paragraph","data":{"text":"✅ Track habits and daily goals"}},{"id":"qrKDZfJCLE","type":"paragraph","data":{"text":"✅ Collaborate on notes with others"}},{"id":"ZS6H2dJDve","type":"paragraph","data":{"text":"✅ Earn streaks and view progress on your calendar"}},{"id":"RkDHSCB9aF","type":"paragraph","data":{"text":"---"}},{"id":"dOvGyuU8Ue","type":"paragraph","data":{"text":"🚀 Let's Get Started!"}},{"id":"YCwU3vuYvb","type":"paragraph","data":{"text":"Here are some tips to begin:"}},{"id":"EF7MnuGMpk","type":"paragraph","data":{"text":"- 📄 Create your first note"}},{"id":"8uTioTRG-x","type":"paragraph","data":{"text":"- ✅ Add a task to your to-do list"}},{"id":"j-vu2UkSTX","type":"paragraph","data":{"text":"- 🗓️ Explore your habit calendar"}},{"id":"gtic0LKD84","type":"paragraph","data":{"text":"- 🤝 Invite a friend to collaborate"}},{"id":"JOtQpchBSb","type":"paragraph","data":{"text":"Enjoy your journey with NotespaceHub!  "}},{"id":"G0bYX0g8_U","type":"paragraph","data":{"text":"<b>The NotespaceHub Team</b> 💙"}}],"version":"2.30.2"}`;

    const save = await this.prisma.note.create({
      data: {
        type: NoteType.FREETEXT,
        title: welcomingTitle,
        note: welcomingNote.replace('{{username}}', user.name),
        userId: user.id,
      },
    });

    return save;
  }
}
