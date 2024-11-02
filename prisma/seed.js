const { PrismaClient } = require('@prisma/client');
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
    const insightPath = path.join(__dirname, "insight.txt");
    const text = fs.readFileSync(insightPath, "utf-8");

    const testUser = await prisma.user.create({
        data: {
            email: "test@gmail.com",
            name: "test",
        }
    });
    
    await prisma.note.create({
        data: {
            id: "insight",
            title: "Insight and beyond hub",
            note: text,
            type: "freetext",
            userId: testUser.id,
        }
    });
}

main()
    .then(() => {
        console.log("Success ✨")
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
