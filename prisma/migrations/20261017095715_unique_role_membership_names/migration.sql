/*
  Warnings:

  - A unique constraint covering the columns `[mname]` on the table `MemberShip` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rolename]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MemberShip_mname_key" ON "MemberShip"("mname");

-- CreateIndex
CREATE UNIQUE INDEX "Role_rolename_key" ON "Role"("rolename");
