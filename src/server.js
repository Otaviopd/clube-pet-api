import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

const allowed = [
  'https://otaviopd.github.io',         // domínio base do GitHub Pages
  // depois do primeiro deploy, adicione também seu domínio do Render:
  // 'https://SEU-SERVICO.onrender.com'
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.some(a => origin.startsWith(a))) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

// Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

// CRUD de Clientes

// GET /clientes - Listar todos os clientes com pets
app.get('/clientes', async (_req, res) => {
  try {
    const data = await prisma.cliente.findMany({
      include: { pets: true }
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// POST /clientes - Criar novo cliente
app.post('/clientes', async (req, res) => {
  try {
    const { nome, telefone, email, cpf, endereco, emergencia } = req.body || {};
    if (!nome || !telefone) return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    const novo = await prisma.cliente.create({
      data: { nome, telefone, email, cpf, endereco, emergencia }
    });
    res.status(201).json(novo);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// PUT /clientes/:id - Atualizar cliente
app.put('/clientes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, telefone, email, cpf, endereco, emergencia } = req.body || {};
    const atualizado = await prisma.cliente.update({
      where: { id },
      data: { nome, telefone, email, cpf, endereco, emergencia }
    });
    res.json(atualizado);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Cliente não encontrado' });
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// DELETE /clientes/:id - Remover cliente
app.delete('/clientes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.cliente.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Cliente não encontrado' });
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

/*
TESTE DE ACEITAÇÃO:

1. GET http://localhost:3001/clientes
   → Deve retornar [] inicialmente

2. POST http://localhost:3001/clientes
   Body JSON: { "nome": "Maria", "telefone": "11999999999", "email": "maria@ex.com" }
   → Deve retornar 201 com o objeto criado

3. PUT http://localhost:3001/clientes/1
   Body JSON: { "telefone": "11888888888" }
   → Deve atualizar o telefone

4. DELETE http://localhost:3001/clientes/1
   → Deve retornar 204

5. GET http://localhost:3001/clientes
   → Deve conferir as alterações
*/
