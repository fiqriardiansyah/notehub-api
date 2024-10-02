import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Invitation, Note, Notification, Prisma, User } from "@prisma/client";
import Mail from "nodemailer/lib/mailer";
import { PrismaService } from "src/common/prisma.service";
import { MailerService } from "src/mailer/mailer.service";
import { CollaborateProject, InvitationData } from "src/model";
import { MailerTemplateService } from "src/mailer/mailer.template.service";
import { NotificationService } from "src/notification/notification.service";
import { generateToken } from "src/lib/utils";

const dayjs = require("dayjs");

@Injectable()
export class CollaborationService {
    constructor(
        private prismaService: PrismaService,
        private mailerService: MailerService,
        private mailerTemplateService: MailerTemplateService,
        private notificationService: NotificationService,
    ) { }

    async invite(user: User, invitation: InvitationData) {
        if (invitation.email === user.email) {
            throw new HttpException("Invited account cannot be the same as the inviters", HttpStatus.BAD_REQUEST);
        }

        const findCollab = await this.prismaService.$queryRaw(Prisma.raw(`
            select u.id as userid, u.email as email, c."noteId" as noteid from public.collaboration c inner join public."user" u 
            on u.id = c."userId" where c."noteId" = '${invitation.noteId}' and u."email" = '${invitation.email}'
        `)) as { userid: string, email: string, noteid: string }[];

        if (findCollab && findCollab?.length) {
            throw new HttpException("This Account already in this project", HttpStatus.BAD_REQUEST);
        }

        const findInvitation = await this.prismaService.invitation.findFirst({
            where: {
                invitedBy: user.email,
                invitedEmail: invitation.email,
                noteId: invitation.noteId
            }
        });

        const isPass1hour = new Date().getTime() - new Date(findInvitation?.updatedAt).getTime() > 60 * 60 * 1000;

        if (findInvitation && findInvitation?.attempted >= 3) {
            throw new HttpException(`you have exceeded the invitation limit for ${invitation.email} on this project, make sure check the recipients email spam`,
                HttpStatus.FORBIDDEN);
        }

        if (findInvitation && findInvitation?.updatedAt && !isPass1hour) {
            throw new HttpException("Try again later in 1 hour", HttpStatus.PRECONDITION_FAILED);
        }

        const token = generateToken();
        const html = await this.mailerTemplateService.compileTemplate("collab-invitation", {
            toName: invitation.email,
            byName: user.name.toUpperCase(),
            as: invitation.role,
            title: invitation.noteTitle,
            acceptLink: `${process.env.FE_URL}/validate?token=${token}&status=accepted`,
            rejectLink: `${process.env.FE_URL}/validate?token=${token}&status=rejected`,
            appLink: process.env.FE_URL,
            contactLink: "#",
            privacyLink: "#",
        });

        const mailOption: Mail.Options = {
            from: {
                name: user.name,
                address: user.email
            },
            to: [
                {
                    name: invitation.email,
                    address: invitation.email,
                }
            ],
            subject: "Invitation Collabs",
            html
        }

        await this.mailerService.sendInvitationCollab(mailOption);

        if (findInvitation) {
            const incrementAttemp = await this.prismaService.invitation.update({
                where: {
                    id: findInvitation.id,
                },
                data: {
                    attempted: findInvitation.attempted + 1
                }
            });
        } else {
            const createInvitation = await this.prismaService.invitation.create({
                data: {
                    invitedBy: user.email,
                    invitedEmail: invitation.email,
                    noteId: invitation.noteId,
                    role: invitation.role,
                    noteTitle: invitation.noteTitle,
                    token,
                }
            });
            const toUser = await this.prismaService.user.findFirst({ where: { email: invitation.email } });
            if (toUser) {
                await this.notificationService.createNotification([{
                    content: JSON.parse(JSON.stringify({
                        title: `<b>${user.name}</b> asked you to join 🔥<b>${invitation.noteTitle}</b>`,
                        profileImage: user.image,
                        role: invitation.role,
                        projectTitle: invitation.noteTitle,
                        invitationId: createInvitation.id,
                    })),
                    userId: toUser.id,
                    type: this.notificationService.TYPE_INVITE_TO_PROJECT,
                }] as Notification[]);
            }
        }

        return invitation;
    }

    async getInvitation(user: User, noteId: string, status: string = "pending") {
        const result = this.prismaService.invitation.findMany({
            where: {
                invitedBy: user.email,
                noteId,
                status
            },
            select: {
                id: true,
                invitedEmail: true,
                noteId: true,
                role: true,
                createdAt: true,
                status: true,
                noteTitle: true,
            }
        });

        return result;
    }

