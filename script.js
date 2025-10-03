   document.addEventListener('DOMContentLoaded', () => {
            const cursorGlow = document.getElementById('cursor-glow');
            window.addEventListener('mousemove', e => {
                cursorGlow.style.left = `${e.clientX}px`;
                cursorGlow.style.top = `${e.clientY}px`;
            });

            const volumeSlider = document.getElementById('volume-slider');
            const allAudio = document.querySelectorAll('audio');

            function updateSliderVisual(slider) {
                const progress = (slider.value / slider.max) * 100;
                slider.style.setProperty('--slider-progress', `${progress}%`);
            }

            function setVolume(level) {
                allAudio.forEach(audio => audio.volume = level);
                localStorage.setItem('drumVolume', level);
            }

            const savedVolume = localStorage.getItem('drumVolume') || 0.8;
            volumeSlider.value = savedVolume;
            setVolume(savedVolume);
            updateSliderVisual(volumeSlider);

            volumeSlider.addEventListener('input', (e) => {
                setVolume(e.target.value);
                updateSliderVisual(e.target);
            });

            // --- THEME SWITCHER LOGIC ---
            const themeSwitcher = document.getElementById('theme-switcher');
            const lightIcon = document.getElementById('theme-icon-light');
            const darkIcon = document.getElementById('theme-icon-dark');
            const systemIcon = document.getElementById('theme-icon-system');
            const html = document.documentElement;

            const themes = ['light', 'dark', 'system'];
            let currentThemeIndex = localStorage.getItem('themeIndex') ? parseInt(localStorage.getItem('themeIndex')) : 2;

            function applyTheme(theme) {
                if (theme === 'system') {
                    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    html.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
                } else {
                    html.setAttribute('data-theme', theme);
                }
                lightIcon.classList.toggle('d-none', theme !== 'light');
                darkIcon.classList.toggle('d-none', theme !== 'dark');
                systemIcon.classList.toggle('d-none', theme !== 'system');
            }

            applyTheme(themes[currentThemeIndex]);

            themeSwitcher.addEventListener('click', () => {
                currentThemeIndex = (currentThemeIndex + 1) % themes.length;
                const newTheme = themes[currentThemeIndex];
                localStorage.setItem('themeIndex', currentThemeIndex);
                applyTheme(newTheme);
            });

            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (themes[currentThemeIndex] === 'system') {
                    applyTheme('system');
                }
            });

            // --- DRUM KIT LOGIC ---
            function playSound(key) {
                const audio = document.querySelector(`audio[data-key="${key}"]`);
                const drum = document.querySelector(`.drum[data-key="${key}"]`);
                if (!audio) return;
                
                if (navigator.vibrate) navigator.vibrate(50);

                drum.classList.add('playing');
                audio.currentTime = 0;
                audio.play();
            }

            function removeTransition(e) {
                if (e.propertyName !== 'transform') return;
                this.classList.remove('playing');
            }

            const drums = document.querySelectorAll('.drum');
            drums.forEach(drum => {
                drum.addEventListener('transitionend', removeTransition);
                drum.addEventListener('click', () => playSound(drum.dataset.key));
                drum.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    playSound(drum.dataset.key)
                });
            });

            window.addEventListener('keydown', e => {
                const key = e.key === ' ' ? ' ' : e.key.toLowerCase();
                const targetDrum = document.querySelector(`.drum[data-key="${key}"]`);
                if (targetDrum) {
                    if (e.repeat) return;
                    playSound(key);
                }
            });
        });

        // --- PWA SERVICE WORKER REGISTRATION ---
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js')
                    .then(registration => console.log('ServiceWorker registration successful'))
                    .catch(error => console.log('ServiceWorker registration failed: ', error));
            });
        }