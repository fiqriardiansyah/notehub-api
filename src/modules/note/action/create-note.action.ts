import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from '../dto';
import { PrismaService } from 'src/common/prisma.service';
import { BucketService } from 'src/bucket/bucket.service';

const schedulerImportant = (schedulerType?: 'day' | 'weekly' | 'monthly') => {
  if (!schedulerType) return null;
  if (schedulerType === 'day') return 1;
  if (schedulerType === 'weekly') return 2;
  if (schedulerType === 'monthly') return 3;
};

@Injectable()
export class CreateNoteAction {
  constructor(
    private readonly prisma: PrismaService,
    private bucket: BucketService,
  ) {}

  async execute(userId: string, data: CreateNoteDto) {
    let folder;
    if (data?.newFolder?.title && !data?.folderId) {
      folder = await this.prisma.folder.create({
        data: {
          title: data.newFolder?.title,
          userId: userId,
          type: 'folder',
        },
      });
    }

    let filesUrl = [];
    let imagesUrl = [];

    if (data.files?.length) {
      const files = data?.files?.map((file) => {
        const fileBuffer = Buffer.from(file.base64.split(',')[1], 'base64');
        return this.bucket.uploadFile({
          blob: fileBuffer,
          contentType: file.contentType,
          name: file.name,
        });
      });
      filesUrl = (await Promise.all(files)).map((url, i) =>
        JSON.stringify({
          url,
          name: data?.files[i].name,
          sizeInMb: data?.files[i].sizeInMb,
        }),
      );
    }

    if (data.images?.length) {
      const images = data?.images?.map((file) => {
        const fileBuffer = Buffer.from(file.base64.split(',')[1], 'base64');
        return this.bucket.uploadFile({
          blob: fileBuffer,
          contentType: file.contentType,
          name: file.name,
        });
      });
      imagesUrl = (await Promise.all(images)).map((url, i) =>
        JSON.stringify({
          url,
          name: data?.images[i].name,
          sizeInMb: data?.images[i].sizeInMb,
        }),
      );
    }

    const save = await this.prisma.note.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description ? JSON.stringify(data.description) : null,
        note: JSON.stringify(data.note),
        userId: userId,
        tags: data?.tags?.map((t) => JSON.stringify(t)),
        folderId: folder?.id || data?.folderId,
        todos: data?.todos?.map((t) => JSON.stringify(t)),
        schedulerImportant: schedulerImportant(data?.schedulerType),
        schedulerType: data.schedulerType,
        schedulerDays: data.schedulerDays,
        schedulerEndTime: data.schedulerEndTime,
        schedulerStartTime: data.schedulerStartTime,
        isHang: data?.isHang,
        isSecure: data?.isSecure,
        filesUrl,
        imagesUrl,
      },
    });

    return {
      id: save.id,
      createdAt: save.createdAt,
    };
  }
}
