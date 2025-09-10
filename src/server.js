import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

const allowed = [
  'https://otaviopd.github.io',         // domínio base do GitHub Pages
  'https://clube-pet-api-1.onrender.com', // domínio da API no Render
  'http://localhost:3000',              // desenvolvimento local
  'http://127.0.0.1:5500',             // Live Server
  'file://'                             // arquivos locais
];

app.use(cors({
  origin: (origin, cb) => {
    console.log('🌐 CORS request from origin:', origin);
    if (!origin || allowed.some(a => origin?.startsWith(a))) {
      console.log('✅ CORS allowed');
      return cb(null, true);
    }
    console.log('❌ CORS blocked for origin:', origin);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Healthcheck
app.get('/health', (_req, res) => {
  console.log('🏥 Health check accessed');
  res.json({ ok: true });
});

// CRUD de Clientes

// GET /clientes - Listar todos os clientes com pets
app.get('/clientes', async (_req, res) => {
  try {
    console.log('👥 Accessing /clientes endpoint');
    console.log('🔗 DATABASE_URL configured:', !!process.env.DATABASE_URL);
    const data = await prisma.cliente.findMany({
      include: { pets: true }
    });
    console.log('✅ Query successful, found', data.length, 'clients');
    res.json(data);
  } catch (e) {
    console.error('❌ Database error:', e.message);
    console.error('❌ Error code:', e.code);
    res.status(500).json({ error: 'Erro ao listar clientes', details: e.message });
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

// ===== CRUD DE PETS =====

// GET /pets - Listar todos os pets com imagens
app.get('/pets', async (_req, res) => {
  try {
    const pets = await prisma.pet.findMany({
      include: { 
        cliente: true,
        imagens: true
      }
    });
    res.json(pets);
  } catch (e) {
    console.error('❌ Erro ao listar pets:', e.message);
    res.status(500).json({ error: 'Erro ao listar pets', details: e.message });
  }
});

// POST /pets - Criar novo pet
app.post('/pets', async (req, res) => {
  try {
    const { 
      clienteId, nome, especie, raca, tamanho, peso, idade, 
      temperamento, castrado, medicamentos, cartaoVacinaNumero, observacoes 
    } = req.body;
    
    if (!clienteId || !nome || !especie || !raca || !tamanho || !temperamento) {
      return res.status(400).json({ error: 'Campos obrigatórios: clienteId, nome, especie, raca, tamanho, temperamento' });
    }

    const pet = await prisma.pet.create({
      data: {
        clienteId: parseInt(clienteId),
        nome, especie, raca, 
        tamanho: tamanho.toUpperCase(),
        temperamento: temperamento.toUpperCase(),
        peso: peso ? parseFloat(peso) : null,
        idade, castrado, medicamentos, cartaoVacinaNumero, observacoes
      },
      include: { cliente: true, imagens: true }
    });
    
    res.status(201).json(pet);
  } catch (e) {
    console.error('❌ Erro ao criar pet:', e.message);
    res.status(500).json({ error: 'Erro ao criar pet', details: e.message });
  }
});

// PUT /pets/:id - Atualizar pet
app.put('/pets/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { 
      clienteId, nome, especie, raca, tamanho, peso, idade, 
      temperamento, castrado, medicamentos, cartaoVacinaNumero, observacoes 
    } = req.body;

    const pet = await prisma.pet.update({
      where: { id },
      data: {
        clienteId: parseInt(clienteId),
        nome, especie, raca,
        tamanho: tamanho.toUpperCase(),
        temperamento: temperamento.toUpperCase(),
        peso: peso ? parseFloat(peso) : null,
        idade, castrado, medicamentos, cartaoVacinaNumero, observacoes
      },
      include: { cliente: true, imagens: true }
    });
    
    res.json(pet);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Pet não encontrado' });
    console.error('❌ Erro ao atualizar pet:', e.message);
    res.status(500).json({ error: 'Erro ao atualizar pet' });
  }
});

// DELETE /pets/:id - Remover pet
app.delete('/pets/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.pet.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Pet não encontrado' });
    res.status(500).json({ error: 'Erro ao excluir pet' });
  }
});

