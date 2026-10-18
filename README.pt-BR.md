<div align="center">

[🇺🇸 English](README.md) · **🇧🇷 Português**

<a href="https://obras.derson.cloud"><img src="client/public/icon-512.png" alt="Ícone do app Obras" width="120"></a>

# Obras

**Caderno de campo para quem trabalha em obra: endereço, código de entrada, tarefas, fotos e histórico numa ficha só, no celular, mesmo sem sinal.**

[![App no ar](https://img.shields.io/badge/app-obras.derson.cloud-E86A33?style=for-the-badge&logo=googlechrome&logoColor=white)](https://obras.derson.cloud)
[![Status](https://img.shields.io/badge/status-em%20uso%20di%C3%A1rio-2F9E63?style=for-the-badge)](https://obras.derson.cloud)

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

[**🌐 Abrir o app**](https://obras.derson.cloud) · [Sobre](#-sobre) · [Destaques](#-destaques) · [Como rodar](#-como-rodar)

</div>

---

## 📌 Sobre

Em equipe de obra, as informações de cada serviço ficam espalhadas na conversa do WhatsApp: o endereço, o código da portaria, o que falta fazer, a foto da fachada. Achar isso de novo na obra, com uma mão e pouco sinal, toma tempo todo dia.

O Obras coloca cada serviço numa ficha só, que abre com um toque na tela inicial do celular. Fiz para o meu próprio trabalho em campo e uso todo dia.

| | |
|---|---|
| **Tipo** | Produto próprio, em uso diário em campo |
| **Público** | Prestadores de serviço e equipes que atendem várias obras |
| **Meu papel** | Produto, design, desenvolvimento, banco de dados e deploy |
| **Ano** | 2026 |
| **App** | [obras.derson.cloud](https://obras.derson.cloud) |

## ✨ Destaques

- **Uma ficha por obra** com foto da fachada, endereço, cidade e **código de entrada** em destaque.
- **Rota de verdade.** O botão abre o Waze, o Google Maps ou o Apple Maps.
- **Tudo da obra:** água e energia no local, tarefas, observações, fotos e histórico de atualizações.
- **Abas de em andamento e concluídas**, com busca por rua, cidade, código ou serviço.
- **Funciona sem sinal** em modo somente leitura, com o que ficou salvo no aparelho.
- **Instalável** na tela inicial (PWA), com login por e-mail ou Google.
- **Privado por padrão.** RLS em todas as tabelas e fotos num bucket privado, exibidas por link assinado.

## 🚀 Como rodar

Requer **Node 20.19+** e um projeto no Supabase.

```bash
npm install
```

```bash
cp .env.example .env
```

Preencha o `.env` com a URL e a chave publishable do Supabase, depois:

```bash
npm run dev
```

O app sobe em `http://localhost:5173`.

## 🧰 Manutenção

Variáveis de ambiente, deploy, configuração do login com Google e o schema do banco estão em [docs/MAINTENANCE.md](docs/MAINTENANCE.md).

---

<div align="center">

**Wanderson Oliveira** · Sites e soluções com IA que trazem mais clientes para o seu negócio

[![derson.cloud](https://img.shields.io/badge/derson.cloud-2563EB?style=flat-square&logo=googlechrome&logoColor=white)](https://derson.cloud)
[![Email](https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:wanderson1873@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/wanderson1873/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=flat-square&logo=whatsapp&logoColor=white)](https://wa.me/17816664150)

<sub>© 2026 Wanderson Oliveira. Todos os direitos reservados.</sub>

</div>
