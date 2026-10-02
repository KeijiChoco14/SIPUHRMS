import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches (or 13.33 x 7.5 depending on pptxgen version)
pres.author = 'Internship Team - Swiss-Belinn SKA Pekanbaru';
pres.company = 'Swiss-Belinn SKA Pekanbaru';
pres.title = 'SIPU Management System - Presentation';

// Color Palette
const COLORS = {
    bgLight: 'F8FAFC',
    cardBg: 'FFFFFF',
    primaryRed: 'E11D48',    // Swiss-Belinn Red accent
    primaryRedDark: 'BE123C',
    textDark: '0F172A',      // Slate 900
    textMedium: '334155',    // Slate 700
    textMuted: '64748B',     // Slate 500
    borderLight: 'E2E8F0',   // Slate 200
    badgeRedBg: 'FFE4E6',    // Rose 100
    badgeRedText: '9F1239',  // Rose 800
    badgeBlueBg: 'DBEAFE',   // Blue 100
    badgeBlueText: '1E40AF', // Blue 800
    badgeGreenBg: 'DCFCE7',  // Green 100
    badgeGreenText: '166534',// Green 800
    badgeAmberBg: 'FEF3C7',  // Amber 100
    badgeAmberText: '92400E',// Amber 800
    cardBorder: 'E2E8F0'
};

// Helper: Common Header for Content Slides
function addSlideHeader(slide, category, title, subtitle) {
    // Background
    slide.background = { color: COLORS.bgLight };

    // Category Tag
    slide.addText(category.toUpperCase(), {
        x: 0.8,
        y: 0.45,
        w: 11.5,
        h: 0.3,
        fontSize: 10,
        fontFace: 'Arial',
        bold: true,
        color: COLORS.primaryRed,
        charSpacing: 2
    });

    // Main Title
    slide.addText(title, {
        x: 0.8,
        y: 0.75,
        w: 11.5,
        h: 0.65,
        fontSize: 24,
        fontFace: 'Arial',
        bold: true,
        color: COLORS.textDark
    });

    // Subtitle (if any)
    if (subtitle) {
        slide.addText(subtitle, {
            x: 0.8,
            y: 1.4,
            w: 11.5,
            h: 0.35,
            fontSize: 13,
            fontFace: 'Arial',
            italic: false,
            color: COLORS.primaryRed
        });
    }

    // Top Right Brand Monogram
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 12.0,
        y: 0.45,
        w: 0.65,
        h: 0.65,
        rectRadius: 0.1,
        fill: { color: COLORS.primaryRed },
        line: { color: COLORS.primaryRed }
    });
    slide.addText('SB', {
        x: 12.0,
        y: 0.45,
        w: 0.65,
        h: 0.65,
        fontSize: 14,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle'
    });
}

// ==========================================
// SLIDE 1: COVER
// ==========================================
{
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bgLight };

    // Logo Box
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 0.8,
        y: 0.8,
        w: 0.75,
        h: 0.75,
        rectRadius: 0.15,
        fill: { color: COLORS.primaryRed },
        line: { color: COLORS.primaryRed }
    });
    slide.addText('SB', {
        x: 0.8,
        y: 0.8,
        w: 0.75,
        h: 0.75,
        fontSize: 18,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle'
    });

    slide.addText('YEAR\n2026', {
        x: 1.7,
        y: 0.78,
        w: 2.0,
        h: 0.75,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: COLORS.primaryRed
    });

    // Big Title
    slide.addText('SIPU\nManagement\nSystem', {
        x: 0.8,
        y: 2.0,
        w: 5.5,
        h: 2.6,
        fontSize: 44,
        fontFace: 'Arial',
        bold: true,
        color: COLORS.textDark,
        lineSpacing: 46
    });

    // Subtitle
    slide.addText('Task Management System For Swiss-Belinn Pekanbaru', {
        x: 0.8,
        y: 4.8,
        w: 5.8,
        h: 0.6,
        fontSize: 14,
        fontFace: 'Arial',
        bold: true,
        color: COLORS.primaryRed
    });

    slide.addText('Sistem Informasi Pengelolaan Unit, Koordinasi Proyek Lintas Departemen, Presensi, dan Penilaian Kinerja Terpadu', {
        x: 0.8,
        y: 5.4,
        w: 5.5,
        h: 0.8,
        fontSize: 11,
        fontFace: 'Arial',
        color: COLORS.textMuted
    });

    // Right Mockup Frame
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 6.8,
        y: 1.2,
        w: 5.8,
        h: 4.8,
        rectRadius: 0.2,
        fill: { color: 'FFFFFF' },
        line: { color: COLORS.borderLight, width: 1.5 },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 8, offset: 3, angle: 90 }
    });

    // Mockup Header bar
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 7.1,
        y: 1.5,
        w: 5.2,
        h: 0.45,
        rectRadius: 0.08,
        fill: { color: COLORS.bgLight },
        line: { color: COLORS.borderLight }
    });
    slide.addText('SB  SIPU Management Portal', {
        x: 7.25,
        y: 1.5,
        w: 4.0,
        h: 0.45,
        fontSize: 10,
        bold: true,
        color: COLORS.textDark,
        valign: 'middle'
    });

    // Mockup Hero Content
    slide.addText('Empower your workforce with\nSIPU Management', {
        x: 7.2,
        y: 2.3,
        w: 5.0,
        h: 1.2,
        fontSize: 18,
        bold: true,
        align: 'center',
        color: COLORS.textDark
    });
    slide.addText('Internal office management system designed for Swiss-Belinn SKA Pekanbaru.\nStreamline task assignments, attendance tracking, and performance assessments in one place.', {
        x: 7.2,
        y: 3.5,
        w: 5.0,
        h: 0.9,
        fontSize: 9,
        align: 'center',
        color: COLORS.textMuted
    });
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 8.7,
        y: 4.6,
        w: 2.0,
        h: 0.5,
        rectRadius: 0.25,
        fill: { color: COLORS.primaryRed },
        line: { color: COLORS.primaryRed }
    });
    slide.addText('Get Started', {
        x: 8.7,
        y: 4.6,
        w: 2.0,
        h: 0.5,
        fontSize: 10,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle'
    });

    slide.addNotes('Selamat pagi/siang bapak/ibu sekalian. Pada kesempatan ini kami mempresentasikan SIPU Management System: Task & Operations Management Platform yang dirancang khusus untuk memenuhi kebutuhan operasional hotel Swiss-Belinn SKA Pekanbaru.');
}