// ===== IMAGENS DOS PETS =====

// POST /pets/:id/imagens - Adicionar imagem ao pet
app.post('/pets/:id/imagens', async (req, res) => {
  try {
    const petId = Number(req.params.id);
    const { nome, src, tipo } = req.body;
    
    if (!src) return res.status(400).json({ error: 'Imagem (src) é obrigatória' });

    const imagem = await prisma.petImagem.create({
      data: { petId, nome: nome || 'Imagem', src, tipo: tipo || 'galeria' }
    });
    
    res.status(201).json(imagem);
  } catch (e) {
    console.error('❌ Erro ao adicionar imagem:', e.message);
    res.status(500).json({ error: 'Erro ao adicionar imagem' });
  }
});

// DELETE /pets/imagens/:id - Remover imagem
app.delete('/pets/imagens/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.petImagem.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Imagem não encontrada' });
    res.status(500).json({ error: 'Erro ao excluir imagem' });
  }
});

// ===== CRUD DE HOSPEDAGENS =====

// GET /hospedagens - Listar todas as hospedagens
app.get('/hospedagens', async (_req, res) => {
  try {
    const hospedagens = await prisma.hospedagem.findMany({
      include: { pet: { include: { cliente: true } } }
    });
    res.json(hospedagens);
  } catch (e) {
    console.error('❌ Erro ao listar hospedagens:', e.message);
    res.status(500).json({ error: 'Erro ao listar hospedagens', details: e.message });
  }
});

// POST /hospedagens - Criar nova hospedagem
app.post('/hospedagens', async (req, res) => {
  try {
    const { 
      petId, clienteNome, petNome, checkin, checkout, dias, servicos, 
      subtotal, descontoPercent, total, plano 
    } = req.body;
    
    if (!petId || !checkin || !checkout) {
      return res.status(400).json({ error: 'Campos obrigatórios: petId, checkin, checkout' });
    }

    const hospedagem = await prisma.hospedagem.create({
      data: {
        petId: parseInt(petId),
        clienteNome, petNome,
        checkin: new Date(checkin),
        checkout: new Date(checkout),
        dias: parseInt(dias),
        servicos, plano,
        subtotal: parseFloat(subtotal),
        descontoPercent: parseFloat(descontoPercent) || 0,
        total: parseFloat(total)
      },
      include: { pet: { include: { cliente: true } } }
    });
    
    res.status(201).json(hospedagem);
  } catch (e) {
    console.error('❌ Erro ao criar hospedagem:', e.message);
    res.status(500).json({ error: 'Erro ao criar hospedagem', details: e.message });
  }
});

// PUT /hospedagens/:id - Atualizar hospedagem
app.put('/hospedagens/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, ...data } = req.body;

    const hospedagem = await prisma.hospedagem.update({
      where: { id },
      data: {
        ...data,
        status: status ? status.toUpperCase() : undefined,
        checkin: data.checkin ? new Date(data.checkin) : undefined,
        checkout: data.checkout ? new Date(data.checkout) : undefined,
        subtotal: data.subtotal ? parseFloat(data.subtotal) : undefined,
        total: data.total ? parseFloat(data.total) : undefined
      },
      include: { pet: { include: { cliente: true } } }
    });
    
    res.json(hospedagem);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Hospedagem não encontrada' });
    console.error('❌ Erro ao atualizar hospedagem:', e.message);
    res.status(500).json({ error: 'Erro ao atualizar hospedagem' });
  }
});

// DELETE /hospedagens/:id - Remover hospedagem
app.delete('/hospedagens/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.hospedagem.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Hospedagem não encontrada' });
    res.status(500).json({ error: 'Erro ao excluir hospedagem' });
  }
});

