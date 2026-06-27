/*
 * http://love.hackerzhou.me
 * Modernized: vanilla JS (no jQuery), responsive scaling.
 */

// ── Typewriter ──────────────────────────────────────────────
// Reveals an element's innerHTML character by character with a
// blinking caret. Returns a Promise that resolves when finished.
function typewriter(el, opts) {
    opts = opts || {};
    var speed = opts.speed || 75;
    var str = el.innerHTML;
    var progress = 0;
    el.innerHTML = '';

    return new Promise(function (resolve) {
        var timer = setInterval(function () {
            var current = str.substr(progress, 1);
            if (current === '<') {
                // skip whole tags so we never break markup mid-render
                progress = str.indexOf('>', progress) + 1;
            } else {
                progress++;
            }
            var caret = (progress & 1) ? '_' : ' ';
            el.innerHTML = str.substring(0, progress) +
                '<span class="typing-caret">' + caret + '</span>';
            if (progress >= str.length) {
                clearInterval(timer);
                el.innerHTML = str; // settle to clean final markup
                resolve();
            }
        }, speed);
    });
}

// ── Elapsed-time clock ──────────────────────────────────────
function timeElapse(date) {
    var current = new Date();
    var seconds = (current.getTime() - date.getTime()) / 1000;
    var days = Math.floor(seconds / (3600 * 24));
    seconds = seconds % (3600 * 24);
    var hours = Math.floor(seconds / 3600);
    if (hours < 10) { hours = "0" + hours; }
    seconds = seconds % 3600;
    var minutes = Math.floor(seconds / 60);
    if (minutes < 10) { minutes = "0" + minutes; }
    seconds = Math.floor(seconds % 60);
    if (seconds < 10) { seconds = "0" + seconds; }

    var result = "第 <span class=\"digit\">" + days + "</span> 天 " +
        "<span class=\"digit\">" + hours + "</span> 小时 " +
        "<span class=\"digit\">" + minutes + "</span> 分钟 " +
        "<span class=\"digit\">" + seconds + "</span> 秒";
    var clock = document.getElementById('clock');
    if (clock) { clock.innerHTML = result; }
}

// ── Responsive fit ──────────────────────────────────────────
// The canvas art is authored at a fixed 1100x680 logical size.
// On phones (<=720px) the stylesheet restacks the layout, so we
// leave the DOM untouched. On in-between widths we scale the whole
// #wrap down proportionally so nothing overflows or gets clipped.
function fitWrap() {
    var wrap = document.getElementById('wrap');
    var main = document.getElementById('main');
    if (!wrap || !main) { return; }

    var vw = document.documentElement.clientWidth;

    if (vw <= 720) {
        wrap.style.transform = '';
        wrap.style.transformOrigin = '';
        main.style.height = '';
        main.style.overflow = '';
        return;
    }

    var scale = Math.min(1, vw / 1120); // 1120 leaves a little breathing room
    wrap.style.transformOrigin = 'top center';
    wrap.style.transform = 'scale(' + scale + ')';
    // Collapse the empty space the un-transformed layout box would leave.
    main.style.height = Math.ceil(690 * scale) + 'px';
    main.style.overflow = 'hidden';
}

window.addEventListener('resize', fitWrap);
window.addEventListener('orientationchange', fitWrap);
window.addEventListener('DOMContentLoaded', fitWrap);
