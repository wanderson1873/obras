<div align="center">

**🇺🇸 English** · [🇧🇷 Português](README.pt-BR.md)

<a href="https://obras.derson.cloud"><img src="client/public/icon-512.png" alt="Obras app icon" width="120"></a>

# Obras

**A field notebook for construction jobs: address, entry code, tasks, photos and history in one place, on the phone, even offline.**

[![Live app](https://img.shields.io/badge/live-obras.derson.cloud-E86A33?style=for-the-badge&logo=googlechrome&logoColor=white)](https://obras.derson.cloud)
[![Status](https://img.shields.io/badge/status-in%20daily%20use-2F9E63?style=for-the-badge)](https://obras.derson.cloud)

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

[**🌐 Open the app**](https://obras.derson.cloud) · [About](#-about) · [Features](#-features) · [Run locally](#-run-locally)

</div>

---

## 📌 About

On a construction crew, the information for each job lives in a WhatsApp thread: the address, the gate code, what still needs doing, a photo of the front of the house. Finding it again on site, with one hand and a weak signal, wastes time every day.

Obras puts each job on a single card that opens in one tap from the phone's home screen. I built it for my own work in the field and use it every day.

| | |
|---|---|
| **Type** | Personal product, used daily in the field |
| **Audience** | Contractors and crews working on several job sites |
| **My role** | Product, design, development, database and deploy |
| **Year** | 2026 |
| **App** | [obras.derson.cloud](https://obras.derson.cloud) |

## ✨ Features

- **One card per job** with a photo of the front, address, city and the **entry code** highlighted.
- **Real navigation.** The route button opens Waze, Google Maps or Apple Maps.
- **Everything about the job:** water and power on site, tasks, notes, photos and a history of updates.
- **In progress and done tabs**, with search by street, city, code or service.
- **Works without signal** in read-only mode, using what was saved on the device.
- **Installable** on the home screen (PWA), with email or Google sign-in.
- **Private by design.** Row-level security on every table and photos in a private bucket served through signed links.

## 🚀 Run locally

Requires **Node 20.19+** and a Supabase project.

```bash
npm install
```

```bash
cp .env.example .env
```

Fill `.env` with your Supabase URL and publishable key, then:

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

## 🧰 Maintenance

Environment variables, deploy, Google sign-in setup and the database schema are documented in [docs/MAINTENANCE.md](docs/MAINTENANCE.md) (in Portuguese).

---

<div align="center">

**Wanderson Oliveira** · Websites & AI solutions that bring businesses more customers

[![derson.cloud](https://img.shields.io/badge/derson.cloud-2563EB?style=flat-square&logo=googlechrome&logoColor=white)](https://derson.cloud)
[![Email](https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:wanderson1873@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/wanderson1873/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=flat-square&logo=whatsapp&logoColor=white)](https://wa.me/17816664150)

<sub>© 2026 Wanderson Oliveira. All rights reserved.</sub>

</div>