// ==========================================
// SLIDE 2: CHALLENGE & PERBANDINGAN
// ==========================================
{
    const slide = pres.addSlide();
    addSlideHeader(slide, 'INTRODUCTION', 'CHALLENGE & LATAR BELAKANG', 'Tantangan Operasional Lapangan & Transformasi Menuju Sistem Digital');

    // Left Column: 3 Pain Points
    const painPoints = [
        {
            num: '1',
            title: 'Instruksi Kerja Tercecer & Hilang',
            desc: 'Pesan lisan dan grup WhatsApp rawan tertumpuk pesan pribadi. Tidak ada arsip tugas terpusat yang dapat ditinjau kembali saat evaluasi.'
        },
        {
            num: '2',
            title: 'Nihil Kepastian Akuntabilitas',
            desc: 'Sering timbul alasan "Saya belum baca" atau saling lempar antar departemen. Waktu penerimaan dan pengerjaan tugas tidak pernah tervalidasi.'
        },
        {
            num: '3',
            title: 'Monitoring Proyek Hotel Masih Manual',
            desc: 'Pemeliharaan fasilitas, servis berkala, dan persiapan event besar membutuhkan rekapitulasi manual HOD yang menyita waktu pelayanan tamu.'
        }
    ];

    let startY = 1.95;
    painPoints.forEach(p => {
        // Card Box
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: 0.8,
            y: startY,
            w: 5.5,
            h: 1.45,
            rectRadius: 0.12,
            fill: { color: 'FFFFFF' },
            line: { color: COLORS.borderLight }
        });

        // Number Badge
        slide.addShape(pres.shapes.OVAL, {
            x: 1.0,
            y: startY + 0.25,
            w: 0.45,
            h: 0.45,
            fill: { color: COLORS.badgeRedBg },
            line: { color: COLORS.primaryRed }
        });
        slide.addText(p.num, {
            x: 1.0,
            y: startY + 0.25,
            w: 0.45,
            h: 0.45,
            fontSize: 11,
            bold: true,
            color: COLORS.primaryRed,
            align: 'center',
            valign: 'middle'
        });

        // Title & Desc
        slide.addText(p.title, {
            x: 1.6,
            y: startY + 0.2,
            w: 4.5,
            h: 0.35,
            fontSize: 12,
            bold: true,
            color: COLORS.textDark
        });
        slide.addText(p.desc, {
            x: 1.6,
            y: startY + 0.55,
            w: 4.5,
            h: 0.75,
            fontSize: 9.5,
            color: COLORS.textMedium
        });

        startY += 1.6;
    });

    // Right Column: Table
    slide.addText('Dampak Sebelum vs Sesudah SIPU', {
        x: 6.7,
        y: 1.95,
        w: 5.8,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: COLORS.textDark
    });

    const tableRows = [
        [
            { text: 'Aspek', options: { bold: true, fill: 'F1F5F9', color: COLORS.textDark } },
            { text: 'Metode Lama', options: { bold: true, fill: 'F1F5F9', color: COLORS.textDark } },
            { text: 'Dengan SIPU', options: { bold: true, fill: COLORS.badgeRedBg, color: COLORS.primaryRedDark } }
        ],
        [
            { text: 'Penyampaian Tugas', options: { bold: true } },
            { text: 'Chat WA / Memo Kertas' },
            { text: 'Sistem Terpusat Real-Time', options: { color: COLORS.primaryRedDark, bold: true } }
        ],
        [
            { text: 'Bukti Penerimaan', options: { bold: true } },
            { text: 'Tidak Ada Bukti Sah' },
            { text: 'Wajib Acknowledge Resmi', options: { color: COLORS.primaryRedDark, bold: true } }
        ],
        [
            { text: 'Kontrol Standar (QC)', options: { bold: true } },
            { text: 'Pengecekan Manual / Lisan' },
            { text: 'Alur Review & Approval HOD', options: { color: COLORS.primaryRedDark, bold: true } }
        ],
        [
            { text: 'Dokumentasi Masalah', options: { bold: true } },
            { text: 'Foto di Galeri HP Staf' },
            { text: 'Tersimpan di Cloud Kartu Tugas', options: { color: COLORS.primaryRedDark, bold: true } }
        ],
        [
            { text: 'Laporan ke GM / HOD', options: { bold: true } },
            { text: 'Rekap Manual Akhir Bulan' },
            { text: 'Dashboard Metrik Otomatis', options: { color: COLORS.primaryRedDark, bold: true } }
        ]
    ];

    slide.addTable(tableRows, {
        x: 6.7,
        y: 2.45,
        w: 5.8,
        colW: [1.6, 2.0, 2.2],
        fontSize: 9.5,
        color: COLORS.textDark,
        border: { pt: 0.5, color: COLORS.borderLight },
        align: 'left',
        valign: 'middle',
        rowH: 0.6
    });

    slide.addNotes('Tantangan mendasar yang dihadapi operasional hotel adalah instruksi tercecer di WhatsApp, tidak adanya bukti penerimaan tugas, dan kesulitan monitoring proyek pemeliharaan gedung. Tabel perbandingan menunjukkan lompatan efisiensi setelah SIPU diimplementasikan.');
}

