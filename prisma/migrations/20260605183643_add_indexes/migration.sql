-- DropIndex
DROP INDEX `Article_status_idx` ON `article`;

-- CreateIndex
CREATE INDEX `Article_status_publishedAt_idx` ON `Article`(`status`, `publishedAt`);

-- CreateIndex
CREATE INDEX `Enquiry_createdAt_idx` ON `Enquiry`(`createdAt`);

-- CreateIndex
CREATE INDEX `JobApplication_createdAt_idx` ON `JobApplication`(`createdAt`);
