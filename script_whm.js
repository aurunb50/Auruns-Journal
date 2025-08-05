document.addEventListener('DOMContentLoaded', () => {
    const bubble = document.querySelector('.bubble-whm');
    const instructionText = document.getElementById('instructionTextWimHof');
    const breathCountText = document.getElementById('breathCountTextWimHof');
    const timerText = document.getElementById('timerTextWimHof');
    const roundText = document.getElementById('roundTextWimHof');

    const powerBreathsInput = document.getElementById('powerBreaths');
    const roundsInput = document.getElementById('rounds');
    const startButton = document.getElementById('startButtonWimHof');
    const stopButton = document.getElementById('stopButtonWimHof');
    const endRetentionButton = document.getElementById('endRetentionButton');
    const voiceSelect = document.getElementById('voiceSelectWhm'); // New voice dropdown

    const POWER_BREATH_INHALE_DURATION = 750;
    const POWER_BREATH_EXHALE_DURATION = 750;
    const RETENTION_PREP_DURATION = 1000;
    const RECOVERY_INHALE_DURATION = 1000;
    const RECOVERY_HOLD_DURATION = 15;

    let currentRound = 0;
    let totalRounds = 0;
    let currentPowerBreath = 0;
    let totalPowerBreaths = 0;

    let phaseTimeoutId = null;
    let retentionTimerIntervalId = null;
    let retentionSeconds = 0;
    let isRunning = false;
    let currentPhase = '';
    let voices = []; // To store available voices

    // --- NEW: Populate Voice List ---
    function populateVoiceList() {
        voices = window.speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';
        voices.forEach((voice, i) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            voiceSelect.appendChild(option);
        });
    }

    // --- UPDATED: Speech Synthesis Function ---
    function speak(text, rate = 1.0) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        
        // Get the selected voice
        const selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
        const selectedVoice = voices.find(voice => voice.name === selectedOption);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
    
    // Initial population and event listener
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }


    function setBubbleState(state) {
        bubble.className = 'bubble-whm ' + state;
    }

    function updateUIForStart() {
        startButton.disabled = true;
        stopButton.disabled = false;
        powerBreathsInput.disabled = true;
        roundsInput.disabled = true;
        voiceSelect.disabled = true; // Disable during exercise
        endRetentionButton.style.display = 'none';
        breathCountText.textContent = '';
        timerText.textContent = '';
    }

    function updateUIForStop() {
        isRunning = false;
        window.speechSynthesis.cancel();
        startButton.disabled = false;
        stopButton.disabled = true;
        powerBreathsInput.disabled = false;
        roundsInput.disabled = false;
        voiceSelect.disabled = false; // Re-enable
        endRetentionButton.style.display = 'none';
        instructionText.textContent = 'Press Start to Begin';
        breathCountText.textContent = '';
        timerText.textContent = '';
        roundText.textContent = '';
        setBubbleState('');
        clearTimeout(phaseTimeoutId);
        clearInterval(retentionTimerIntervalId);
    }
    
    function startExercise() {
        if (isRunning) return;
        isRunning = true;
        currentPhase = 'STARTING';

        totalPowerBreaths = parseInt(powerBreathsInput.value, 10);
        totalRounds = parseInt(roundsInput.value, 10);
        currentRound = 0;

        updateUIForStart();
        startNewRound();
    }

    function stopExercise() {
        updateUIForStop();
    }

    function startNewRound() {
        if (!isRunning) return;
        currentRound++;
        if (currentRound > totalRounds) {
            finishExercise();
            return;
        }
        currentPhase = 'PREPARING_ROUND';
        roundText.textContent = `Round ${currentRound} of ${totalRounds}`;
        const readyText = 'Get Ready for Round ' + currentRound;
        instructionText.textContent = readyText;
        speak(readyText);

        setBubbleState('');
        currentPowerBreath = 0;

        phaseTimeoutId = setTimeout(doPowerBreathInhale, 2500);
    }

    function doPowerBreathInhale() {
        if (!isRunning) return;
        currentPhase = 'POWER_BREATHING_INHALE';
        currentPowerBreath++;

        if (currentPowerBreath > totalPowerBreaths) {
            startRetentionPrep();
            return;
        }

        instructionText.textContent = 'Breathe In Fully';
        if (currentPowerBreath % 5 === 1) speak('Breathe In');
        breathCountText.textContent = `Breath: ${currentPowerBreath}/${totalPowerBreaths}`;
        timerText.textContent = '';
        setBubbleState('power-inhale');
        phaseTimeoutId = setTimeout(doPowerBreathExhale, POWER_BREATH_INHALE_DURATION);
    }

    function doPowerBreathExhale() {
        if (!isRunning) return;
        currentPhase = 'POWER_BREATHING_EXHALE';
        instructionText.textContent = 'Let Go (Exhale)';
        if (currentPowerBreath % 5 === 1) speak('Let Go');
        setBubbleState('power-exhale');
        if (currentPowerBreath === totalPowerBreaths) {
            phaseTimeoutId = setTimeout(startRetentionPrep, POWER_BREATH_EXHALE_DURATION + 500);
        } else {
            phaseTimeoutId = setTimeout(doPowerBreathInhale, POWER_BREATH_EXHALE_DURATION);
        }
    }
    
    function startRetentionPrep() {
        if (!isRunning) return;
        currentPhase = 'RETENTION_PREP';
        const prepText = 'Last Exhale... Now Hold';
        instructionText.textContent = prepText;
        speak(prepText);
        breathCountText.textContent = '';
        setBubbleState('retention-prep');
        phaseTimeoutId = setTimeout(startRetentionHold, RETENTION_PREP_DURATION);
    }

    function startRetentionHold() {
        if (!isRunning) return;
        currentPhase = 'RETENTION_HOLD';
        const holdText = 'Hold Your Breath';
        instructionText.textContent = holdText;
        speak(holdText);
        setBubbleState('retention-hold');
        endRetentionButton.style.display = 'block';
        endRetentionButton.disabled = false;
        retentionSeconds = 0;
        timerText.textContent = formatTime(retentionSeconds);
        if (retentionTimerIntervalId) clearInterval(retentionTimerIntervalId);
        retentionTimerIntervalId = setInterval(() => {
            retentionSeconds++;
            timerText.textContent = formatTime(retentionSeconds);
        }, 1000);
    }

    function endRetentionAndStartRecovery() {
        if (!isRunning || currentPhase !== 'RETENTION_HOLD') return;
        
        clearInterval(retentionTimerIntervalId);
        endRetentionButton.style.display = 'none';
        currentPhase = 'RECOVERY_INHALE';

        const recoveryText = 'Recovery Breath: Inhale Deeply';
        instructionText.textContent = recoveryText;
        speak(recoveryText);
        setBubbleState('recovery-inhale');
        timerText.textContent = '';

        phaseTimeoutId = setTimeout(startRecoveryHold, RECOVERY_INHALE_DURATION);
    }

    function startRecoveryHold() {
        if (!isRunning) return;
        currentPhase = 'RECOVERY_HOLD';
        const holdText = `Hold... ${RECOVERY_HOLD_DURATION} seconds`;
        instructionText.textContent = holdText;
        speak(holdText);
        setBubbleState('recovery-hold');

        let recoveryCountdown = RECOVERY_HOLD_DURATION;
        timerText.textContent = recoveryCountdown;
        
        if (retentionTimerIntervalId) clearInterval(retentionTimerIntervalId);
        retentionTimerIntervalId = setInterval(() => {
            recoveryCountdown--;
            if (recoveryCountdown >= 0) {
                timerText.textContent = recoveryCountdown;
            } else {
                clearInterval(retentionTimerIntervalId);
                finishRound();
            }
        }, 1000);
    }
    
    function finishRound() {
        if (!isRunning) return;
        currentPhase = 'ROUND_COMPLETE';
        const completeText = `Round ${currentRound} Complete!`;
        instructionText.textContent = completeText;
        speak(completeText);
        timerText.textContent = '🧘';
        setBubbleState('');

        if (currentRound < totalRounds) {
            phaseTimeoutId = setTimeout(startNewRound, 3000);
        } else {
            finishExercise();
        }
    }

    function finishExercise() {
        isRunning = false;
        const finishText = 'Well Done! Exercise Complete.';
        instructionText.textContent = finishText;
        speak(finishText);
        timerText.textContent = '🎉';
        roundText.textContent = `Completed ${totalRounds} rounds.`;
        updateUIForStop();
    }

    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    startButton.addEventListener('click', startExercise);
    stopButton.addEventListener('click', stopExercise);
    endRetentionButton.addEventListener('click', endRetentionAndStartRecovery);
});