// Landing Page JavaScript Functions

// Generate random family code
function generateFamilyCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Store family data in localStorage
function storeFamilyData(code, type, data) {
    const familyData = JSON.parse(localStorage.getItem('familyGroups') || '{}');
    if (!familyData[code]) {
        familyData[code] = {
            created: new Date().toISOString(),
            members: [],
            assessments: {}
        };
    }
    
    if (type === 'member') {
        familyData[code].members.push(data);
    } else if (type === 'assessment') {
        familyData[code].assessments[data.memberId] = data;
    }
    
    localStorage.setItem('familyGroups', JSON.stringify(familyData));
    return familyData[code];
}

// Get family data
function getFamilyData(code) {
    const familyData = JSON.parse(localStorage.getItem('familyGroups') || '{}');
    return familyData[code] || null;
}

// Start Student Assessment
function startStudentAssessment() {
    // Store assessment type
    localStorage.setItem('assessmentType', 'student');
    
    // Check if part of family group
    const familyCode = localStorage.getItem('currentFamilyCode');
    if (familyCode) {
        const memberId = 'student_' + Date.now();
        storeFamilyData(familyCode, 'member', {
            id: memberId,
            type: 'student',
            name: 'Student',
            joinedAt: new Date().toISOString()
        });
        localStorage.setItem('currentMemberId', memberId);
    }
    
    // Redirect to assessment
    window.location.href = 'assessment.html';
}

// Start Parent Assessment
function startParentAssessment() {
    // Store assessment type
    localStorage.setItem('assessmentType', 'parent');
    
    // Check if part of family group
    const familyCode = localStorage.getItem('currentFamilyCode');
    if (familyCode) {
        const memberId = 'parent_' + Date.now();
        storeFamilyData(familyCode, 'member', {
            id: memberId,
            type: 'parent',
            name: 'Parent',
            joinedAt: new Date().toISOString()
        });
        localStorage.setItem('currentMemberId', memberId);
    }
    
    // Redirect to parent guidance page
    window.location.href = 'parent.html';
}

// Create Family Group
function createFamilyGroup() {
    const familyCode = generateFamilyCode();
    
    // Store family group
    storeFamilyData(familyCode, 'member', {
        id: 'creator_' + Date.now(),
        type: 'creator',
        name: 'Family Creator',
        joinedAt: new Date().toISOString()
    });
    
    // Set current family code
    localStorage.setItem('currentFamilyCode', familyCode);
    
    // Show family code modal
    showFamilyCodeModal(familyCode);
}

// Join Family Group
function joinFamilyGroup() {
    const codeInput = document.getElementById('familyCode');
    const code = codeInput.value.trim().toUpperCase();
    
    if (!code) {
        alert('Please enter a family code');
        return;
    }
    
    const familyData = getFamilyData(code);
    if (!familyData) {
        alert('Invalid family code. Please check and try again.');
        return;
    }
    
    // Set current family code
    localStorage.setItem('currentFamilyCode', code);
    
    // Show success message and options
    showJoinSuccessModal(code, familyData);
}

// Show Family Code Modal
function showFamilyCodeModal(code) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Family Group Created!</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="family-code-display">
                    <h3>Your Family Code:</h3>
                    <div class="code-box">${code}</div>
                    <p>Share this code with your family members so they can join your group.</p>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="copyFamilyCode('${code}')">Copy Code</button>
                    <button class="btn-secondary" onclick="shareFamilyCode('${code}')">Share via WhatsApp</button>
                </div>
                <div class="next-steps">
                    <h4>What's Next?</h4>
                    <p>Choose how you want to start:</p>
                    <div class="next-actions">
                        <button class="btn-outline" onclick="startStudentAssessment()">Start as Student</button>
                        <button class="btn-outline" onclick="startParentAssessment()">Start as Parent</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles if not already added
    if (!document.getElementById('modal-styles')) {
        addModalStyles();
    }
}

// Show Join Success Modal
function showJoinSuccessModal(code, familyData) {
    const memberCount = familyData.members.length;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Successfully Joined Family Group!</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="family-info">
                    <h3>Family Code: ${code}</h3>
                    <p>Members in group: ${memberCount}</p>
                </div>
                <div class="join-options">
                    <h4>How would you like to participate?</h4>
                    <div class="join-actions">
                        <button class="btn-primary" onclick="startStudentAssessment()">Join as Student</button>
                        <button class="btn-secondary" onclick="startParentAssessment()">Join as Parent</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    if (!document.getElementById('modal-styles')) {
        addModalStyles();
    }
}