// ==========================================
// SLIDE 3: SOLUSI & EKOSISTEM 9 DEPARTEMEN
// ==========================================
{
    const slide = pres.addSlide();
    addSlideHeader(slide, 'SOLUSI STRATEGIS • PLATFORM OVERVIEW', 'SIPU: Sentralisasi Operasional Hotel', 'Sistem Informasi Pengelolaan Unit & Monitoring Tugas Antar Departemen');

    // Left Column: 3 Pillars
    const pillars = [
        {
            num: '01',
            title: 'Satu Portal Terpadu (Single Source of Truth)',
            desc: 'Mengintegrasikan seluruh divisi operasional hotel tanpa silo komunikasi (Front Office, HK, Engineering, F&B, HR, Sales, IT).'
        },
        {
            num: '02',
            title: 'SOP Compliant & Terstruktur',
            desc: 'Alur kerja baku mengikuti siklus: To Do -> In Progress -> Review (QC) -> Done. Semua tindakan tercatat dalam audit log permanen.'
        },
        {
            num: '03',
            title: 'Aksesibilitas Multi-Perangkat',
            desc: 'Dapat diakses cepat melalui komputer meja resepsionis, laptop ruang HOD, hingga tablet operasional di lantai kamar hotel.'
        }
    ];

    let startY = 2.0;
    pillars.forEach(pil => {
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: 0.8,
            y: startY,
            w: 5.5,
            h: 1.45,
            rectRadius: 0.12,
            fill: { color: 'FFFFFF' },
            line: { color: COLORS.borderLight }
        });

        slide.addText(pil.num, {
            x: 1.0,
            y: startY + 0.15,
            w: 0.8,
            h: 0.4,
            fontSize: 16,
            bold: true,
            color: COLORS.primaryRed
        });
        slide.addText(pil.title, {
            x: 1.9,
            y: startY + 0.15,
            w: 4.2,
            h: 0.4,
            fontSize: 11.5,
            bold: true,
            color: COLORS.textDark
        });
        slide.addText(pil.desc, {
            x: 1.9,
            y: startY + 0.55,
            w: 4.2,
            h: 0.75,
            fontSize: 9.5,
            color: COLORS.textMedium
        });

        startY += 1.6;
    });

    // Right Column: 9 Departemen Card Container
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 6.7,
        y: 2.0,
        w: 5.8,
        h: 4.65,
        rectRadius: 0.18,
        fill: { color: 'FFFFFF' },
        line: { color: COLORS.borderLight }
    });

    slide.addText('9 DEPARTEMEN TERHUBUNG DALAM 1 SISTEM', {
        x: 7.0,
        y: 2.2,
        w: 5.2,
        h: 0.3,
        fontSize: 9,
        bold: true,
        color: COLORS.primaryRed,
        align: 'center',
        charSpacing: 1.5
    });

    slide.addText('Ekosistem Swiss-Belinn SKA PKU', {
        x: 7.0,
        y: 2.5,
        w: 5.2,
        h: 0.4,
        fontSize: 15,
        bold: true,
        color: COLORS.textDark,
        align: 'center'
    });

    // 3x3 Grid
    const depts = [
        { code: 'FO', name: 'Front Office' },
        { code: 'HK', name: 'Housekeeping' },
        { code: 'ENG', name: 'Engineering' },
        { code: 'FNB', name: 'Food & Beverage' },
        { code: 'ACC', name: 'Accounting' },
        { code: 'HR', name: 'Human Resources' },
        { code: 'SM', name: 'Sales & Marketing' },
        { code: 'IT', name: 'IT Support' },
        { code: 'COEX', name: 'SKA Co Ex Event' }
    ];

    depts.forEach((d, idx) => {
        const row = Math.floor(idx / 3);
        const col = idx % 3;
        const xPos = 7.1 + (col * 1.68);
        const yPos = 3.0 + (row * 0.95);

        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos,
            y: yPos,
            w: 1.55,
            h: 0.8,
            rectRadius: 0.08,
            fill: { color: COLORS.bgLight },
            line: { color: COLORS.borderLight }
        });

        slide.addText(d.code, {
            x: xPos,
            y: yPos + 0.08,
            w: 1.55,
            h: 0.35,
            fontSize: 12,
            bold: true,
            color: COLORS.primaryRed,
            align: 'center'
        });
        slide.addText(d.name, {
            x: xPos,
            y: yPos + 0.42,
            w: 1.55,
            h: 0.3,
            fontSize: 8.5,
            color: COLORS.textMuted,
            align: 'center'
        });
    });

    slide.addText('Terintegrasi dengan Keamanan Role: Administrator (HOD) & Staff Pelaksana', {
        x: 7.0,
        y: 6.0,
        w: 5.2,
        h: 0.4,
        fontSize: 9,
        italic: true,
        color: COLORS.textMuted,
        align: 'center'
    });

    slide.addNotes('SIPU menghubungkan 9 departemen inti di Swiss-Belinn SKA Pekanbaru dalam satu platform terpusat, mengeliminasi miskomunikasi antar unit kerja.');
}