    async validateInvitationFromNotif(data: { status: "rejected" | "accepted", invitationId: string, notifId: string }) {
        const findInvitation = await this.prismaService.invitation.findFirst(({ where: { id: data.invitationId } }));
        if (!findInvitation) {
            const update = await this.notificationService.updateInvitationProjectStatus(data.notifId, "Invitation no longer valid, either the sender delete it or you already accept/reject");
            return update;
        }
        await this.validateInvitation(null, data.status, data.invitationId);
        const update = await this.notificationService.updateInvitationProjectStatus(data.notifId, data.status);
        return update;
    }

    async validateInvitation(token: string = "", status: "rejected" | "accepted", id?: string) {
        if (!token && !id) {
            throw new HttpException("Token or Id not found", HttpStatus.NOT_FOUND);
        }

        if (status !== "rejected" && status !== "accepted") {
            throw new HttpException("Status provide not accepted", HttpStatus.BAD_REQUEST);
        }

        const findInvitation = (await this.prismaService.$queryRaw(Prisma.raw(`
            select * from public.invitation i where i."status" = 'pending' and (i."token" = '${token}' or i."id" = '${id}');
        `)))[0] as Invitation;

        if (!findInvitation) {
            throw new HttpException("Invalid token invitation", HttpStatus.FORBIDDEN);
        }

        await this.prismaService.invitation.update({
            where: {
                id: findInvitation.id
            },
            data: {
                status,
            }
        });

        if (status === "accepted") {
            const invitedUser = await this.prismaService.user.findFirst({ where: { email: findInvitation.invitedEmail } });
            if (!invitedUser) {
                throw new HttpException("User invited not found", HttpStatus.NOT_FOUND);
            }
            await this.prismaService.collaboration.create({
                data: {
                    noteId: findInvitation.noteId,
                    role: findInvitation.role,
                    userId: invitedUser.id,
                },
            });
        }

        await this.prismaService.invitation.delete({
            where: {
                id: findInvitation.id,
            }
        });

        return {
            status,
        }
    };

    async collabAccount(user: User, noteId: string) {
        const collabs = await this.prismaService.$queryRaw(Prisma.raw(`
            select c."id", s."name", s."email", s."image", c."role" from public.collaboration c inner join public.user s 
            on c."userId" = s."id" where c."noteId" = '${noteId}'
        `));

        return collabs;
    };

    async cancelInvitation(user: User, idInvitation: string) {
        const deleteInvitation = await this.prismaService.invitation.delete({
            where: {
                id: idInvitation,
            }
        });

        return true;
    };

    async removeCollab(user: User, idCollab: string) {
        const removeCollab = await this.prismaService.collaboration.delete({
            where: {
                id: idCollab,
            }
        });

        return true;
    };

    async changeRoleCollab(user: User, idCollab: string, role: string) {
        const change = await this.prismaService.collaboration.update({
            where: { id: idCollab },
            data: {
                role
            }
        });
        return true;
    };

    async getMyCollaborateProject(user: User, order: string = "desc") {
        const result = await this.prismaService.$queryRaw(Prisma.raw(`
            select 
                n."userId" as "ownerId", 
                u."name" as "ownerName", 
                u."image" as "ownerImage", 
                n."id", n."isSecure", 
                n."title", 
                n."note" , 
                n."type", 
                n."tags", 
                n."updatedAt", 
                n."isHang", 
                n."todos", 
                c."role",
                c."id" as "collaborateId"
            from public.collaboration c inner join public.note n on c."noteId" = n."id"
            inner join public.user u on u.id = n."userId"
            where c."userId" = '${user.id}'
            order by n."updatedAt" ${order}
            `)) as CollaborateProject[];

        return result?.map((r) => ({
            ...r,
            todos: r?.todos?.map((t) => JSON.parse(t)),
            note: JSON.parse(r?.note),
            tags: r?.tags?.map((t) => JSON.parse(t)),
        }))
    };

    async leaveCollaborateProject(user: User, collaborateId: string) {

        const ownerUserAndNote = (await this.prismaService.$queryRaw(Prisma.raw(`
            select u.*, n.* from public.user u join 
            public.note n on u."id" = n."userId" join 
            public.collaboration c on c."noteId" = n."id"
            where c."id" = '${collaborateId}'
        `)))[0] as User & Note;

        const removeCollab = await this.prismaService.collaboration.delete({
            where: {
                userId: user.id,
                id: collaborateId,
            }
        });

        if (!removeCollab) {
            throw new HttpException("Collaboration not found", HttpStatus.NOT_FOUND);
        }

        if (ownerUserAndNote) {
            const notifyToOwnerNote = await this.notificationService.createNotification([{
                type: this.notificationService.TYPE_LEAVE_PROJECT,
                content: JSON.parse(JSON.stringify({
                    title: `<b>${user.name}</b> leave the <b>${ownerUserAndNote.title}</b> project`,
                    profileImage: user.image,
                })),
                userId: ownerUserAndNote.userId,
            }] as Notification[]);
        }

        return true;
    }
}