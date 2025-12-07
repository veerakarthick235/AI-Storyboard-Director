document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const movieIdeaInput = document.getElementById('movieIdea');
    const blueprintOutput = document.getElementById('blueprintOutput');
    const loadingIndicator = document.getElementById('loading');
    
    const numScenesInput = document.getElementById('numScenes');
    const filmToneInput = document.getElementById('filmTone');
    const aspectRatioInput = document.getElementById('aspectRatio');

    // Add ripple effect to button
    generateBtn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        setTimeout(() => ripple.remove(), 600);
    });

    generateBtn.addEventListener('click', async () => {
        const idea = movieIdeaInput.value.trim();
        const num_scenes = numScenesInput.value;
        const film_tone = filmToneInput.value;
        const aspect_ratio = aspectRatioInput.value;

        if (!idea) {
            showNotification('Please enter a movie idea before generating.', 'error');
            movieIdeaInput.focus();
            return;
        }

        loadingIndicator.classList.remove('hidden');
        blueprintOutput.classList.add('hidden');
        blueprintOutput.innerHTML = ''; 
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.7';

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    idea: idea,
                    num_scenes: num_scenes,
                    film_tone: film_tone,
                    aspect_ratio: aspect_ratio
                })
            });

            const data = await response.json();

            if (response.ok) {
                renderBlueprint(data);
                blueprintOutput.classList.remove('hidden');
                // Smooth scroll to output
                blueprintOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
                showNotification('Blueprint generated successfully! 🎬', 'success');
            } else {
                showNotification(`Error: ${data.error || 'Failed to generate blueprint.'}`, 'error');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showNotification('An unexpected network error occurred.', 'error');
        } finally {
            loadingIndicator.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
        }
    });

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : '⚠️'}</span>
            <span class="notification-text">${message}</span>
        `;
        
        // Add notification styles dynamically
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.4);
            transform: scale(0);
            animation: rippleEffect 0.6s linear;
            pointer-events: none;
        }
        @keyframes rippleEffect {
            to { transform: scale(4); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    function renderBlueprint(data) {
        let htmlContent = `
            <h2>🎬 ${data.movie_title}</h2>
            <p><strong>📝 Logline:</strong> ${data.logline}</p>
            <h3>🎞️ Scene Breakdown (${data.blueprint.length} Scenes)</h3>
        `;

        data.blueprint.forEach((scene, index) => {
            const visualSearchQuery = encodeURIComponent(scene.image_tag);
            const visualSearchURL = `https://www.google.com/search?tbm=isch&q=${visualSearchQuery}`;
            
            // Add staggered animation delay
            const delay = index * 0.1;

            htmlContent += `
                <div class="scene-card" style="animation: fadeInUp 0.5s ease ${delay}s both;">
                    <h3>Scene ${scene.scene_number}</h3>
                    <p><strong>⏱️ Timeline:</strong> ${scene.timeline}</p>
                    <p><strong>📍 Setting:</strong> ${scene.setting}</p>
                    <p><strong>🎥 Detailed Scene:</strong> ${scene.detailed_scene}</p>
                    <p><strong>😊 Character Emotions:</strong> ${scene.character_emotions}</p>
                    <p><strong>📷 Camera Angle:</strong> ${scene.camera_angle}</p>
                    <p><strong>💬 Dialogue:</strong> <em>"${scene.dialogue}"</em></p>
                    <p><strong>🏷️ AI Visual Tag:</strong> ${scene.image_tag}</p>
                    <p class="visual-link-wrapper">
                        <a href="${visualSearchURL}" target="_blank" class="visual-link">
                           🖼️ View Storyboard Reference
                        </a>
                    </p>
                </div>
            `;
        });

        blueprintOutput.innerHTML = htmlContent;
    }
});
