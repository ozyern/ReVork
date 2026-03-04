document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("dragstart", e => e.preventDefault());

const slides = document.querySelectorAll(".slide");
const progress = document.querySelector(".rs-progress");
const knob = document.querySelector(".rs-knob");

let current = 0;
const duration = 5000;

function showSlide(index){
    slides.forEach(slide => slide.classList.remove("active"));
    slides[index].classList.add("active");

    progress.style.width = "0%";
    knob.style.left = "0%";

    setTimeout(() => {
        progress.style.width = "100%";
        knob.style.left = "100%";
    }, 50);
}

function nextSlide(){
    current = (current + 1) % slides.length;
    showSlide(current);
}

showSlide(current);
setInterval(nextSlide, duration);