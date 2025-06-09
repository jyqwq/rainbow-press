import {computed, onMounted, onUnmounted} from "vue";

const lightTint = {
    r: { value: 200, offset: 36 },
    g: { value: 200, offset: 36 },
    b: { value: 200, offset: 36 }
};
const darkTint = {
    r: { value: 32, offset: 36 },
    g: { value: 32, offset: 36 },
    b: { value: 32, offset: 36 }
};

function useHomeHeroTintPlate(canvas, isDark) {
    let ctx = null;
    let t = 0;
    let timer;
    const plate = computed(() => {
        return isDark.value ? darkTint : lightTint;
    });
    onMounted(() => {
        if (canvas.value) {
            ctx = canvas.value.getContext("2d");
            if (timer) {
                window.cancelAnimationFrame(timer);
            }
            run();
        }
    });
    onUnmounted(() => {
        if (timer) {
            window.cancelAnimationFrame(timer);
        }
    });
    function run() {
        for (let x = 0; x <= 35; x++) {
            for (let y = 0; y <= 35; y++)
                col(x, y, R(x, y, t), G(x, y, t), B(x, y, t));
        }
        t = t + 0.02;
        timer = window.requestAnimationFrame(run);
    }
    function col(x, y, r, g, b) {
        if (!ctx)
            return;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
    }
    function R(x, y, t2) {
        const r = plate.value.r;
        return Math.floor(r.value + r.offset * Math.cos((x * x - y * y) / 300 + t2));
    }
    function G(x, y, t2) {
        const g = plate.value.g;
        return Math.floor(g.value + g.offset * Math.sin((x * x * Math.cos(t2 / 4) + y * y * Math.sin(t2 / 3)) / 300));
    }
    function B(x, y, t2) {
        const b = plate.value.b;
        return Math.floor(b.value + b.offset * Math.sin(5 * Math.sin(t2 / 9) + ((x - 100) * (x - 100) + (y - 100) * (y - 100)) / 1100));
    }
}

export {
    useHomeHeroTintPlate
}