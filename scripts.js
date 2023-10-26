const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');
const filters = document.querySelectorAll('input[name="filter"]');

function getVideo(){
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((localMideaStream) => {
        video.srcObject = localMideaStream;
        video.play();
    })
    .catch(err => {
        console.error(err);
    });
}

function printCanvas(){
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        let pixels = ctx.getImageData(0, 0, width, height);
        pixels = setFilter(pixels);
        ctx.putImageData(pixels, 0, 0);
    }, 16);
}

function setFilter(pixels){
    let modified = pixels;
    filters.forEach(filter => {
        if(filter.checked){
            modified = this[`${filter.id}`](pixels);
            return
        }
    });
    return modified;
}

function takePhoto(){
    // snap.currentTime = 0;
    // snap.play();

    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = data;
    link.download = 'a photo';
    link.innerHTML = `<img src=${data} alt='a photo'>`
    strip.prepend(link);

}

function redFilter(pixels){
    for (let i = 0; i < pixels.data.length; i+=4) {
        pixels.data[i + 0] = pixels.data[i + 0] + 100; // Red
        pixels.data[i + 1] = pixels.data[i + 1]; // Green
        pixels.data[i + 2] = pixels.data[i + 2]; // Blue
    }
    return pixels;
}

function rgbSplit(pixels){
    for (let i = 0; i < pixels.data.length; i+=4) {
        pixels.data[i + 0] = pixels.data[i + 0]; // Red
        pixels.data[i + 1] = pixels.data[i + 1]; // Green
        pixels.data[i + 100] = pixels.data[i + 2]; // Blue
    }
    return pixels;
}

function greenScreen(pixels){
    const levels = {};
    
    document.querySelectorAll('.rgb input').forEach(input => {
        levels[input.name] = input.value;
    });
    
    
    for (let i = 0; i < pixels.data.length; i+=4) {
        if( pixels.data[i+0] <= levels.rmax && pixels.data[i+0] >= levels.rmin &&
            pixels.data[i+1] <= levels.gmax && pixels.data[i+1] >= levels.gmin &&
            pixels.data[i+2] <= levels.bmax && pixels.data[i+2] >= levels.bmin ){
                pixels.data[i+3] = 0;
        }
    }
    return pixels;
}

getVideo();
video.addEventListener('canplay', printCanvas);