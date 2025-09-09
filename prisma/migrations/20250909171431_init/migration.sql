-- CreateEnum
CREATE TYPE "public"."Tamanho" AS ENUM ('PEQUENO', 'MEDIO', 'GRANDE', 'GIGANTE');

-- CreateEnum
CREATE TYPE "public"."Temperamento" AS ENUM ('DOCIL', 'BRINCALHAO', 'TIMIDO', 'AGITADO', 'AGRESSIVO', 'CALMO');

-- CreateEnum
CREATE TYPE "public"."StatusHospedagem" AS ENUM ('ATIVO', 'CHECKOUT');

-- CreateEnum
CREATE TYPE "public"."StatusCreche" AS ENUM ('AGENDADO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "public"."StatusCobranca" AS ENUM ('PENDENTE', 'PAGO');

-- CreateTable
CREATE TABLE "public"."Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT,
    "endereco" TEXT,
    "emergencia" TEXT,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pet" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "raca" TEXT NOT NULL,
    "tamanho" "public"."Tamanho" NOT NULL,
    "peso" DOUBLE PRECISION,
    "idade" TEXT,
    "temperamento" "public"."Temperamento" NOT NULL,
    "castrado" TEXT,
    "medicamentos" TEXT,
    "cartaoVacinaNumero" TEXT NOT NULL,
    "observacoes" TEXT,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Hospedagem" (
    "id" SERIAL NOT NULL,
    "petId" INTEGER NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "petNome" TEXT NOT NULL,
    "checkin" TIMESTAMP(3) NOT NULL,
    "checkout" TIMESTAMP(3) NOT NULL,
    "dias" INTEGER NOT NULL,
    "servicos" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "descontoPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "plano" TEXT NOT NULL,
    "status" "public"."StatusHospedagem" NOT NULL DEFAULT 'ATIVO',
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hospedagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Creche" (
    "id" SERIAL NOT NULL,
    "petId" INTEGER NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "petNome" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "periodo" TEXT NOT NULL,
    "plano" TEXT NOT NULL,
    "entrada" TEXT,
    "saida" TEXT,
    "dias" INTEGER NOT NULL,
    "atividades" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "descontoPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "status" "public"."StatusCreche" NOT NULL DEFAULT 'AGENDADO',
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Creche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mensagem" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "petId" INTEGER,
    "tipo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Avaliacao" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "petId" INTEGER NOT NULL,
    "servico" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Inadimplencia" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "diasAtraso" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "public"."StatusCobranca" NOT NULL DEFAULT 'PENDENTE',
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPagamento" TIMESTAMP(3),

    CONSTRAINT "Inadimplencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "public"."Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_key" ON "public"."Cliente"("cpf");

-- AddForeignKey
ALTER TABLE "public"."Pet" ADD CONSTRAINT "Pet_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Hospedagem" ADD CONSTRAINT "Hospedagem_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Creche" ADD CONSTRAINT "Creche_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mensagem" ADD CONSTRAINT "Mensagem_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mensagem" ADD CONSTRAINT "Mensagem_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Avaliacao" ADD CONSTRAINT "Avaliacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Avaliacao" ADD CONSTRAINT "Avaliacao_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inadimplencia" ADD CONSTRAINT "Inadimplencia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