// ==========================================
// SLIDE 4: SYSTEM ARCHITECTURE & RBAC
// ==========================================
{
    const slide = pres.addSlide();
    addSlideHeader(slide, 'SYSTEM ARCHITECTURE & SECURITY', 'Hierarki Akses & Kontrol Peran (RBAC)', 'Menjamin Isolasi Data Antar Departemen & Kejelasan Batas Wewenang');

    // 4 Role Cards
    const roles = [
        {
            title: 'General Manager (GM)',
            badge: 'Executive Level',
            color: COLORS.primaryRed,
            bg: COLORS.badgeRedBg,
            points: [
                'Akses Read-All seluruh 9 departemen hotel',
                'Monitoring metrik produktivitas global hotel',
                'Evaluasi performa berkala para HOD & Unit'
            ]
        },
        {
            title: 'Head of Department (HOD)',
            badge: 'Department Manager',
            color: '1E40AF',
            bg: COLORS.badgeBlueBg,
            points: [
                'Inisiasi & pengawasan proyek divisi',
                'Delegasi tugas ke Supervisor & Staff pelaksana',
                'Wewenang Review & Approval akhir (Quality Control)'
            ]
        },
        {
            title: 'Supervisor',
            badge: 'Operational Lead',
            color: '92400E',
            bg: COLORS.badgeAmberBg,
            points: [
                'Pengawasan pengerjaan teknis di lapangan',
                'Inspeksi standar mutu & validasi bukti kerja',
                'Input form penilaian kinerja (Performance Appraisal)'
            ]
        },
        {
            title: 'Staff / Employee',
            badge: 'Field Executor',
            color: '166534',
            bg: COLORS.badgeGreenBg,
            points: [
                'Wajib Acknowledge penugasan resmi sebelum mulai',
                'Pengerjaan sub-checklist sesuai standar SOP',
                'Upload foto bukti penyelesaian & laporan kendala'
            ]
        }
    ];

    roles.forEach((r, idx) => {
        const xPos = 0.8 + (idx * 2.95);
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos,
            y: 2.0,
            w: 2.8,
            h: 3.5,
            rectRadius: 0.12,
            fill: { color: 'FFFFFF' },
            line: { color: COLORS.borderLight }
        });

        // Badge
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos + 0.2,
            y: 2.2,
            w: 2.4,
            h: 0.35,
            rectRadius: 0.08,
            fill: { color: r.bg },
            line: { color: r.bg }
        });
        slide.addText(r.badge, {
            x: xPos + 0.2,
            y: 2.2,
            w: 2.4,
            h: 0.35,
            fontSize: 8.5,
            bold: true,
            color: r.color,
            align: 'center',
            valign: 'middle'
        });

        // Title
        slide.addText(r.title, {
            x: xPos + 0.2,
            y: 2.65,
            w: 2.4,
            h: 0.6,
            fontSize: 12,
            bold: true,
            color: COLORS.textDark,
            align: 'center'
        });

        // Bullets
        let bulletY = 3.35;
        r.points.forEach(pt => {
            slide.addText('• ' + pt, {
                x: xPos + 0.2,
                y: bulletY,
                w: 2.4,
                h: 0.65,
                fontSize: 9,
                color: COLORS.textMedium
            });
            bulletY += 0.65;
        });
    });

    // Bottom Bar Security Info
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 0.8,
        y: 5.75,
        w: 11.65,
        h: 0.9,
        rectRadius: 0.1,
        fill: { color: 'FFFFFF' },
        line: { color: COLORS.primaryRed, width: 1 }
    });
    slide.addText('🔐 Keamanan Data Terjamin: Didukung oleh Spatie Permission Middleware, pencegahan unauthorized access, serta pencatatan audit log otomatis untuk setiap aktivitas penugasan dan persetujuan.', {
        x: 1.0,
        y: 5.75,
        w: 11.25,
        h: 0.9,
        fontSize: 10,
        bold: true,
        color: COLORS.textDark,
        valign: 'middle'
    });

    slide.addNotes('Keamanan akses menggunakan Role-Based Access Control bertingkat, mulai dari General Manager, HOD, Supervisor, hingga Staf lapangan.');
}

// ==========================================
// SLIDE 5: CORE FEATURE - KANBAN & SIKLUS TUGAS
// ==========================================
{
    const slide = pres.addSlide();
    addSlideHeader(slide, 'CORE FEATURE • TASK MANAGEMENT', 'Visualisasi Alur Kerja: Interactive Kanban Board', 'Monitoring Status Pekerjaan Secara Transparan dari Penugasan hingga Quality Control');

    // 4 Kanban Columns Mockup
    const columns = [
        { name: 'To Do', color: '475569', bg: 'F1F5F9', border: 'CBD5E1', count: '5', note: 'Menunggu Acknowledge Staf' },
        { name: 'In Progress', color: '1D4ED8', bg: 'EFF6FF', border: 'BFDBFE', count: '8', note: 'Sedang Dikerjakan' },
        { name: 'Review (QC)', color: 'B45309', bg: 'FFFBEB', border: 'FDE68A', count: '3', note: 'Inspeksi Kualitas HOD' },
        { name: 'Done', color: '15803D', bg: 'F0FDF4', border: 'BBF7D0', count: '24', note: 'Tervalidasi Selesai' }
    ];

    columns.forEach((c, idx) => {
        const xPos = 0.8 + (idx * 2.95);
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos,
            y: 2.0,
            w: 2.8,
            h: 2.3,
            rectRadius: 0.1,
            fill: { color: c.bg },
            line: { color: c.border }
        });

        slide.addText(c.name, {
            x: xPos + 0.2,
            y: 2.15,
            w: 1.8,
            h: 0.35,
            fontSize: 11,
            bold: true,
            color: c.color
        });
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos + 2.1,
            y: 2.15,
            w: 0.5,
            h: 0.3,
            rectRadius: 0.08,
            fill: { color: 'FFFFFF' },
            line: { color: c.border }
        });
        slide.addText(c.count, {
            x: xPos + 2.1,
            y: 2.15,
            w: 0.5,
            h: 0.3,
            fontSize: 9,
            bold: true,
            color: c.color,
            align: 'center',
            valign: 'middle'
        });

        // Sample Task Card inside
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos + 0.15,
            y: 2.6,
            w: 2.5,
            h: 1.5,
            rectRadius: 0.08,
            fill: { color: 'FFFFFF' },
            line: { color: COLORS.borderLight }
        });
        slide.addText(c.note, {
            x: xPos + 0.25,
            y: 2.7,
            w: 2.3,
            h: 0.4,
            fontSize: 9,
            bold: true,
            color: COLORS.textDark
        });
        slide.addText('Prioritas: Urgent • Due Today\nChecklist: 3/4 Complete', {
            x: xPos + 0.25,
            y: 3.1,
            w: 2.3,
            h: 0.5,
            fontSize: 8,
            color: COLORS.textMuted
        });
    });

    // 3 Feature Highlights Below
    const highlights = [
        {
            title: '1. Mandatory Acknowledgment',
            desc: 'Penerima tugas wajib menekan tombol Acknowledge resmi sebelum memulai. Waktu penerimaan terekam permanen untuk mencegah alasan belum membaca instruksi.'
        },
        {
            title: '2. SOP Checklist & Foto Bukti',
            desc: 'Setiap tugas dilengkapi sub-tugas rincian checklist standar hotel serta lampiran foto bukti sebelum dan sesudah pekerjaan dikerjakan staf.'
        },
        {
            title: '3. Alur Verifikasi Quality Control (QC)',
            desc: 'Tugas tidak dapat langsung diselesaikan oleh staf pelaksana. Kartu tugas harus masuk ke tahap Review untuk diverifikasi dan disetujui resmi oleh HOD/Supervisor.'
        }
    ];

    highlights.forEach((h, idx) => {
        const xPos = 0.8 + (idx * 3.95);
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos,
            y: 4.5,
            w: 3.75,
            h: 2.15,
            rectRadius: 0.1,
            fill: { color: 'FFFFFF' },
            line: { color: COLORS.borderLight }
        });

        slide.addText(h.title, {
            x: xPos + 0.2,
            y: 4.7,
            w: 3.35,
            h: 0.35,
            fontSize: 11,
            bold: true,
            color: COLORS.primaryRed
        });
        slide.addText(h.desc, {
            x: xPos + 0.2,
            y: 5.1,
            w: 3.35,
            h: 1.35,
            fontSize: 9,
            color: COLORS.textMedium
        });
    });

    slide.addNotes('Interactive Kanban Board membagi alur kerja menjadi 4 tahap pasti. Fitur Mandatory Acknowledge menjamin akuntabilitas, sedangkan tahap Review memastikan standar mutu pelayanan hotel tetap terjaga.');
}