// ===== CRUD DE CRECHES =====

// GET /creches - Listar todas as creches
app.get('/creches', async (_req, res) => {
  try {
    const creches = await prisma.creche.findMany({
      include: { pet: { include: { cliente: true } } }
    });
    res.json(creches);
  } catch (e) {
    console.error('❌ Erro ao listar creches:', e.message);
    res.status(500).json({ error: 'Erro ao listar creches', details: e.message });
  }
});

// POST /creches - Criar nova creche
app.post('/creches', async (req, res) => {
  try {
    const { 
      petId, clienteNome, petNome, data, periodo, plano, entrada, saida,
      dias, atividades, subtotal, descontoPercent, total 
    } = req.body;
    
    if (!petId || !data || !periodo) {
      return res.status(400).json({ error: 'Campos obrigatórios: petId, data, periodo' });
    }

    const creche = await prisma.creche.create({
      data: {
        petId: parseInt(petId),
        clienteNome, petNome,
        data: new Date(data),
        periodo, plano, entrada, saida,
        dias: parseInt(dias),
        atividades,
        subtotal: parseFloat(subtotal),
        descontoPercent: parseFloat(descontoPercent) || 0,
        total: parseFloat(total)
      },
      include: { pet: { include: { cliente: true } } }
    });
    
    res.status(201).json(creche);
  } catch (e) {
    console.error('❌ Erro ao criar creche:', e.message);
    res.status(500).json({ error: 'Erro ao criar creche', details: e.message });
  }
});

// PUT /creches/:id - Atualizar creche
app.put('/creches/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, ...data } = req.body;

    const creche = await prisma.creche.update({
      where: { id },
      data: {
        ...data,
        status: status ? status.toUpperCase() : undefined,
        data: data.data ? new Date(data.data) : undefined,
        subtotal: data.subtotal ? parseFloat(data.subtotal) : undefined,
        total: data.total ? parseFloat(data.total) : undefined
      },
      include: { pet: { include: { cliente: true } } }
    });
    
    res.json(creche);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Creche não encontrada' });
    console.error('❌ Erro ao atualizar creche:', e.message);
    res.status(500).json({ error: 'Erro ao atualizar creche' });
  }
});

// DELETE /creches/:id - Remover creche
app.delete('/creches/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.creche.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Creche não encontrada' });
    res.status(500).json({ error: 'Erro ao excluir creche' });
  }
});

// ===== CONFIGURAÇÕES DE COMUNICAÇÃO =====

// GET /configuracoes-comunicacao - Buscar configurações
app.get('/configuracoes-comunicacao', async (_req, res) => {
  try {
    let config = await prisma.configuracaoComunicacao.findFirst();
    if (!config) {
      // Criar configuração padrão se não existir
      config = await prisma.configuracaoComunicacao.create({
        data: {
          msgCheckin: 'Olá {cliente}! ✅ Confirmamos o check-in do {pet} para {data}. Estamos ansiosos para receber seu peludo! 🐾',
          msgCheckout: 'Olá {cliente}! 🏠 O {pet} está pronto para o check-out. Pode vir buscar seu peludo! Ele se comportou muito bem! 😊',
          msgLembrete: '🔔 Lembrete: {pet} tem {servico} amanhã ({data}). Não esqueça dos pré-requisitos: cartão de vacinas, coleira antipulgas, caminha e ração!',
          msgSatisfacao: 'Olá {cliente}! Como foi a experiência do {pet} conosco? Por favor, avalie de 1 a 5: ⭐⭐⭐⭐⭐ Sua opinião é muito importante!'
        }
      });
    }
    res.json(config);
  } catch (e) {
    console.error('❌ Erro ao buscar configurações:', e.message);
    res.status(500).json({ error: 'Erro ao buscar configurações', details: e.message });
  }
});

