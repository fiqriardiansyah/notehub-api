const dayjs = require("dayjs");
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HabitsHistory, Note, Prisma, Timer, User } from "@prisma/client";
import { PrismaService } from "src/common/prisma.service";
import { Todo } from "src/note/note.models";


type RunningTimer = Pick<Timer, "id" | "endTime" | "startTime" | "itemId" | "isZenMode"> & Pick<Note, "title"> & {
    todos: Todo[];
    noteId: string;
    timerType: string;
}

type RunningTimerReturn = Pick<Timer, "id" | "endTime" | "startTime" | "itemId" | "isZenMode"> & {
    noteId: string;
    title: string;
    itemTitle: string;
    timerType: string;
}

@Injectable()
export class HabitsService {
    constructor(private prismaService: PrismaService) { }

    async getUrgentHabit(user: User, limit?: number) {
        const todayName = dayjs().format('dddd');

        const result = await this.prismaService.$queryRaw(Prisma.raw(`
            select * from public.note n
            where n."userId" = '${user.id}' 
            and (lower('${todayName}') = any("schedulerDays") or "schedulerType" = 'weekly' or "schedulerType" = 'monthly')
            and n.reschedule = true
            order by "schedulerImportant", "schedulerStartTime" desc
            ${limit ? `limit ${limit}` : ""}
        `)) as Note[];

        return result.map((rs) => ({
            ...rs,
            todos: rs.todos?.map((el) => JSON.parse(el)),
            tags: rs.tags?.map((el) => JSON.parse(el)),
            description: JSON.parse(rs?.description)
        }));
    }

    async getHabits(user: User, type: string = "all") {
        const queryType = () => {
            if (type === "all") return "";
            if (type === "day") return `and n."schedulerType" = 'day'`;
            if (type === "weekly") return `and n."schedulerType" = 'weekly'`;
            if (type === "monthly") return `and n."schedulerType" = 'monthly'`;
        }

        const result = await this.prismaService.$queryRaw(Prisma.raw(`
            select * from public.note n
            where n."userId" = '${user.id}'
            and n."type" = 'habits'
            ${queryType()}
            order by n."schedulerImportant", n."schedulerEndTime" desc
        `)) as Note[];

        return result.map((rs) => ({
            ...rs,
            todos: rs.todos?.map((el) => JSON.parse(el)),
            tags: rs.tags?.map((el) => JSON.parse(el)),
            description: JSON.parse(rs?.description)
        }));
    }

    async finishHabits(user: User, id: string) {
        const notes = await this.prismaService.note.findFirst({
            where: {
                id,
                userId: user.id
            }
        });

        try {
            await this.prismaService.$transaction([
                this.prismaService.note.update({
                    where: {
                        userId: user.id,
                        id,
                    },
                    data: {
                        reschedule: false
                    }
                }),
                this.prismaService.habitsHistory.create({
                    data: {
                        isCompleted: true,
                        userId: user.id,
                        habitId: id,
                        todos: notes.todos,
                    }
                })
            ]);
            return true;
        } catch (e: any) {
            throw new HttpException(e?.message, HttpStatus.EXPECTATION_FAILED);
        }

    }

    async getHabitHistory(user: User, id?: string) {
        const result = await this.prismaService.$queryRaw(Prisma.raw(`
            select * from public.habitshistory h where h."userId" = '${user.id}' ${id ? `and h."habitId" = '${id}'` : ""}
        `)) as HabitsHistory[];

        return result.map((history) => ({
            ...history,
            todos: history.todos.map((t) => JSON.parse(t)),
        }))
    }

    async setTimerTask(timer: Partial<Timer>) {
        const alreadExist = await this.prismaService.timer.findFirst({
            where: {
                itemId: timer.itemId,
                noteId: timer.noteId,
            }
        });
        if (alreadExist) return alreadExist;

        const result = await this.prismaService.timer.create({
            data: {
                itemId: timer.itemId,
                noteId: timer.noteId,
                autoComplete: timer?.autoComplete,
                endTime: timer?.endTime,
                isEnd: timer?.isEnd,
                startTime: timer?.startTime,
                type: timer?.type
            }
        });
        return result;
    };

    async setZenMode(id: string, val: boolean) {
        if (val) {
            const alreadyZenMode = await this.prismaService.timer.findFirst({ where: { isZenMode: true } });

            if (alreadyZenMode) {
                throw new HttpException("There is timer already in zen mode", HttpStatus.FORBIDDEN);
            }
        }

        const timer = await this.prismaService.timer.findFirst({ where: { itemId: id } });

        if (!timer) {
            throw new HttpException("Timer not found", HttpStatus.NOT_FOUND)
        }

        const update = await this.prismaService.timer.update({
            where: { id: timer.id },
            data: { isZenMode: val }
        });

        return update;
    }

    async deleteTimerTask(itemId: string, noteId: string) {
        const result = await this.prismaService.timer.deleteMany({
            where: {
                noteId,
                itemId
            }
        });
        return result;
    }

    async getRunningTimer(user: User) {

        let rows = (await this.prismaService.$queryRaw(Prisma.raw(`
            select 
                t."id", t."endTime", t."startTime", t."itemId", t."type" as "timerType", n."title", n."todos", n."id" as "noteId", t."isZenMode"
            from public.timer t 
            join public.note n on t."noteId" = n."id" where n."userId" = '${user.id}' and t."isEnd" = false
        `))) as RunningTimer[];

        rows = rows.map((row) => ({ ...row, todos: row.todos.map((t) => JSON.parse(t as any)) }));

        return rows.map((row) => {
            const todo = row.todos.find((t) => t.id === row.itemId).content
            return {
                ...row,
                itemTitle: todo,
                todos: null,
            }
        }) as RunningTimerReturn[]
    };

    async getTimerZenMode(user: User) {

        let rows = (await this.prismaService.$queryRaw(Prisma.raw(`
            select 
                t."id", t."endTime", t."startTime", t."itemId", t."type" as "timerType", n."title", n."todos", n."id" as "noteId", t."isZenMode"
            from public.timer t 
            join public.note n on t."noteId" = n."id" where n."userId" = '${user.id}' and t."isZenMode" = true
        `))) as RunningTimer[];

        rows = rows.map((row) => ({ ...row, todos: row.todos.map((t) => JSON.parse(t as any)) }));

        return rows.map((row) => {
            const todo = row.todos.find((t) => t.id === row.itemId).content
            return {
                ...row,
                itemTitle: todo,
                todos: null,
            }
        }) as RunningTimerReturn[]
    }
}