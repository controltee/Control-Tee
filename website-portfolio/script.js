/* ─────────────────────────────────────────────────────────
   PORTFOLIO — Behaviour
   Add entries to `projects` and the work grid renders them.
───────────────────────────────────────────────────────── */

const projects = [
    { title: 'Project One',   meta: 'Brand Identity · 2026', href: '#' },
    { title: 'Project Two',   meta: 'Motion Design · 2025',  href: '#' },
    { title: 'Project Three', meta: 'Campaign · 2025',       href: '#' },
];

function renderWork() {
    const grid = document.getElementById('work-grid');
    if (!grid) return;

    grid.innerHTML = '';
    projects.forEach(project => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'work-card';
        link.href = project.href;
        link.style.display = 'block';

        const thumb = document.createElement('div');
        thumb.className = 'work-card-thumb';
        if (project.thumb) {
            const img = document.createElement('img');
            img.src = project.thumb;
            img.alt = project.title;
            img.loading = 'lazy';
            thumb.appendChild(img);
        }

        const body = document.createElement('div');
        body.className = 'work-card-body';

        const title = document.createElement('h3');
        title.className = 'work-card-title';
        title.textContent = project.title;

        const meta = document.createElement('p');
        meta.className = 'work-card-meta';
        meta.textContent = project.meta;

        body.append(title, meta);
        link.append(thumb, body);
        item.appendChild(link);
        grid.appendChild(item);
    });
}

function setYear() {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
    renderWork();
    setYear();
});
