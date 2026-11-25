<script setup>
import { ref } from 'vue'

const token = ref('')
const email = ref('')
const senha = ref('')
const agendas = ref([])
const loading = ref(false)
const error = ref('')
const form = ref({
  nome: '',
  aula: 1,
  hora: '',
})

async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token.value) headers.set('Authorization', `Bearer ${token.value}`)

  const response = await fetch(`/api${path}`, { ...options, headers })
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message
    throw new Error(message || `A solicitação falhou (${response.status}).`)
  }

  return body
}

async function loadAgendas() {
  agendas.value = await request('/agenda')
}

async function login() {
  loading.value = true
  error.value = ''
  try {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.value, senha: senha.value }),
    })
    token.value = result.access_token
    senha.value = ''
    await loadAgendas()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Não foi possível entrar.'
  } finally {
    loading.value = false
  }
}

async function createAgenda() {
  loading.value = true
  error.value = ''
  try {
    await request('/agenda', {
      method: 'POST',
      body: JSON.stringify({
        status: 'agendado',
        nome: form.value.nome,
        aula: Number(form.value.aula),
        hora: new Date(form.value.hora).toISOString(),
      }),
    })
    form.value = { nome: '', aula: 1, hora: '' }
    await loadAgendas()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Não foi possível criar o agendamento.'
  } finally {
    loading.value = false
  }
}

async function updateStatus(agenda, status) {
  error.value = ''
  try {
    await request(`/agenda/${agenda.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    await loadAgendas()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Não foi possível atualizar o agendamento.'
  }
}

function logout() {
  token.value = ''
  agendas.value = []
  error.value = ''
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function statusLabel(status) {
  return {
    agendado: 'Agendado',
    em_andamento: 'Em andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  }[status] || status
}
</script>

<template>
  <main class="page">
    <header class="topbar">
      <a class="brand" href="/" aria-label="Oficina, página inicial">
        <span class="brand-mark" aria-hidden="true">M</span>
        <span>Oficina<span class="brand-light">Mecânica</span></span>
      </a>
      <button v-if="token" class="button button-quiet" type="button" @click="logout">
        Sair
      </button>
    </header>

    <section v-if="!token" class="login-layout">
      <div class="intro">
        <p class="eyebrow">GESTÃO DA OFICINA</p>
        <h1>Seu próximo serviço começa com um bom agendamento.</h1>
        <p class="intro-copy">
          Acesse para organizar os horários e acompanhar os serviços da sua oficina.
        </p>
      </div>

      <form class="panel login-panel" @submit.prevent="login">
        <div>
          <p class="eyebrow">BEM-VINDO DE VOLTA</p>
          <h2>Entrar na sua conta</h2>
        </div>
        <label>
          E-mail
          <input v-model="email" type="email" autocomplete="username" required />
        </label>
        <label>
          Senha
          <input v-model="senha" type="password" autocomplete="current-password" required />
        </label>
        <p v-if="error" class="alert" role="alert">{{ error }}</p>
        <button class="button button-primary" type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </section>

    <section v-else class="dashboard">
      <div class="page-heading">
        <div>
          <p class="eyebrow">PAINEL DA OFICINA</p>
          <h1>Agendamentos</h1>
          <p class="intro-copy">Organize os serviços e acompanhe o andamento do dia.</p>
        </div>
        <span class="count">{{ agendas.length }} serviços</span>
      </div>

      <p v-if="error" class="alert" role="alert">{{ error }}</p>

      <div class="dashboard-grid">
        <form class="panel create-panel" @submit.prevent="createAgenda">
          <div>
            <p class="eyebrow">NOVO SERVIÇO</p>
            <h2>Fazer agendamento</h2>
          </div>
          <label>
            Nome do cliente
            <input v-model.trim="form.nome" type="text" required />
          </label>
          <label>
            Número da aula
            <input v-model.number="form.aula" type="number" min="1" step="1" required />
          </label>
          <label>
            Data e horário
            <input v-model="form.hora" type="datetime-local" required />
          </label>
          <button class="button button-primary" type="submit" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar agendamento' }}
          </button>
        </form>

        <section class="panel appointments-panel" aria-labelledby="appointments-title">
          <div class="list-heading">
            <div>
              <p class="eyebrow">AGENDA</p>
              <h2 id="appointments-title">Próximos serviços</h2>
            </div>
            <button class="button button-quiet" type="button" @click="loadAgendas">
              Atualizar
            </button>
          </div>

          <ul v-if="agendas.length" class="appointment-list">
            <li v-for="agenda in agendas" :key="agenda.id" class="appointment">
              <div class="appointment-time">
                <span class="time-day">{{ formatDate(agenda.hora) }}</span>
                <span class="appointment-status" :class="`status-${agenda.status}`">
                  {{ statusLabel(agenda.status) }}
                </span>
              </div>
              <div class="appointment-info">
                <h3>{{ agenda.nome || 'Cliente sem nome' }}</h3>
                <p>Aula {{ agenda.aula }}</p>
              </div>
              <div v-if="!['concluido', 'cancelado'].includes(agenda.status)" class="appointment-actions">
                <button
                  v-if="agenda.status !== 'em_andamento'"
                  class="text-button"
                  type="button"
                  @click="updateStatus(agenda, 'em_andamento')"
                >
                  Iniciar
                </button>
                <button
                  class="text-button"
                  type="button"
                  @click="updateStatus(agenda, 'concluido')"
                >
                  Concluir
                </button>
              </div>
            </li>
          </ul>
          <div v-else class="empty-state">
            <span class="empty-icon" aria-hidden="true">+</span>
            <h3>Nenhum serviço na agenda</h3>
            <p>Crie um agendamento para começar a organizar sua oficina.</p>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