// ==========================================
// SLIDE 6: CORE FEATURE - PROJECT & EVENT MANAGEMENT
// ==========================================
{
    const slide = pres.addSlide();
    addSlideHeader(slide, 'CORE FEATURE • PROJECT & EVENT TRACKING', 'Manajemen Proyek Fasilitas & Event Hotel', 'Koordinasi Terpadu untuk Pemeliharaan Gedung dan Acara MICE di SKA Co Ex');

    // Left Column: Core Logic
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 0.8,
        y: 2.0,
        w: 5.6,
        h: 4.65,
        rectRadius: 0.15,
        fill: { color: 'FFFFFF' },
        line: { color: COLORS.borderLight }
    });

    slide.addText('Mekanisme Manajemen Proyek Otomatis', {
        x: 1.1,
        y: 2.3,
        w: 5.0,
        h: 0.35,
        fontSize: 13,
        bold: true,
        color: COLORS.textDark
    });

    const logics = [
        {
            title: 'Auto Progress Recalculation',
            desc: 'Persentase kemajuan proyek terhitung secara matematis otomatis dari akumulasi bobot tugas yang telah diselesaikan (Done).'
        },
        {
            title: 'Health Status & Deadline Watch',
            desc: 'Status proyek terpetakan jelas: Planning, Active, On Hold, Completed, atau Archived dengan peringatan dini jika mendekati batas deadline.'
        },
        {
            title: 'Kolaborasi Multi-Departemen',
            desc: 'Satu proyek besar dapat melibatkan beberapa departemen sekaligus (misal: Event Wedding melibatkan Sales, Banquet F&B, Sound ENG, dan IT).'
        }
    ];

    let lY = 2.8;
    logics.forEach(l => {
        slide.addText('✓ ' + l.title, {
            x: 1.1,
            y: lY,
            w: 5.0,
            h: 0.3,
            fontSize: 11,
            bold: true,
            color: COLORS.primaryRed
        });
        slide.addText(l.desc, {
            x: 1.3,
            y: lY + 0.3,
            w: 4.8,
            h: 0.65,
            fontSize: 9.5,
            color: COLORS.textMedium
        });
        lY += 1.1;
    });

    // Right Column: 3 Use Cases in Hotel
    const useCases = [
        {
            dept: 'ENGINEERING',
            title: 'Preventive Maintenance Gedung',
            desc: 'Jadwal servis rutin genset, pembersihan chiller AC sentral, dan inspeksi lift berkala dengan timeline yang terpantau ketat.'
        },
        {
            dept: 'SKA CO EX & BANQUET',
            title: 'Persiapan Event MICE Skala Besar',
            desc: 'Penyusunan panggung, tata cahaya, registrasi tamu VIP, dan buffet dinner tanpa kendala koordinasi lintas divisi.'
        },
        {
            dept: 'HOUSEKEEPING',
            title: 'Deep Cleaning & Renovasi Kamar',
            desc: 'Program pembersihan menyeluruh karpet kamar tamu dan peremajaan interior lantai hotel secara terjadwal.'
        }
    ];

    let ucY = 2.0;
    useCases.forEach(uc => {
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: 6.7,
            y: ucY,
            w: 5.8,
            h: 1.45,
            rectRadius: 0.12,
            fill: { color: 'FFFFFF' },
            line: { color: COLORS.borderLight }
        });

        slide.addText(uc.dept, {
            x: 6.9,
            y: ucY + 0.15,
            w: 5.4,
            h: 0.25,
            fontSize: 8.5,
            bold: true,
            color: COLORS.primaryRed,
            charSpacing: 1
        });
        slide.addText(uc.title, {
            x: 6.9,
            y: ucY + 0.4,
            w: 5.4,
            h: 0.35,
            fontSize: 11.5,
            bold: true,
            color: COLORS.textDark
        });
        slide.addText(uc.desc, {
            x: 6.9,
            y: ucY + 0.75,
            w: 5.4,
            h: 0.6,
            fontSize: 9,
            color: COLORS.textMedium
        });

        ucY += 1.6;
    });

    slide.addNotes('Proyek besar seperti persiapan event di SKA Co Ex atau perawatan AC sentral Engineering kini dimonitor dalam satu kanvas proyek. Progres persentase dihitung otomatis oleh sistem.');
}

