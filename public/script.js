const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const platformSelect = document.getElementById('platformSelect');
const platformInfo = document.getElementById('platformInfo');
const previewContainer = document.getElementById('previewContainer');
const originalPreview = document.getElementById('originalPreview');
const resizedPreview = document.getElementById('resizedPreview');
const downloadBtn = document.getElementById('downloadBtn');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

platformSelect.addEventListener('change', () => {
    const platform = platformSelect.value;
    if (platform) {
        if (fileInput.files[0]) {
            resizeImage(fileInput.files[0], platform);
        }
    } else {
        platformInfo.textContent = '';
    }
});

function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        previewContainer.style.display = 'block';
        if (platformSelect.value) {
            resizeImage(file, platformSelect.value);
        }
    };
    reader.readAsDataURL(file);
}

async function resizeImage(file, platform) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('platform', platform);

    try {
        const response = await fetch('/api/resize', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Resize failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        resizedPreview.src = url;
        downloadBtn.disabled = false;
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = `resized_${platform}_${file.name}`;
            a.click();
        };
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to resize image. Please try again.');
    }
}