document.addEventListener('DOMContentLoaded', () => {
    const bubble = document.querySelector('.bubble');
    const instructionText = document.getElementById('instructionText');
    const timerText = document.getElementById('timerText');
    const cyclesInput = document.getElementById('cycles');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const cyclesRemainingText = document.getElementById('cyclesRemainingText');
    
    // --- NEW: Audio Cues ---
    // These files must exist in an 'audio' folder with these exact names.
    const audioCues = {
        getReady: new Audio('audio/get_ready.mp3'),
        inhale: new Audio('audio/inhale.mp3'),
        hold: new Audio('audio/hold.mp3'),
        exhale: new Audio('audio/exhale.mp3')
    };

    let phaseTimeoutId, countdownIntervalId;
    let isRunning = false, currentCycle = 0, totalCycles = 0;

    const DURATION = { INHALE: 4, HOLD: 7, EXHALE: 8, PREPARE: 2 };

    // --- NEW: Function to play pre-recorded audio files ---
    function playAudio(cue) {
        if (audioCues[cue]) {
            // Stop any other audio that might be playing to prevent overlap
            Object.values(audioCues).forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            audioCues[cue].play().catch(e => console.error("Error playing audio:", e));
        }
    }

    function updateTimer(seconds) {
        timerText.textContent = seconds;
        clearInterval(countdownIntervalId);
        countdownIntervalId = setInterval(() => {
            seconds--;
            timerText.textContent = seconds >= 0 ? seconds : '';
            if (seconds < 0) clearInterval(countdownIntervalId);
        }, 1000);
    }

    // --- UPDATED: runPhase now takes an audio cue key ---
    function runPhase(name, duration, nextPhaseFn, bubbleClass, audioCue) {
        if (!isRunning) return;
        instructionText.textContent = name;
        if (audioCue) {
            playAudio(audioCue); // Replaced speak() with playAudio()
        }
        bubble.className = 'bubble ' + bubbleClass;
        updateTimer(duration);
        clearTimeout(phaseTimeoutId);
        phaseTimeoutId = setTimeout(nextPhaseFn, duration * 1000);
    }

    // --- UPDATED: Phase functions now pass the key for the audio file ---
    const inhale = () => runPhase('Inhale...', DURATION.INHALE, hold, 'inhale', 'inhale');
    const hold = () => runPhase('Hold...', DURATION.HOLD, exhale, 'hold', 'hold');
    const exhale = () => runPhase('Exhale...', DURATION.EXHALE, () => {
        currentCycle++;
        currentCycle < totalCycles ? prepareNextCycle() : finishExercise();
    }, 'exhale', 'exhale');
    const prepareNextCycle = () => {
        updateCyclesRemaining();
        runPhase('Prepare...', DURATION.PREPARE, inhale, '', null); // No sound for "Prepare"
    };
    
    function startExercise() {
        isRunning = true;
        totalCycles = parseInt(cyclesInput.value, 10);
        currentCycle = 0;
        startButton.disabled = true; stopButton.disabled = false; cyclesInput.disabled = true;
        updateCyclesRemaining();
        // --- UPDATED: Pass 'getReady' as the audio cue ---
        runPhase('Get Ready...', DURATION.PREPARE, inhale, '', 'getReady');
    }
    
    // --- UPDATED: stopExercise now stops audio files ---
    function stopExercise(isFinished = false) {
        isRunning = false;
        clearTimeout(phaseTimeoutId);
        clearInterval(countdownIntervalId);
        
        // Stop any playing audio
        Object.values(audioCues).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });

        bubble.className = 'bubble';
        startButton.disabled = false; stopButton.disabled = true; cyclesInput.disabled = false;
        
        if (isFinished) {
            instructionText.textContent = 'Well Done! Exercise Complete.';
            timerText.textContent = '🎉';
            cyclesRemainingText.textContent = `Completed ${totalCycles} cycles.`;
        } else {
            instructionText.textContent = 'Stopped. Press Start to Begin';
            timerText.textContent = '';
            cyclesRemainingText.textContent = '';
        }
    }
    
    const finishExercise = () => stopExercise(true);
    const updateCyclesRemaining = () => cyclesRemainingText.textContent = `Cycle ${currentCycle + 1} of ${totalCycles}`;

    startButton.addEventListener('click', startExercise);
    stopButton.addEventListener('click', () => stopExercise(false));
});