// ==========================================
// SLIDE 7: EXTENDED MODULE - HR OPERATIONS
// ==========================================
{
    const slide = pres.addSlide();
    addSlideHeader(slide, 'EXTENDED MODULE • HR & WORKFORCE', 'Digitalisasi SDM: Shift Roster, Presensi & Payroll', 'Otomatisasi Administrasi Karyawan dari Pengaturan Roster hingga Slip Gaji Digital');

    const hrModules = [
        {
            title: 'Manajemen Shift Roster 24/7',
            badge: 'Shift Scheduling',
            points: [
                'Pengaturan fleksibel shift khas perhotelan: Morning, Afternoon, Night, dan Middle shift.',
                'Penetapan jadwal berkala mingguan & bulanan staf departemen.',
                'Mencegah kekosongan posisi krusial di Front Desk dan Tim Operasional.'
            ]
        },
        {
            title: 'Presensi & Lembur (Overtime)',
            badge: 'Attendance & Leave',
            points: [
                'Integrasi API sinkronisasi data presensi secara real-time.',
                'Alur pengajuan cuti (Leave Request) dengan persetujuan bertingkat.',
                'Tracking lembur (Overtime Request) terverifikasi langsung oleh atasan.'
            ]
        },
        {
            title: 'Penggajian & E-Payslip',
            badge: 'Automated Payroll',
            points: [
                'Kalkulasi otomatis komponen gaji pokok, tunjangan, dan lembur.',
                'Pemotongan akurat berdasarkan keterlambatan dan ketidakhadiran.',
                'Generate slip gaji digital (E-Payslip) yang dapat diunduh mandiri oleh staf.'
            ]
        }
    ];

    hrModules.forEach((m, idx) => {
        const xPos = 0.8 + (idx * 3.95);
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos,
            y: 2.0,
            w: 3.75,
            h: 4.65,
            rectRadius: 0.15,
            fill: { color: 'FFFFFF' },
            line: { color: COLORS.borderLight }
        });

        // Badge
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos + 0.3,
            y: 2.3,
            w: 3.15,
            h: 0.35,
            rectRadius: 0.08,
            fill: { color: COLORS.badgeRedBg },
            line: { color: COLORS.badgeRedBg }
        });
        slide.addText(m.badge, {
            x: xPos + 0.3,
            y: 2.3,
            w: 3.15,
            h: 0.35,
            fontSize: 9,
            bold: true,
            color: COLORS.primaryRedDark,
            align: 'center',
            valign: 'middle'
        });

        slide.addText(m.title, {
            x: xPos + 0.3,
            y: 2.85,
            w: 3.15,
            h: 0.6,
            fontSize: 13,
            bold: true,
            color: COLORS.textDark,
            align: 'center'
        });

        let pY = 3.6;
        m.points.forEach(pt => {
            slide.addText('• ' + pt, {
                x: xPos + 0.3,
                y: pY,
                w: 3.15,
                h: 0.85,
                fontSize: 9.5,
                color: COLORS.textMedium
            });
            pY += 0.85;
        });
    });

    slide.addNotes('Selain manajemen tugas, SIPU menyediakan modul HR terpadu yang memfasilitasi shift roster 24/7 hotel, tracking absensi, cuti, lembur, hingga otomasi slip gaji karyawan.');
}

// ==========================================
// SLIDE 8: ANALYTICS & PERFORMANCE APPRAISAL
// ==========================================
{
    const slide = pres.addSlide();
    addSlideHeader(slide, 'ANALYTICS & EVALUATION', 'Penilaian Kinerja Objektif & Transparan', 'Mentransformasi Evaluasi Karyawan Menjadi Berbasis Data Nyata Lapangan');

    // Left Column: Komponen Penilaian
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 0.8,
        y: 2.0,
        w: 5.6,
        h: 4.65,
        rectRadius: 0.15,
        fill: { color: 'FFFFFF' },
        line: { color: COLORS.borderLight }
    });

    slide.addText('Matriks Penilaian Terintegrasi', {
        x: 1.1,
        y: 2.3,
        w: 5.0,
        h: 0.35,
        fontSize: 13,
        bold: true,
        color: COLORS.textDark
    });

    const appraisalCards = [
        {
            title: '1. Skor Penyelesaian Tugas (Objektif)',
            desc: 'Dihitung otomatis dari rasio penyelesaian tugas tepat waktu, tingkat kepatuhan checklist, dan catatan revisi QC.'
        },
        {
            title: '2. Supervisor Periodic Assessment',
            desc: 'Evaluasi kualitatif terstruktur oleh atasan mencakup inisiatif, kedisiplinan, kerjasama tim, dan standar hospitality hotel.'
        },
        {
            title: '3. Performance Period Locking',
            desc: 'Penyimpanan arsip skor berkala (Bulanan / Triwulan) yang terkunci aman untuk dasar rekomendasi insentif & promosi jenjang karir.'
        }
    ];

    let aY = 2.8;
    appraisalCards.forEach(ac => {
        slide.addText(ac.title, {
            x: 1.1,
            y: aY,
            w: 5.0,
            h: 0.3,
            fontSize: 11,
            bold: true,
            color: COLORS.primaryRed
        });
        slide.addText(ac.desc, {
            x: 1.1,
            y: aY + 0.3,
            w: 5.0,
            h: 0.7,
            fontSize: 9.5,
            color: COLORS.textMedium
        });
        aY += 1.15;
    });

    // Right Column: Manfaat Bagi Manajemen & Staf
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 6.7,
        y: 2.0,
        w: 5.8,
        h: 2.2,
        rectRadius: 0.15,
        fill: { color: 'FFFFFF' },
        line: { color: COLORS.borderLight }
    });
    slide.addText('Bagi Manajemen & General Manager', {
        x: 7.0,
        y: 2.25,
        w: 5.2,
        h: 0.3,
        fontSize: 12,
        bold: true,
        color: COLORS.primaryRed
    });
    slide.addText('• Identifikasi cepat staf berprestasi (Top Performers) untuk apresiasi.\n• Deteksi dini departemen atau unit yang mengalami bottleneck operasional.\n• Dasar pengambilan keputusan berbasis data faktual, bukan opini subjektif.', {
        x: 7.0,
        y: 2.65,
        w: 5.2,
        h: 1.3,
        fontSize: 9.5,
        color: COLORS.textMedium
    });

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 6.7,
        y: 4.45,
        w: 5.8,
        h: 2.2,
        rectRadius: 0.15,
        fill: { color: 'FFFFFF' },
        line: { color: COLORS.borderLight }
    });
    slide.addText('Bagi Karyawan & Staff', {
        x: 7.0,
        y: 4.7,
        w: 5.2,
        h: 0.3,
        fontSize: 12,
        bold: true,
        color: '1E40AF'
    });
    slide.addText('• Transparansi tolak ukur kinerja yang jelas dan adil.\n• Feedback konstruktif yang tercatat dari supervisor.\n• Motivasi kerja meningkat karena setiap usaha dan penyelesaian tugas tercatat.', {
        x: 7.0,
        y: 5.1,
        w: 5.2,
        h: 1.3,
        fontSize: 9.5,
        color: COLORS.textMedium
    });

    slide.addNotes('Penilaian kinerja tidak lagi subjektif. Sistem mengombinasikan persentase penyelesaian tugas riil dengan evaluasi supervisor.');
}

