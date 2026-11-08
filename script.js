document.addEventListener('DOMContentLoaded', () => {

    // 1. MANTEER PANTALLA ENCENDIDA (Wake Lock API)
    let wakeLock = null;
    async function requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                wakeLock = await navigator.wakeLock.request('screen');
                document.getElementById('wakeStatus').innerText = '🔒 Pantalla encendida continuamente';
            }
        } catch (err) {}
    }
    requestWakeLock();

    document.addEventListener('visibilitychange', async () => {
        if (wakeLock !== null && document.visibilityState === 'visible') {
            await requestWakeLock();
        }
    });

    // 2. TABLA OFICIAL: DISTANCIA (1 a 40) DE LA REGLA DE 20 -> FUERZA EN BARRA
    const tablaRegla20 = {
        1: 0.31, 2: 0.57, 3: 0.83, 4: 1.09, 5: 1.35,
        6: 1.46, 7: 1.57, 8: 1.68, 9: 1.79, 10: 1.90,
        11: 1.98, 12: 2.06, 13: 2.14, 14: 2.22, 15: 2.30,
        16: 2.38, 17: 2.46, 18: 2.54, 19: 2.62, 20: 2.70,
        21: 2.76, 22: 2.82, 23: 2.88, 24: 2.94, 25: 3.00,
        26: 3.06, 27: 3.12, 28: 3.18, 29: 3.24, 30: 3.00,
        31: 3.36, 32: 3.42, 33: 3.48, 34: 3.54, 35: 3.60,
        36: 3.66, 37: 3.72, 38: 3.78, 39: 3.84, 40: 3.90
    };

    // 3. CÍRCULO TÁCTIL (32 POSICIONES Y FACTORES)
    const canvas = document.getElementById('windCanvas');
    const ctx = canvas.getContext('2d');
    const vientoInput = document.getElementById('viento');
    const distanciaInput = document.getElementById('distancia');
    const resetButton = document.getElementById('reset-button');

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 85;
    const labelRadius = 112;
    const numCheckboxes = 32;

    const checkboxValues = [
        0.2, 0.1, 0.1, 0.18, 0.28, 0.45, 0.5, 0.6,
        0.67, 0.65, 0.6, 0.6, 0.6, 0.55, 0.5, 0.25,
        0.2, 0.15, 0.5, 0.15, 0.25, 0.35, 0.5, 0.6,
        0.68, 0.7, 0.7, 0.7, 0.68, 0.6, 0.5, 0.35
    ];

    const specialIndices = [0, 4, 8, 12, 16, 20, 24, 28];
    const blueIndices = [1, 18];

    let selectedIndex = -1;
    let currentAngle = -Math.PI / 2;

    function drawHUD() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Anillo base
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#84cc16';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Puntos y Factores
        for (let i = 0; i < 32; i++) {
            const angle = -Math.PI / 2 - (i / numCheckboxes) * 2 * Math.PI;
            const xCheck = centerX + Math.cos(angle) * radius;
            const yCheck = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.arc(xCheck, yCheck, i === selectedIndex ? 7 : 3.5, 0, 2 * Math.PI);
            ctx.fillStyle = i === selectedIndex ? '#facc15' : (specialIndices.includes(i) ? '#ef4444' : (blueIndices.includes(i) ? '#3b82f6' : '#ffffff'));
            ctx.fill();

            const xLabel = centerX + Math.cos(angle) * labelRadius;
            const yLabel = centerY + Math.sin(angle) * labelRadius;
            ctx.font = i === selectedIndex ? 'bold 12px Orbitron' : '10px Orbitron';
            ctx.fillStyle = specialIndices.includes(i) ? '#ef4444' : (blueIndices.includes(i) ? '#3b82f6' : '#e2e8f0');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(checkboxValues[i], xLabel, yLabel);
        }

        // Aguja de Viento
        if (selectedIndex !== -1) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + (radius - 10) * Math.cos(currentAngle), centerY + (radius - 10) * Math.sin(currentAngle));
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        calculateResult();
    }

    function handleTouch(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - rect.left - centerX;
        const dy = clientY - rect.top - centerY;

        let angle = Math.atan2(dy, dx);
        currentAngle = angle;

        let normalizedAngle = -Math.PI / 2 - angle;
        while (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
        
        selectedIndex = Math.round((normalizedAngle / (2 * Math.PI)) * numCheckboxes) % numCheckboxes;
        drawHUD();
    }

    let isDragging = false;
    canvas.addEventListener('mousedown', (e) => { isDragging = true; handleTouch(e); });
    canvas.addEventListener('mousemove', (e) => { if (isDragging) handleTouch(e); });
    canvas.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('touchstart', (e) => { isDragging = true; handleTouch(e); }, { passive: true });
    canvas.addEventListener('touchmove', (e) => { if (isDragging) handleTouch(e); }, { passive: true });
    canvas.addEventListener('touchend', () => { isDragging = false; });

    // 4. LÓGICA DE TIRO AUTOMÁTICO
    function calculateResult() {
        const vientoValue = parseFloat(vientoInput.value);
        const distValue = parseInt(distanciaInput.value);

        // Cálculo del Ángulo (Fórmula original +70 / -70)
        if (selectedIndex !== -1 && !isNaN(vientoValue) && vientoInput.value.trim() !== '') {
            const checkboxNum = selectedIndex + 1;
            const checkboxValue = checkboxValues[selectedIndex];
            let angleResult = checkboxValue * vientoValue;

            const decrementGroup = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
            if (decrementGroup.includes(checkboxNum)) {
                angleResult = 70 - angleResult;
            } else {
                angleResult = angleResult + 70;
            }
            document.getElementById('dispAngle').innerText = `${angleResult.toFixed(1)}°`;
        } else {
            document.getElementById('dispAngle').innerText = '--°';
        }

        // Cálculo de la Fuerza en Barra (Desde la Distancia ingresada)
        if (!isNaN(distValue) && distValue > 0) {
            const power = tablaRegla20[distValue] || '--';
            document.getElementById('dispPower').innerText = power;
        } else {
            document.getElementById('dispPower').innerText = '--';
        }
    }

    vientoInput.addEventListener('input', calculateResult);
    distanciaInput.addEventListener('input', calculateResult);

    resetButton.addEventListener('click', () => {
        selectedIndex = -1;
        vientoInput.value = '';
        distanciaInput.value = '';
        drawHUD();
    });

    drawHUD();
});
