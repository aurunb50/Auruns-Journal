document.addEventListener('DOMContentLoaded', () => {
    const bubble = document.querySelector('.bubble');
    const instructionText = document.getElementById('instructionText');
    const timerText = document.getElementById('timerText');
    const cyclesInput = document.getElementById('cycles');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const cyclesRemainingText = document.getElementById('cyclesRemainingText');
    const voiceSelect = document.getElementById('voiceSelect');
    
    let voices = [];
    let phaseTimeoutId, countdownIntervalId;
    let isRunning = false, currentCycle = 0, totalCycles = 0;

    const DURATION = { INHALE: 4, HOLD: 7, EXHALE: 8, PREPARE: 2 };

    function populateVoiceList() {
        voices = window.speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';
        voices.filter(v => v.lang.startsWith('en')).forEach((voice) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-name', voice.name);
            voiceSelect.appendChild(option);
        });
    }

    function speak(text) {
        if (!'speechSynthesis' in window) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoiceName = voiceSelect.selectedOptions[0].getAttribute('data-name');
        utterance.voice = voices.find(v => v.name === selectedVoiceName);
        window.speechSynthesis.speak(utterance);
    }

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
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

    function runPhase(name, duration, nextPhaseFn, bubbleClass, audioCue) {
        if (!isRunning) return;
        instructionText.textContent = name;
        speak(audioCue);
        bubble.className = 'bubble ' + bubbleClass;
        updateTimer(duration);
        clearTimeout(phaseTimeoutId);
        phaseTimeoutId = setTimeout(nextPhaseFn, duration * 1000);
    }

    const inhale = () => runPhase('Inhale...', DURATION.INHALE, hold, 'inhale', 'Inhale');
    const hold = () => runPhase('Hold...', DURATION.HOLD, exhale, 'hold', 'Hold');
    const exhale = () => runPhase('Exhale...', DURATION.EXHALE, () => {
        currentCycle++;
        currentCycle < totalCycles ? prepareNextCycle() : finishExercise();
    }, 'exhale', 'Exhale');
    const prepareNextCycle = () => {
        updateCyclesRemaining();
        runPhase('Prepare...', DURATION.PREPARE, inhale, '', '');
    };
    
    function startExercise() {
        isRunning = true;
        totalCycles = parseInt(cyclesInput.value, 10);
        currentCycle = 0;
        startButton.disabled = true; stopButton.disabled = false; cyclesInput.disabled = true; voiceSelect.disabled = true;
        updateCyclesRemaining();
        runPhase('Get Ready...', DURATION.PREPARE, inhale, '', 'Get ready');
    }
    
    function stopExercise(isFinished = false) {
        isRunning = false;
        clearTimeout(phaseTimeoutId);
        clearInterval(countdownIntervalId);
        window.speechSynthesis.cancel();
        bubble.className = 'bubble';
        startButton.disabled = false; stopButton.disabled = true; cyclesInput.disabled = false; voiceSelect.disabled = false;
        
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