// ==========================================
// SLIDE 9: TECHNICAL FOUNDATION (STACK)
// ==========================================
{
    const slide = pres.addSlide();
    addSlideHeader(slide, 'TECHNICAL FOUNDATION', 'Fondasi Teknologi Modern & Skalabel', 'Dibangun dengan Standar Arsitektur Enterprise untuk Kecepatan dan Stabilitas Tinggi');

    const techPillars = [
        {
            name: 'Laravel 11',
            badge: 'Backend Framework',
            desc: 'Framework PHP terkini dengan keamanan tingkat tinggi, arsitektur MVC yang rapi, ORM Eloquent tangguh, dan integrasi otorisasi Spatie RBAC.'
        },
        {
            name: 'React.js & Inertia.js',
            badge: 'Frontend Modern',
            desc: 'Menghadirkan pengalaman Single Page Application (SPA) yang sangat mulus tanpa reload halaman saat menggeser kartu Kanban dan memperbarui status.'
        },
        {
            name: 'Tailwind CSS',
            badge: 'Design System',
            desc: 'Antarmuka responsif dan modern berstandar enterprise yang dioptimasi khusus untuk kemudahan navigasi di tablet operasional dan desktop monitor.'
        },
        {
            name: 'Relational Database & Cloud Storage',
            badge: 'Data & Asset Security',
            desc: 'Struktur database relasional yang kuat (PostgreSQL/MySQL) dengan penyimpanan aman berkas dokumen hotel dan bukti foto penanganan masalah.'
        }
    ];

    techPillars.forEach((t, idx) => {
        const xPos = 0.8 + (idx * 2.95);
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos,
            y: 2.0,
            w: 2.8,
            h: 4.65,
            rectRadius: 0.15,
            fill: { color: 'FFFFFF' },
            line: { color: COLORS.borderLight }
        });

        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos + 0.2,
            y: 2.3,
            w: 2.4,
            h: 0.35,
            rectRadius: 0.08,
            fill: { color: COLORS.badgeRedBg },
            line: { color: COLORS.badgeRedBg }
        });
        slide.addText(t.badge, {
            x: xPos + 0.2,
            y: 2.3,
            w: 2.4,
            h: 0.35,
            fontSize: 8.5,
            bold: true,
            color: COLORS.primaryRedDark,
            align: 'center',
            valign: 'middle'
        });

        slide.addText(t.name, {
            x: xPos + 0.2,
            y: 2.8,
            w: 2.4,
            h: 0.55,
            fontSize: 13,
            bold: true,
            color: COLORS.textDark,
            align: 'center'
        });

        slide.addText(t.desc, {
            x: xPos + 0.2,
            y: 3.5,
            w: 2.4,
            h: 3.0,
            fontSize: 9.5,
            color: COLORS.textMedium
        });
    });

    slide.addNotes('Teknologi yang digunakan adalah Laravel 11 dikombinasikan dengan React dan Inertia.js untuk menjamin performa cepat dan responsif tanpa lag.');
}

// ==========================================
// SLIDE 10: BUSINESS IMPACT & ROI
// ==========================================
{
    const slide = pres.addSlide();
    addSlideHeader(slide, 'BUSINESS IMPACT & ROI', 'Transformasi Efisiensi Operasional Swiss-Belinn', 'Peningkatan Kualitas Pelayanan Tamu Melalui Efisiensi Kerja di Balik Layar');

    const metrics = [
        {
            num: '+80%',
            label: 'Kecepatan Respon Tugas',
            desc: 'Instruksi antar divisi (misal Front Office lapor kendala kamar ke Engineering/HK) langsung diterima dan dieksekusi tanpa jeda telepon/WA.'
        },
        {
            num: '100%',
            label: 'Akuntabilitas Terverifikasi',
            desc: 'Fitur Mandatory Acknowledgment dan Review QC menghilangkan budaya saling melempar tanggung jawab antar staf/departemen.'
        },
        {
            num: '0',
            label: 'Instruksi Tercecer (Zero Loss)',
            desc: 'Tidak ada lagi memo kertas yang hilang atau instruksi pimpinan yang tertumpuk di percakapan grup pribadi.'
        },
        {
            num: '100%',
            label: 'Paperless & Ramah Lingkungan',
            desc: 'Mengurangi pemakaian kertas formulir kendala fisik, memo harian, dan pencetakan slip gaji secara signifikan.'
        }
    ];

    metrics.forEach((m, idx) => {
        const xPos = 0.8 + (idx * 2.95);
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos,
            y: 2.0,
            w: 2.8,
            h: 4.65,
            rectRadius: 0.15,
            fill: { color: 'FFFFFF' },
            line: { color: COLORS.borderLight }
        });

        slide.addText(m.num, {
            x: xPos + 0.2,
            y: 2.3,
            w: 2.4,
            h: 0.9,
            fontSize: 32,
            bold: true,
            color: COLORS.primaryRed,
            align: 'center'
        });

        slide.addText(m.label, {
            x: xPos + 0.2,
            y: 3.2,
            w: 2.4,
            h: 0.6,
            fontSize: 11.5,
            bold: true,
            color: COLORS.textDark,
            align: 'center'
        });

        slide.addText(m.desc, {
            x: xPos + 0.2,
            y: 3.9,
            w: 2.4,
            h: 2.5,
            fontSize: 9.5,
            color: COLORS.textMedium
        });
    });

    slide.addNotes('Dampak nyata yang dirasakan adalah peningkatan respon tugas hingga 80%, transparansi tanggung jawab 100%, serta pengurangan memo fisik.');
}