// POST /configuracoes-comunicacao - Salvar configurações
app.post('/configuracoes-comunicacao', async (req, res) => {
  try {
    const { whatsappToken, whatsappNumero, smsApiKey, msgCheckin, msgCheckout, msgLembrete, msgSatisfacao } = req.body;
    
    let config = await prisma.configuracaoComunicacao.findFirst();
    
    if (config) {
      // Atualizar existente
      config = await prisma.configuracaoComunicacao.update({
        where: { id: config.id },
        data: { whatsappToken, whatsappNumero, smsApiKey, msgCheckin, msgCheckout, msgLembrete, msgSatisfacao }
      });
    } else {
      // Criar nova
      config = await prisma.configuracaoComunicacao.create({
        data: { whatsappToken, whatsappNumero, smsApiKey, msgCheckin, msgCheckout, msgLembrete, msgSatisfacao }
      });
    }
    
    res.json(config);
  } catch (e) {
    console.error('❌ Erro ao salvar configurações:', e.message);
    res.status(500).json({ error: 'Erro ao salvar configurações', details: e.message });
  }
});

// ===== CONFIGURAÇÕES DE PREÇOS =====

// GET /configuracoes - Buscar configurações de preços
app.get('/configuracoes', async (_req, res) => {
  try {
    let config = await prisma.configuracao.findFirst();
    if (!config) {
      // Criar configuração padrão se não existir
      config = await prisma.configuracao.create({ data: {} });
    }
    res.json(config);
  } catch (e) {
    console.error('❌ Erro ao buscar configurações de preços:', e.message);
    res.status(500).json({ error: 'Erro ao buscar configurações', details: e.message });
  }
});

// POST /configuracoes - Salvar configurações de preços
app.post('/configuracoes', async (req, res) => {
  try {
    const precos = req.body;
    
    let config = await prisma.configuracao.findFirst();
    
    if (config) {
      // Atualizar existente
      config = await prisma.configuracao.update({
        where: { id: config.id },
        data: precos
      });
    } else {
      // Criar nova
      config = await prisma.configuracao.create({
        data: precos
      });
    }
    
    res.json(config);
  } catch (e) {
    console.error('❌ Erro ao salvar configurações:', e.message);
    res.status(500).json({ error: 'Erro ao salvar configurações', details: e.message });
  }
});

// ===== PLANOS CUSTOMIZADOS =====

// GET /planos-customizados - Listar planos
app.get('/planos-customizados', async (_req, res) => {
  try {
    const planos = await prisma.planoCustomizado.findMany({
      where: { ativo: true },
      orderBy: { dataCriacao: 'desc' }
    });
    res.json(planos);
  } catch (e) {
    console.error('❌ Erro ao listar planos:', e.message);
    res.status(500).json({ error: 'Erro ao listar planos', details: e.message });
  }
});

// POST /planos-customizados - Criar plano
app.post('/planos-customizados', async (req, res) => {
  try {
    const { nome, meses, diasMes, descontoPercent, aplica } = req.body;
    
    if (!nome || !meses || !diasMes || !descontoPercent || !aplica) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const plano = await prisma.planoCustomizado.create({
      data: {
        nome, 
        meses: parseInt(meses),
        diasMes: parseInt(diasMes),
        descontoPercent: parseFloat(descontoPercent),
        aplica
      }
    });
    
    res.status(201).json(plano);
  } catch (e) {
    console.error('❌ Erro ao criar plano:', e.message);
    res.status(500).json({ error: 'Erro ao criar plano', details: e.message });
  }
});

// DELETE /planos-customizados/:id - Remover plano
app.delete('/planos-customizados/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.planoCustomizado.update({
      where: { id },
      data: { ativo: false }
    });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Plano não encontrado' });
    res.status(500).json({ error: 'Erro ao remover plano' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: /health`);
  console.log(`👥 Clients API: /clientes`);
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
