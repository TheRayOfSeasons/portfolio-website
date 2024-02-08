document.addEventListener('DOMContentLoaded', () => {
  const headerName = document.querySelector('.header-name');
  const headerTitle = document.querySelector('.header-title');
  headerName?.classList.add('active');
  setTimeout(() => {
    headerTitle?.classList.add('active');
  }, 600);
  const rotatingGradientBackgrounds = document.querySelectorAll('.rotating-gradient-background');

  const update = (time: number) => {
    for (const background of [...rotatingGradientBackgrounds]) {
      const gradient = `
        linear-gradient(
          ${(time * 0.1) + 45}deg,
          #411D2B 0%,
          #42EFF8 20%,
          #F20089 50%,
          #42EFF8 80%,
          #411D2B 100%
        )
      `;
      console.log(gradient);
      (background as HTMLElement).style.background = gradient;
    }
    window.requestAnimationFrame(update);
  }

  update(0);
  window.requestAnimationFrame(update);
});