// ==========================================
// SLIDE 11: FUTURE ROADMAP
// ==========================================
{
    const slide = pres.addSlide();
    addSlideHeader(slide, 'FUTURE INNOVATION', 'Roadmap Pengembangan Ekosistem SIPU', 'Langkah Strategis Menuju Penerapan Ekosistem Smart Hotel Swiss-Belinn');

    const roadmapPhases = [
        {
            phase: 'FASE 1',
            target: 'Jangka Pendek (Q1 2026)',
            title: 'Mobile App & Push Notification',
            color: COLORS.primaryRed,
            bg: COLORS.badgeRedBg,
            items: [
                'Aplikasi mobile staf operasional (PWA / Android).',
                'Notifikasi suara instan saat tugas darurat (Urgent) masuk.',
                'Kemampuan check-in presensi berbasis radius geofencing hotel.'
            ]
        },
        {
            phase: 'FASE 2',
            target: 'Jangka Menengah (Q2 2026)',
            title: 'Integrasi Langsung PMS Hotel',
            color: '1E40AF',
            bg: COLORS.badgeBlueBg,
            items: [
                'Sinkronisasi otomatis dengan Property Management System hotel.',
                'Tugas pembersihan Housekeeping otomatis terbuat saat tamu check-out.',
                'Laporan kerusakan kamar langsung mengunci status kamar (Out of Order).'
            ]
        },
        {
            phase: 'FASE 3',
            target: 'Jangka Panjang (Q3 2026)',
            title: 'IoT & WhatsApp Bot Automation',
            color: '166534',
            bg: COLORS.badgeGreenBg,
            items: [
                'Sensor IoT untuk pemantauan suhu chiller dan beban genset otomatis.',
                'Bot WhatsApp resmi untuk pembuatan tiket perbaikan cepat oleh HOD saat berada di luar area hotel.'
            ]
        }
    ];

    roadmapPhases.forEach((p, idx) => {
        const xPos = 0.8 + (idx * 3.95);
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos,
            y: 2.0,
            w: 3.75,
            h: 4.65,
            rectRadius: 0.15,
            fill: { color: 'FFFFFF' },
            line: { color: COLORS.borderLight }
        });

        // Phase Header
        slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
            x: xPos + 0.3,
            y: 2.3,
            w: 3.15,
            h: 0.35,
            rectRadius: 0.08,
            fill: { color: p.bg },
            line: { color: p.bg }
        });
        slide.addText(`${p.phase} • ${p.target}`, {
            x: xPos + 0.3,
            y: 2.3,
            w: 3.15,
            h: 0.35,
            fontSize: 9,
            bold: true,
            color: p.color,
            align: 'center',
            valign: 'middle'
        });

        slide.addText(p.title, {
            x: xPos + 0.3,
            y: 2.85,
            w: 3.15,
            h: 0.6,
            fontSize: 12.5,
            bold: true,
            color: COLORS.textDark,
            align: 'center'
        });

        let rY = 3.65;
        p.items.forEach(it => {
            slide.addText('✓ ' + it, {
                x: xPos + 0.3,
                y: rY,
                w: 3.15,
                h: 0.85,
                fontSize: 9.5,
                color: COLORS.textMedium
            });
            rY += 0.85;
        });
    });

    slide.addNotes('Ke depan, sistem ini direncanakan terintegrasi langsung dengan PMS kamar hotel dan aplikasi mobile push notifications.');
}

// ==========================================
// SLIDE 12: CLOSING & Q&A (UPGRADED SLIDE 4)
// ==========================================
{
    const slide = pres.addSlide();
    slide.background = { color: COLORS.bgLight };

    // Card Box Center
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 1.5,
        y: 1.0,
        w: 10.33,
        h: 5.5,
        rectRadius: 0.2,
        fill: { color: 'FFFFFF' },
        line: { color: COLORS.borderLight },
        shadow: { type: 'outer', color: 'CBD5E1', blur: 10, offset: 4, angle: 90 }
    });

    // Logo Monogram
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 6.2,
        y: 1.5,
        w: 0.9,
        h: 0.9,
        rectRadius: 0.15,
        fill: { color: COLORS.primaryRed },
        line: { color: COLORS.primaryRed }
    });
    slide.addText('SB', {
        x: 6.2,
        y: 1.5,
        w: 0.9,
        h: 0.9,
        fontSize: 22,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle'
    });

    slide.addText('Thank You!', {
        x: 2.0,
        y: 2.6,
        w: 9.33,
        h: 0.8,
        fontSize: 36,
        bold: true,
        color: COLORS.textDark,
        align: 'center'
    });

    slide.addText('Mewujudkan Operasional Swiss-Belinn SKA Pekanbaru yang Lebih Terstruktur, Cepat, dan Akuntabel.', {
        x: 2.5,
        y: 3.4,
        w: 8.33,
        h: 0.5,
        fontSize: 13,
        bold: true,
        color: COLORS.primaryRed,
        align: 'center'
    });

    slide.addText('Sesi Diskusi & Tanya Jawab (Q&A)\nKami mengundang masukan, saran, dan pertanyaan dari Bapak/Ibu Dewan Penguji & Manajemen.', {
        x: 2.5,
        y: 4.1,
        w: 8.33,
        h: 0.8,
        fontSize: 11,
        color: COLORS.textMedium,
        align: 'center'
    });

    slide.addShape(pres.shapes.LINE, {
        x: 4.5,
        y: 5.1,
        w: 4.33,
        h: 0.0,
        line: { color: COLORS.borderLight, width: 1 }
    });

    slide.addText('Swiss-Belinn SKA Pekanbaru • IT Internship Project 2026', {
        x: 2.5,
        y: 5.3,
        w: 8.33,
        h: 0.4,
        fontSize: 10,
        color: COLORS.textMuted,
        align: 'center'
    });

    slide.addNotes('Terima kasih banyak atas perhatian Bapak/Ibu sekalian. Kami membuka sesi tanya jawab dan memohon masukan demi penyempurnaan sistem ini.');
}

// Write to File
const outputPath = path.resolve('SIPU_Management_System_Presentation.pptx');
pres.writeFile({ fileName: outputPath })
    .then(fileName => {
        console.log(`SUCCESS: Presentation created at: ${fileName}`);
    })
    .catch(err => {
        console.error('ERROR creating presentation:', err);
    });
