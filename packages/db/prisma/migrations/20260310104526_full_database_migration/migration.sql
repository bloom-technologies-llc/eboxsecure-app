-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CUSTOMER', 'EMPLOYEE', 'CORPORATE');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('EMPLOYEE', 'LOCATION', 'CUSTOMER', 'ORDER');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('EMPLOYEE', 'LOCATION', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ABANDONED', 'ACTIVE', 'ENDED', 'EXPIRED', 'REMOVED', 'REPLACED', 'REVOKED');

-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('MANAGER', 'ASSOCIATE');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('AGENT', 'FRANCHISE');

-- CreateEnum
CREATE TYPE "TrustedContactStatus" AS ENUM ('PENDING', 'ACTIVE');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('BASIC', 'BASIC_PLUS', 'PREMIUM', 'BUSINESS_PRO');

-- CreateEnum
CREATE TYPE "MeterEventType" AS ENUM ('OVERDUE_PACKAGE_HOLDING', 'PACKAGE_ALLOWANCE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_DELIVERED', 'ORDER_PICKED_UP', 'ORDER_OVERDUE', 'ORDER_SHARED', 'ORDER_UNSHARED', 'ORDER_COMMENT', 'SUBSCRIPTION_UPGRADED', 'SUBSCRIPTION_DOWNGRADED', 'SUBSCRIPTION_CANCELED', 'SUBSCRIPTION_REACTIVATED', 'PAYMENT_FAILED', 'INVOICE_PAID', 'TRIAL_ENDING_SOON', 'TRUSTED_CONTACT_INVITATION_RECEIVED', 'TRUSTED_CONTACT_ACCEPTED', 'TRUSTED_CONTACT_DECLINED', 'TRUSTED_CONTACT_REMOVED', 'PACKAGE_ALLOWANCE_EXCEEDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAccount" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "virtualAddress" TEXT,
    "phoneNumber" TEXT,
    "shippingAddress" TEXT,
    "photoLink" TEXT,
    "stripeCustomerId" TEXT,
    "subscription" "SubscriptionType" DEFAULT 'BASIC',

    CONSTRAINT "CustomerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeAccount" (
    "id" TEXT NOT NULL,
    "employeeRole" "EmployeeRole" NOT NULL,
    "locationId" INTEGER NOT NULL,

    CONSTRAINT "EmployeeAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorporateAccount" (
    "id" TEXT NOT NULL,

    CONSTRAINT "CorporateAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingAdminAccount" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "accountType" "UserType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingAdminAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingPhoneUploadLink" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OnboardingPhoneUploadLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "customerId" TEXT NOT NULL,
    "vendorOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "shippedLocationId" INTEGER NOT NULL,
    "deliveredDate" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "pickedUpById" TEXT,
    "processedAt" TIMESTAMP(3),
    "carrierId" INTEGER,
    "trackingNumber" TEXT,
    "rawDeliveryJson" JSONB,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeterEvent" (
    "id" TEXT NOT NULL,
    "eventType" "MeterEventType" NOT NULL,
    "value" INTEGER NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeEventId" TEXT,
    "orderId" INTEGER,

    CONSTRAINT "MeterEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT,
    "storageCapacity" INTEGER NOT NULL DEFAULT 500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "locationType" "LocationType" NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationHours" (
    "id" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LocationHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "noteType" "NoteType" NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationNote" (
    "id" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "CustomerNote" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "EmployeeNote" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "commentType" "CommentType" NOT NULL,
    "filePaths" TEXT[],

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationComment" (
    "id" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "EmployeeComment" (
    "id" TEXT NOT NULL,
    "employeeAccountId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CustomerComment" (
    "id" TEXT NOT NULL,
    "customerAccountId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "OrderComment" (
    "id" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" "NotificationType" NOT NULL,
    "commentId" TEXT,
    "orderId" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notificationEmail" TEXT,
    "phoneNumber" TEXT,
    "expoPushToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavoriteLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFavoriteLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustedContact" (
    "id" TEXT NOT NULL,
    "accountHolderId" TEXT NOT NULL,
    "trustedContactId" TEXT NOT NULL,
    "status" "TrustedContactStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustedContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingTrustedContactInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accountHolderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PendingTrustedContactInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderSharedAccess" (
    "id" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "sharedWithId" TEXT NOT NULL,
    "grantedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderSharedAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionLimit" (
    "type" "SubscriptionType" NOT NULL,
    "packageAllowance" INTEGER NOT NULL,
    "maxPackageHolding" INTEGER NOT NULL,
    "locationLimit" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerAccount_virtualAddress_key" ON "CustomerAccount"("virtualAddress");

-- CreateIndex
CREATE UNIQUE INDEX "PendingAdminAccount_email_key" ON "PendingAdminAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingPhoneUploadLink_customerId_key" ON "OnboardingPhoneUploadLink"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "MeterEvent_stripeEventId_key" ON "MeterEvent"("stripeEventId");

-- CreateIndex
CREATE UNIQUE INDEX "MeterEvent_orderId_key" ON "MeterEvent"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "LocationHours_locationId_dayOfWeek_key" ON "LocationHours"("locationId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "LocationNote_id_key" ON "LocationNote"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerNote_id_key" ON "CustomerNote"("id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeNote_id_key" ON "EmployeeNote"("id");

-- CreateIndex
CREATE UNIQUE INDEX "LocationComment_id_key" ON "LocationComment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeComment_id_key" ON "EmployeeComment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerComment_id_key" ON "CustomerComment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "OrderComment_id_key" ON "OrderComment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "UserFavoriteLocation_userId_idx" ON "UserFavoriteLocation"("userId");

-- CreateIndex
CREATE INDEX "UserFavoriteLocation_locationId_idx" ON "UserFavoriteLocation"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavoriteLocation_userId_locationId_key" ON "UserFavoriteLocation"("userId", "locationId");

-- CreateIndex
CREATE INDEX "TrustedContact_accountHolderId_idx" ON "TrustedContact"("accountHolderId");

-- CreateIndex
CREATE INDEX "TrustedContact_trustedContactId_idx" ON "TrustedContact"("trustedContactId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedContact_accountHolderId_trustedContactId_key" ON "TrustedContact"("accountHolderId", "trustedContactId");

-- CreateIndex
CREATE INDEX "PendingTrustedContactInvitation_email_idx" ON "PendingTrustedContactInvitation"("email");

-- CreateIndex
CREATE INDEX "PendingTrustedContactInvitation_accountHolderId_idx" ON "PendingTrustedContactInvitation"("accountHolderId");

-- CreateIndex
CREATE INDEX "OrderSharedAccess_sharedWithId_idx" ON "OrderSharedAccess"("sharedWithId");

-- CreateIndex
CREATE INDEX "OrderSharedAccess_grantedById_idx" ON "OrderSharedAccess"("grantedById");

-- CreateIndex
CREATE UNIQUE INDEX "OrderSharedAccess_orderId_sharedWithId_key" ON "OrderSharedAccess"("orderId", "sharedWithId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionLimit_type_key" ON "SubscriptionLimit"("type");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAccount" ADD CONSTRAINT "CustomerAccount_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAccount" ADD CONSTRAINT "EmployeeAccount_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAccount" ADD CONSTRAINT "EmployeeAccount_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateAccount" ADD CONSTRAINT "CorporateAccount_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingPhoneUploadLink" ADD CONSTRAINT "OnboardingPhoneUploadLink_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pickedUpById_fkey" FOREIGN KEY ("pickedUpById") REFERENCES "CustomerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippedLocationId_fkey" FOREIGN KEY ("shippedLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeterEvent" ADD CONSTRAINT "MeterEvent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeterEvent" ADD CONSTRAINT "MeterEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationHours" ADD CONSTRAINT "LocationHours_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationNote" ADD CONSTRAINT "LocationNote_id_fkey" FOREIGN KEY ("id") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationNote" ADD CONSTRAINT "LocationNote_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_id_fkey" FOREIGN KEY ("id") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeNote" ADD CONSTRAINT "EmployeeNote_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeNote" ADD CONSTRAINT "EmployeeNote_id_fkey" FOREIGN KEY ("id") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationComment" ADD CONSTRAINT "LocationComment_id_fkey" FOREIGN KEY ("id") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationComment" ADD CONSTRAINT "LocationComment_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeComment" ADD CONSTRAINT "EmployeeComment_employeeAccountId_fkey" FOREIGN KEY ("employeeAccountId") REFERENCES "EmployeeAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeComment" ADD CONSTRAINT "EmployeeComment_id_fkey" FOREIGN KEY ("id") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerComment" ADD CONSTRAINT "CustomerComment_customerAccountId_fkey" FOREIGN KEY ("customerAccountId") REFERENCES "CustomerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerComment" ADD CONSTRAINT "CustomerComment_id_fkey" FOREIGN KEY ("id") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderComment" ADD CONSTRAINT "OrderComment_id_fkey" FOREIGN KEY ("id") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderComment" ADD CONSTRAINT "OrderComment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteLocation" ADD CONSTRAINT "UserFavoriteLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteLocation" ADD CONSTRAINT "UserFavoriteLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedContact" ADD CONSTRAINT "TrustedContact_accountHolderId_fkey" FOREIGN KEY ("accountHolderId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedContact" ADD CONSTRAINT "TrustedContact_trustedContactId_fkey" FOREIGN KEY ("trustedContactId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingTrustedContactInvitation" ADD CONSTRAINT "PendingTrustedContactInvitation_accountHolderId_fkey" FOREIGN KEY ("accountHolderId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSharedAccess" ADD CONSTRAINT "OrderSharedAccess_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSharedAccess" ADD CONSTRAINT "OrderSharedAccess_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSharedAccess" ADD CONSTRAINT "OrderSharedAccess_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