// Copy Family Code
function copyFamilyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        // Show temporary success message
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = 'var(--sih-success)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Family code copied to clipboard!');
    });
}

// Share Family Code via WhatsApp
function shareFamilyCode(code) {
    const message = `Join our family group on CareerCompass for collaborative career planning!\n\nFamily Code: ${code}\n\nVisit: ${window.location.origin}/landing.html`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Close Modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Add Modal Styles
function addModalStyles() {
    const styles = document.createElement('style');
    styles.id = 'modal-styles';
    styles.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        }
        
        .modal-content {
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .modal-header {
            padding: 24px 24px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h2 {
            margin: 0;
            color: var(--gray-900);
            font-size: 1.5rem;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--gray-500);
            padding: 4px;
        }
        
        .modal-close:hover {
            color: var(--gray-700);
        }
        
        .modal-body {
            padding: 24px;
        }
        
        .family-code-display, .family-info {
            text-align: center;
            margin-bottom: 32px;
        }
        
        .family-code-display h3, .family-info h3 {
            margin-bottom: 16px;
            color: var(--gray-800);
        }
        
        .code-box {
            background: var(--gradient-primary);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 2rem;
            font-weight: 700;
            letter-spacing: 4px;
            margin: 16px 0;
            font-family: 'Courier New', monospace;
        }
        
        .modal-actions, .join-actions, .next-actions {
            display: flex;
            gap: 12px;
            margin-top: 20px;
        }
        
        .next-steps {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid var(--gray-200);
        }
        
        .next-steps h4, .join-options h4 {
            margin-bottom: 16px;
            color: var(--gray-800);
        }
        
        .btn-primary, .btn-secondary, .btn-outline {
            flex: 1;
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
        }
        
        .btn-primary {
            background: var(--gradient-primary);
            color: white;
        }
        
        .btn-secondary {
            background: var(--gradient-secondary);
            color: white;
        }
        
        .btn-outline {
            background: white;
            color: var(--sih-primary);
            border: 2px solid var(--sih-primary);
        }
        
        .btn-primary:hover, .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .btn-outline:hover {
            background: var(--sih-primary);
            color: white;
        }
        
        @media (max-width: 480px) {
            .modal-actions, .join-actions, .next-actions {
                flex-direction: column;
            }
            
            .code-box {
                font-size: 1.5rem;
                letter-spacing: 2px;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is part of a family group
    const familyCode = localStorage.getItem('currentFamilyCode');
    if (familyCode) {
        // Show family code indicator
        showFamilyIndicator(familyCode);
    }
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Show family indicator
function showFamilyIndicator(code) {
    const indicator = document.createElement('div');
    indicator.className = 'family-indicator';
    indicator.innerHTML = `
        <div class="family-indicator-content">
            <span class="family-icon">👨‍👩‍👧‍👦</span>
            <span class="family-text">Family Group: ${code}</span>
            <button class="family-leave" onclick="leaveFamilyGroup()" title="Leave Family Group">&times;</button>
        </div>
    `;
    
    // Add styles for family indicator
    if (!document.getElementById('family-indicator-styles')) {
        const styles = document.createElement('style');
        styles.id = 'family-indicator-styles';
        styles.textContent = `
            .family-indicator {
                position: fixed;
                top: 80px;
                right: 20px;
                background: var(--gradient-success);
                color: white;
                padding: 12px 16px;
                border-radius: 25px;
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                animation: slideInRight 0.3s ease;
            }
            
            .family-indicator-content {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                font-size: 0.875rem;
            }
            
            .family-leave {
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                padding: 0 4px;
                margin-left: 4px;
            }
            
            .family-leave:hover {
                opacity: 0.7;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .family-indicator {
                    top: 70px;
                    right: 10px;
                    padding: 8px 12px;
                }
                
                .family-indicator-content {
                    font-size: 0.75rem;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(indicator);
}

// Leave family group
function leaveFamilyGroup() {
    if (confirm('Are you sure you want to leave this family group?')) {
        localStorage.removeItem('currentFamilyCode');
        localStorage.removeItem('currentMemberId');
        
        const indicator = document.querySelector('.family-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        alert('You have left the family group.');
    }
}

// Handle Enter key in family code input
document.addEventListener('DOMContentLoaded', function() {
    const familyCodeInput = document.getElementById('familyCode');
    if (familyCodeInput) {
        familyCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                joinFamilyGroup();
            }
        });
    }
});

// Mental Health Exercise Functions
let breathTimer = null;
let breathCount = 0;
let breathPhase = 'inhale'; // 'inhale' or 'exhale'
let meditationTimer = null;
let meditationTimeLeft = 0;

// Affirmations array
const affirmations = [
    "I am capable of achieving my dreams and goals.",
    "Every challenge I face makes me stronger and wiser.",
    "I trust in my ability to make the right decisions for my future.",
    "I am worthy of success and happiness in my career.",
    "My unique talents and skills will lead me to the perfect path.",
    "I embrace change and new opportunities with confidence.",
    "I am resilient and can overcome any obstacle.",
    "My hard work and dedication will pay off.",
    "I believe in myself and my potential.",
    "I am creating a bright and successful future for myself.",
    "Every step I take brings me closer to my goals.",
    "I have the power to shape my own destiny.",
    "I am grateful for the opportunities that come my way.",
    "I choose to focus on possibilities, not limitations.",
    "My positive attitude attracts success and good fortune."
];

let currentAffirmationIndex = 0;

// Show exercise function
function showExercise(exerciseType) {
    // Hide all exercise contents
    document.querySelectorAll('.exercise-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected exercise
    document.getElementById(exerciseType + '-exercise').classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Stop any running timers when switching exercises
    stopBreathTimer();
    stopMeditation();
}

// Breathing Exercise Functions
function startBreathTimer() {
    if (breathTimer) return; // Already running
    
    const circle = document.getElementById('breathCircle');
    const text = document.getElementById('breathText');
    const counter = document.getElementById('breathCount');
    
    breathCount = 0;
    breathPhase = 'inhale';
    
    function breathCycle() {
        if (breathPhase === 'inhale') {
            circle.classList.remove('exhale');
            circle.classList.add('inhale');
            text.textContent = 'Inhale';
            breathPhase = 'exhale';
        } else {
            circle.classList.remove('inhale');
            circle.classList.add('exhale');
            text.textContent = 'Exhale';
            breathPhase = 'inhale';
            breathCount++;
            counter.textContent = breathCount;
        }
    }
    
    // Start immediately
    breathCycle();
    
    // Continue every 4 seconds (4s inhale + 4s exhale cycle)
    breathTimer = setInterval(breathCycle, 4000);
}

function stopBreathTimer() {
    if (breathTimer) {
        clearInterval(breathTimer);
        breathTimer = null;
        
        const circle = document.getElementById('breathCircle');
        const text = document.getElementById('breathText');
        
        circle.classList.remove('inhale', 'exhale');
        text.textContent = 'Breathe';
    }
}

// Meditation Functions
function startMeditation(minutes) {
    if (meditationTimer) stopMeditation();
    
    // Highlight selected duration button
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    meditationTimeLeft = minutes * 60; // Convert to seconds
    updateMeditationDisplay();
    
    document.getElementById('meditationStatus').textContent = 'Meditation in progress...';
    
    meditationTimer = setInterval(() => {
        meditationTimeLeft--;
        updateMeditationDisplay();
        
        if (meditationTimeLeft <= 0) {
            stopMeditation();
            document.getElementById('meditationStatus').textContent = 'Meditation complete! Well done.';
            
            // Optional: Play a gentle notification sound or show completion message
            setTimeout(() => {
                document.getElementById('meditationStatus').textContent = 'Ready to begin';
            }, 3000);
        }
    }, 1000);
}

function stopMeditation() {
    if (meditationTimer) {
        clearInterval(meditationTimer);
        meditationTimer = null;
        document.getElementById('meditationStatus').textContent = 'Ready to begin';
        
        // Remove active class from duration buttons
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }
}

function updateMeditationDisplay() {
    const minutes = Math.floor(meditationTimeLeft / 60);
    const seconds = meditationTimeLeft % 60;
    const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('meditationTime').textContent = timeDisplay;
}

// Affirmations Functions
function nextAffirmation() {
    currentAffirmationIndex = (currentAffirmationIndex + 1) % affirmations.length;
    const affirmationText = document.getElementById('affirmationText');
    
    // Add fade effect
    affirmationText.style.opacity = '0';
    
    setTimeout(() => {
        affirmationText.textContent = affirmations[currentAffirmationIndex];
        affirmationText.style.opacity = '1';
    }, 200);
}
