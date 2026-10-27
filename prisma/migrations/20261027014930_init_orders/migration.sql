-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "items" JSONB NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "delivery_fee" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "zone_name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "slot" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NUEVO',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idempotency_key" UUID NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_idempotency_key_key" ON "orders"("idempotency_key");

-- CreateIndex
CREATE INDEX "orders_date_zone_id_idx" ON "orders"("date", "zone_id");
