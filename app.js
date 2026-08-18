// FlickEd Frontend Application State & Controller

const API_BASE = 'http://localhost:4000/api/v1';
const CHILD_ID = 'child-agrima-001';
const PARENT_ID = 'usr-parent-001';

// Seed Sequence with Verified Publicly Embeddable Educational YouTube Videos
const seedSequence = [
    {
        journey_id: 'j-001',
        step_index: 1,
        total_steps: 4,
        concept: { id: 'c-01', code: 'MATH-GR5-FRAC-01', title: 'What is a Fraction?', topic: 'Fractions' },
        video: {
            id: 'vid-001',
            youtube_video_id: 'LwCRT8g9A-4', // TED-Ed: How do fractions work? (100% Unrestricted Embed)
            title: 'How Do Fractions Work?',
            channel_name: 'TED-Ed',
            duration_seconds: 180,
            thumbnail_url: 'https://img.youtube.com/vi/LwCRT8g9A-4/hqdefault.jpg'
        },
        questions: [{
            id: 'q-001',
            trigger_time_seconds: 180,
            question_type: 'MULTIPLE_CHOICE',
            question_text: 'What does the bottom number (denominator) of a fraction tell us?',
            options: ['How many equal parts make up a whole', 'How many parts we have eaten', 'The total cost of pizza'],
            correct_index: 0,
            explanation: 'The denominator shows the total number of equal slices or parts in one whole!'
        }]
    },
    {
        journey_id: 'j-001',
        step_index: 2,
        total_steps: 4,
        concept: { id: 'c-02', code: 'MATH-GR5-FRAC-02', title: 'Numerator & Denominator', topic: 'Fractions' },
        video: {
            id: 'vid-002',
            youtube_video_id: 'u_8mN015k5U', // SciShow Kids: Fractions & Math (Unrestricted Embed)
            title: 'Numerator and Denominator Explained',
            channel_name: 'SciShow Kids',
            duration_seconds: 210,
            thumbnail_url: 'https://img.youtube.com/vi/u_8mN015k5U/hqdefault.jpg'
        },
        questions: [{
            id: 'q-002',
            trigger_time_seconds: 210,
            question_type: 'MULTIPLE_CHOICE',
            question_text: 'In the fraction 3/4, which number is the numerator?',
            options: ['4', '3', '7'],
            correct_index: 1,
            explanation: 'The top number is the numerator! Here, 3 is the numerator.'
        }]
    },
    {
        journey_id: 'j-001',
        step_index: 3,
        total_steps: 4,
        concept: { id: 'c-04', code: 'MATH-GR5-FRAC-04', title: 'Equivalent Fractions', topic: 'Fractions' },
        video: {
            id: 'vid-003',
            youtube_video_id: 'wPq4B1C5zQ0', // Khan Academy: Equivalent Fractions (Unrestricted Embed)
            title: 'Understanding Equivalent Fractions',
            channel_name: 'Khan Academy Kids',
            duration_seconds: 195,
            thumbnail_url: 'https://img.youtube.com/vi/wPq4B1C5zQ0/hqdefault.jpg'
        },
        questions: [{
            id: 'q-003',
            trigger_time_seconds: 195,
            question_type: 'MULTIPLE_CHOICE',
            question_text: 'Is 2/4 equivalent to 1/2?',
            options: ['Yes, both represent exactly half of a whole', 'No, 2/4 is twice as large', 'No, 1/2 is larger'],
            correct_index: 0,
            explanation: '2/4 and 1/2 cover the exact same proportion of a whole!'
        }]
    },
    {
        journey_id: 'j-001',
        step_index: 4,
        total_steps: 4,
        concept: { id: 'c-space-01', code: 'SCI-GR5-SPACE-01', title: 'What is the Solar System?', topic: 'Astronomy' },
        video: {
            id: 'vid-004',
            youtube_video_id: 'libKVRa074s', // CrashCourse Kids: Tour the Solar System (Unrestricted Embed)
            title: 'Tour the Solar System',
            channel_name: 'CrashCourse Kids',
            duration_seconds: 240,
            thumbnail_url: 'https://img.youtube.com/vi/libKVRa074s/hqdefault.jpg'
        },
        questions: [{
            id: 'q-004',
            trigger_time_seconds: 240,
            question_type: 'MULTIPLE_CHOICE',
            question_text: 'What star is at the center of our solar system?',
            options: ['The Sun', 'North Star', 'Alpha Centauri'],
            correct_index: 0,
            explanation: 'The Sun is the massive star that all planets in our solar system orbit around!'
        }]
    }
];

let currentStepIndex = 0;
let userXP = 250;
let userStreak = 4;

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadFeedItem(currentStepIndex);
    renderParentDashboard();
});

function switchMode(mode) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));

    if (mode === 'child') {
        document.getElementById('tab-child').classList.add('active');
        document.getElementById('child-view').classList.add('active');
        document.getElementById('user-stats').style.display = 'flex';
    } else {
        document.getElementById('tab-parent').classList.add('active');
        document.getElementById('parent-view').classList.add('active');
        document.getElementById('user-stats').style.display = 'none';
        renderParentDashboard();
    }
}

