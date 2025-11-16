import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Collaboration, Note, Prisma } from '@prisma/client';
import { User } from 'src/@types/user';
import { BucketService } from 'src/bucket/bucket.service';
import { PrismaService } from 'src/common/prisma.service';
import { UpdateNoteDto } from '../dto';

const schedulerImportant = (schedulerType?: 'day' | 'weekly' | 'monthly') => {
  if (!schedulerType) return null;
  if (schedulerType === 'day') return 1;
  if (schedulerType === 'weekly') return 2;
  if (schedulerType === 'monthly') return 3;
};

@Injectable()
export class UpdateNoteAction {
  constructor(
    private readonly prisma: PrismaService,
    private bucket: BucketService,
  ) {}

  async execute(user: User, data: Partial<UpdateNoteDto>, id: string) {
    try {
      let folder;
      if (data?.newFolder?.title && !data?.folderId) {
        folder = await this.prisma.folder.create({
          data: {
            title: data.newFolder?.title,
            userId: user.id,
            type: 'folder',
          },
        });
      }

      const collaboration = (
        await this.prisma.$queryRaw(
          Prisma.raw(`
                select * from public.collaboration c where c."noteId" = '${id}' and c."userId" = '${user.id}';
            `),
        )
      )[0] as Collaboration;

      if (collaboration?.role === 'viewer') {
        throw new HttpException(
          'You are not allowed to edit this project',
          HttpStatus.BAD_REQUEST,
        );
      }

      const oldNote = (
        await this.prisma.$queryRaw(
          Prisma.raw(`
                select n.* from public.note n left join public.collaboration c on c."noteId" = n.id
                where n.id = '${id}' and (n."userId" = '${user.id}' or (c."userId" = '${user.id}' and c."role" = 'editor'))
            `),
        )
      )[0] as Note;

      if (oldNote) {
        let filesUrl = data?.files
          ?.filter((fl) => fl?.url)
          .map((fl) => JSON.stringify(fl));
        let imagesUrl = data?.images
          ?.filter((img) => img?.url)
          .map((img) => JSON.stringify(img));

        if (data.files?.length) {
          const files = data?.files
            ?.map((file) => {
              if (file?.url) return null;
              const fileBuffer = Buffer.from(
                file.base64.split(',')[1],
                'base64',
              );
              return this.bucket.uploadFile({
                blob: fileBuffer,
                contentType: file.contentType,
                name: file.name,
              });
            })
            .filter(Boolean);

          const result = (await Promise.all(files)).map((url, i) =>
            JSON.stringify({
              url,
              name: data?.files[i].name,
              sizeInMb: data?.files[i].sizeInMb,
            }),
          );

          filesUrl = [...filesUrl, ...result];
        }

        if (data.images?.length) {
          const images = data?.images
            ?.map((file) => {
              if (file?.url) return null;
              const fileBuffer = Buffer.from(
                file.base64.split(',')[1],
                'base64',
              );
              return this.bucket.uploadFile({
                blob: fileBuffer,
                contentType: file.contentType,
                name: file.name,
              });
            })
            .filter(Boolean);

          const result = (await Promise.all(images)).map((url, i) =>
            JSON.stringify({
              url,
              name: data?.images[i].name,
              sizeInMb: data?.images[i].sizeInMb,
            }),
          );

          imagesUrl = [...imagesUrl, ...result];
        }

        const save = await this.prisma.note.update({
          where: {
            id: oldNote.id,
          },
          data: {
            updatedBy: user.name,
            type: data.type || oldNote.type,
            title: data?.title || oldNote.title,
            description: data?.description
              ? JSON.stringify(data?.description)
              : oldNote?.description,
            note: data?.note ? JSON.stringify(data?.note) : oldNote.note,
            tags: data?.tags
              ? data?.tags.map((t) => JSON.stringify(t))
              : oldNote?.tags || [],
            folderId:
              data?.folderId === 'remove'
                ? null
                : folder?.id || data?.folderId || oldNote?.folderId,
            todos: data?.todos
              ? data?.todos.map((t) => JSON.stringify(t))
              : oldNote?.todos || [],
            schedulerImportant: schedulerImportant(data?.schedulerType),
            schedulerType: data?.schedulerType,
            schedulerDays: data.schedulerDays,
            schedulerEndTime: data.schedulerEndTime,
            schedulerStartTime: data.schedulerStartTime,
            isHang: data?.isHang === undefined ? oldNote?.isHang : data.isHang,
            isSecure:
              data?.isSecure === undefined ? oldNote?.isSecure : data?.isSecure,
            imagesUrl,
            filesUrl,
          },
        });

        if (data?.isSecure) {
          await this.prisma.$queryRaw(
            Prisma.raw(`
                        delete from public.collaboration c where c."noteId" = '${oldNote.id}'
                        `),
          );
          await this.prisma.$queryRaw(
            Prisma.raw(`
                        delete from public.invitation i where i."noteId" = '${oldNote.id}'
                        `),
          );
        }

        const shareLink = await this.prisma.share.findFirst({
          where: {
            noteId: oldNote.id,
          },
        });

        if (shareLink) {
          await this.prisma.share.update({
            where: { id: shareLink.id },
            data: { valid: !data?.isSecure },
          });
        }

        return {
          id: save.id,
          createdAt: save.createdAt,
        };
      }

      throw new HttpException("Can't find the note", HttpStatus.NOT_FOUND);
    } catch (e) {
      throw new HttpException(e?.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
