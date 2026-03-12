-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "goals" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sex" TEXT,
ADD COLUMN     "weight" INTEGER;