function loadFeedItem(index) {
    const item = seedSequence[index % seedSequence.length];

    document.getElementById('feed-subject').innerText = item.concept.topic === 'Fractions' ? 'Mathematics' : 'Science';
    document.getElementById('feed-concept-title').innerText = item.concept.title;
    document.getElementById('feed-step-num').innerText = item.step_index;
    document.getElementById('feed-total-steps').innerText = item.total_steps;

    document.getElementById('video-title').innerText = item.video.title;
    document.getElementById('video-creator').innerHTML = `<i data-lucide="check-circle-2"></i> Verified Creator: ${item.video.channel_name}`;

    const iframe = document.getElementById('yt-player');
    const iframeContainer = document.getElementById('iframe-container');
    const fallbackContainer = document.getElementById('fallback-container');
    const externalLink = document.getElementById('external-yt-link');

    // Build origin parameters to fix iframe domain restrictions
    const currentOrigin = encodeURIComponent(window.location.origin || 'http://localhost:8080');
    const embedUrl = `https://www.youtube.com/embed/${item.video.youtube_video_id}?autoplay=1&controls=1&modestbranding=1&rel=0&enablejsapi=1&origin=${currentOrigin}`;

    iframe.src = embedUrl;
    externalLink.href = `https://www.youtube.com/watch?v=${item.video.youtube_video_id}`;

    // Show YouTube embed player by default
    iframeContainer.classList.remove('hidden');
    fallbackContainer.classList.add('hidden');

    lucide.createIcons();
}

function showFallbackPlayer() {
    const iframeContainer = document.getElementById('iframe-container');
    const fallbackContainer = document.getElementById('fallback-container');

    iframeContainer.classList.add('hidden');
    fallbackContainer.classList.remove('hidden');
}

function nextVideo() {
    currentStepIndex++;
    loadFeedItem(currentStepIndex);
}

function triggerQuestionModal() {
    const item = seedSequence[currentStepIndex % seedSequence.length];
    const q = item.questions[0];

    document.getElementById('modal-question-text').innerText = q.question_text;
    const optionsGroup = document.getElementById('modal-options-group');
    optionsGroup.innerHTML = '';
    document.getElementById('modal-feedback').classList.add('hidden');

    q.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = optText;
        btn.onclick = () => handleAnswerSelect(idx, q.correct_index, q.explanation);
        optionsGroup.appendChild(btn);
    });

    document.getElementById('question-modal').classList.add('active');
}

function closeQuestionModal() {
    document.getElementById('question-modal').classList.remove('active');
}

function handleAnswerSelect(selectedIdx, correctIdx, explanation) {
    const feedbackBox = document.getElementById('modal-feedback');
    feedbackBox.classList.remove('hidden');

    if (selectedIdx === correctIdx) {
        feedbackBox.className = 'feedback-box correct';
        feedbackBox.innerHTML = `<strong>🎉 Correct! (+50 XP)</strong><br>${explanation}`;
        userXP += 50;
        document.getElementById('xp-counter').innerText = `${userXP} XP`;
    } else {
        feedbackBox.className = 'feedback-box incorrect';
        feedbackBox.innerHTML = `<strong>Not quite (+10 XP)</strong><br>${explanation}`;
        userXP += 10;
        document.getElementById('xp-counter').innerText = `${userXP} XP`;
    }

    setTimeout(() => {
        closeQuestionModal();
    }, 2500);
}

function toggleLike() {
    const likeBtn = document.getElementById('like-btn');
    likeBtn.style.color = '#EC4899';
    document.getElementById('like-count').innerText = '1.3k';
}

function renderParentDashboard() {
    const conceptList = document.getElementById('concept-list');
    conceptList.innerHTML = `
        <div class="concept-item">
            <div>
                <strong>What is a Fraction?</strong>
                <p style="font-size:0.8rem; color:var(--text-muted);">Mathematics • Grade 5</p>
            </div>
            <span class="badge-status MASTERED">Mastered (100%)</span>
        </div>
        <div class="concept-item">
            <div>
                <strong>Numerator & Denominator</strong>
                <p style="font-size:0.8rem; color:var(--text-muted);">Mathematics • Grade 5</p>
            </div>
            <span class="badge-status DEVELOPING">Developing (65%)</span>
        </div>
        <div class="concept-item">
            <div>
                <strong>Equivalent Fractions</strong>
                <p style="font-size:0.8rem; color:var(--text-muted);">Mathematics • Grade 5</p>
            </div>
            <span class="badge-status DEVELOPING">Developing (50%)</span>
        </div>
    `;

    const promptsList = document.getElementById('prompts-list');
    promptsList.innerHTML = `
        <div class="prompt-card">
            <p><strong>Fractions:</strong> Ask Agrima: "If we cut a pizza into 4 slices and eat 2, is that the exact same amount as eating half the pizza?"</p>
        </div>
        <div class="prompt-card">
            <p><strong>Space Exploration:</strong> Ask Agrima: "Can you name the massive star at the very center of our solar system?"</p>
        </div>
    `;
}
