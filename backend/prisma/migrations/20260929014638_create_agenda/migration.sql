
CREATE TABLE "Agenda" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "aula" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);
