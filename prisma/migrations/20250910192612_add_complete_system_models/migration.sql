-- CreateTable
CREATE TABLE "public"."ConfiguracaoComunicacao" (
    "id" SERIAL NOT NULL,
    "whatsappToken" TEXT,
    "whatsappNumero" TEXT,
    "smsApiKey" TEXT,
    "msgCheckin" TEXT,
    "msgCheckout" TEXT,
    "msgLembrete" TEXT,
    "msgSatisfacao" TEXT,
    "dataAtualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfiguracaoComunicacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PetImagem" (
    "id" SERIAL NOT NULL,
    "petId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "tipo" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetImagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanoCustomizado" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "meses" INTEGER NOT NULL,
    "diasMes" INTEGER NOT NULL,
    "descontoPercent" DOUBLE PRECISION NOT NULL,
    "aplica" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanoCustomizado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Configuracao" (
    "id" SERIAL NOT NULL,
    "precoHospedagemPequeno" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "precoHospedagemMedio" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "precoHospedagemGrande" DOUBLE PRECISION NOT NULL DEFAULT 120,
    "precoHospedagemGigante" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "precoCrecheMeioPequeno" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "precoCrecheMeioMedio" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "precoCrecheMeioGrande" DOUBLE PRECISION NOT NULL DEFAULT 60,
    "precoCrecheMeioGigante" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "precoCrecheIntegralPequeno" DOUBLE PRECISION NOT NULL DEFAULT 65,
    "precoCrecheIntegralMedio" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "precoCrecheIntegralGrande" DOUBLE PRECISION NOT NULL DEFAULT 95,
    "precoCrecheIntegralGigante" DOUBLE PRECISION NOT NULL DEFAULT 110,
    "precoBanho" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "precoConsulta" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "precoTransporte" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "precoAdaptacao" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "precoTreinamento" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "dataAtualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PetImagem" ADD CONSTRAINT "PetImagem_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
