(function(){
  const STORAGE_KEY = 'vh-game-dino-best';
  const DINO_STORAGE_KEY = 'vh-game-dino-choice';
  const DINO_OPTIONS = [
    { id: 'bow', label: 'Bow', src: './dinos/bow.png' },
    { id: 'sword', label: 'Sword', src: './dinos/sword.png' },
    { id: 'star', label: 'Star', src: './dinos/star.png' },
    { id: 'blaster', label: 'Blaster', src: './dinos/blaster.png' },
    { id: 'axe', label: 'Axe', src: './dinos/axe.png' },
    { id: 'chainsaw', label: 'Chainsaw', src: './dinos/chainsaw.png' }
  ];

  class DinoRunGame {
    constructor(root){
      this.root = root;
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'dino-shell';

      this.controls = document.createElement('div');
      this.controls.className = 'dino-controls';
      this.controls.innerHTML = `
        <div class="dino-picker-copy">
          <span class="dino-picker-label">Pick your dino</span>
          <span class="dino-picker-help">Choose your runner before the next jump.</span>
        </div>
        <div class="dino-picker" role="listbox" aria-label="Pick your dino"></div>
      `;

      this.canvas = document.createElement('canvas');
      this.canvas.width = 900;
      this.canvas.height = 520;
      this.canvas.className = 'game-canvas';
      this.canvas.tabIndex = 0;
      this.wrapper.appendChild(this.controls);
      this.wrapper.appendChild(this.canvas);
      this.root.appendChild(this.wrapper);
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;
      this.picker = this.controls.querySelector('.dino-picker');
      this.bestScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
      this.animationFrame = null;
      this.lastTime = 0;
      this.groundY = 412;
      this.dinoImages = {};
      this.selectedDino = localStorage.getItem(DINO_STORAGE_KEY) || 'bow';
      this.loadDinoImages();
      this.renderPicker();
      this.bindings();
      this.reset();
      this.loop = this.loop.bind(this);
      this.animationFrame = requestAnimationFrame(this.loop);
    }

    loadDinoImages(){
      DINO_OPTIONS.forEach(option => {
        const image = new Image();
        image.src = option.src;
        this.dinoImages[option.id] = image;
      });
    }

    renderPicker(){
      if(!this.picker) return;
      this.picker.innerHTML = '';
      DINO_OPTIONS.forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dino-option';
        button.dataset.dino = option.id;
        button.setAttribute('aria-label', `Choose ${option.label} dino`);
        if(option.id === this.selectedDino){
          button.classList.add('active');
          button.setAttribute('aria-pressed', 'true');
        }else{
          button.setAttribute('aria-pressed', 'false');
        }
        button.innerHTML = `
          <img src="${option.src}" alt="" class="dino-option-art">
          <span class="dino-option-name">${option.label}</span>
        `;
        this.picker.appendChild(button);
      });
    }

    setSelectedDino(dinoId){
      if(!this.dinoImages[dinoId]) return;
      this.selectedDino = dinoId;
      localStorage.setItem(DINO_STORAGE_KEY, dinoId);
      this.picker?.querySelectorAll('.dino-option').forEach(button => {
        const isActive = button.dataset.dino === dinoId;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
    }

    bindings(){
      this.handleKeydown = (event) => {
        if(event.code === 'Space' || event.code === 'ArrowUp'){
          event.preventDefault();
          if(this.state === 'ready'){
            this.state = 'running';
            this.jump();
          }else if(this.state === 'running'){
            this.jump();
          }else if(this.state === 'over'){
            this.reset();
            this.state = 'running';
          }
        }
      };
      this.handlePickerClick = (event) => {
        const option = event.target.closest('.dino-option');
        if(!option) return;
        event.preventDefault();
        this.setSelectedDino(option.dataset.dino);
        this.canvas.focus();
      };
      window.addEventListener('keydown', this.handleKeydown);
      this.picker?.addEventListener('click', this.handlePickerClick);
    }

    reset(){
      this.state = 'ready';
      this.score = 0;
      this.speed = 360;
      this.spawnTimer = 0;
      this.player = { x: 120, y: this.groundY - 58, width: 48, height: 58, velocityY: 0, jumps: 0 };
      this.obstacles = [];
      this.floorOffset = 0;
      this.lastTime = 0;
    }

    jump(){
      if(this.player.jumps > 0) return;
      this.player.velocityY = -760;
      this.player.jumps = 1;
    }

    spawnObstacle(){
      const height = 34 + Math.random() * 48;
      const width = 22 + Math.random() * 16;
      this.obstacles.push({
        x: this.canvas.width + width,
        y: this.groundY - height,
        width,
        height,
        counted: false
      });
    }

    update(delta){
      if(this.state !== 'running') return;

      this.speed += delta * 10;
      this.spawnTimer -= delta;
      if(this.spawnTimer <= 0){
        this.spawnObstacle();
        this.spawnTimer = Math.max(0.7, 1.5 - Math.min(0.7, this.speed / 1200)) + Math.random() * 0.45;
      }

      this.player.velocityY += 1800 * delta;
      this.player.y += this.player.velocityY * delta;
      if(this.player.y >= this.groundY - this.player.height){
        this.player.y = this.groundY - this.player.height;
        this.player.velocityY = 0;
        this.player.jumps = 0;
      }

      this.floorOffset = (this.floorOffset + this.speed * delta) % 48;
      this.score += delta * 12;

      this.obstacles.forEach(obstacle => {
        obstacle.x -= this.speed * delta;
        if(!obstacle.counted && obstacle.x + obstacle.width < this.player.x){
          obstacle.counted = true;
          this.score += 8;
        }
      });
      this.obstacles = this.obstacles.filter(obstacle => obstacle.x + obstacle.width > -40);

      const playerHitbox = {
        x: this.player.x + 6,
        y: this.player.y + 8,
        width: this.player.width - 12,
        height: this.player.height - 8
      };

      for(const obstacle of this.obstacles){
        if(
          playerHitbox.x < obstacle.x + obstacle.width &&
          playerHitbox.x + playerHitbox.width > obstacle.x &&
          playerHitbox.y < obstacle.y + obstacle.height &&
          playerHitbox.y + playerHitbox.height > obstacle.y
        ){
          this.state = 'over';
          const currentScore = Math.floor(this.score);
          if(currentScore > this.bestScore){
            this.bestScore = currentScore;
            localStorage.setItem(STORAGE_KEY, String(this.bestScore));
          }
          break;
        }
      }
    }

    drawBackdrop(){
      const ctx = this.ctx;
      const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, '#12061f');
      gradient.addColorStop(1, '#05000d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = 'rgba(192,132,252,0.08)';
      ctx.beginPath();
      ctx.arc(700, 110, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(220, 70, 64, 0, Math.PI * 2);
      ctx.fill();
    }

    drawWorld(){
      const ctx = this.ctx;

      ctx.fillStyle = '#2c1446';
      ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
      ctx.strokeStyle = 'rgba(192,132,252,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, this.groundY);
      ctx.lineTo(this.canvas.width, this.groundY);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(192,132,252,0.18)';
      for(let x = -this.floorOffset; x < this.canvas.width + 48; x += 48){
        ctx.beginPath();
        ctx.moveTo(x, this.groundY);
        ctx.lineTo(x + 26, this.groundY + 26);
        ctx.stroke();
      }

      this.drawDino(ctx);

      this.obstacles.forEach(obstacle => {
        ctx.fillStyle = '#7c41ca';
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width * 0.45, obstacle.y);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(232,221,255,0.55)';
        ctx.stroke();
      });
    }

    drawDino(ctx){
      const x = this.player.x - 8;
      const y = this.player.y - 10;
      const bounce = this.player.jumps ? -2 : Math.sin(this.score * 0.15) * 1.2;
      const activeImage = this.dinoImages[this.selectedDino];

      if(activeImage && activeImage.complete && activeImage.naturalWidth > 0){
        ctx.drawImage(activeImage, x - 2, y - 6 + bounce, 84, 84);
        return;
      }

      ctx.fillStyle = '#ede8f5';
      ctx.fillRect(x + 8, y + 12 + bounce, 44, 44);
    }

    drawHud(){
      const ctx = this.ctx;
      ctx.fillStyle = '#f2ecfb';
      ctx.font = "600 18px 'Barlow', sans-serif";
      ctx.fillText(`Score ${Math.floor(this.score)}`, 28, 38);
      ctx.fillText(`Best ${this.bestScore}`, 28, 64);

      ctx.fillStyle = '#c084fc';
      ctx.font = "700 12px 'Orbitron', sans-serif";
      if(this.state === 'ready'){
        ctx.fillText('Press Space To Start', 28, 96);
      }else if(this.state === 'over'){
        ctx.fillText('Press Space To Restart', 28, 96);
      }
    }

    drawOverlay(){
      if(this.state !== 'ready' && this.state !== 'over') return;
      const ctx = this.ctx;
      ctx.fillStyle = 'rgba(6,0,14,0.52)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.strokeStyle = 'rgba(192,132,252,0.32)';
      ctx.strokeRect(200, 156, 500, 180);
      ctx.fillStyle = '#fff';
      ctx.font = "700 34px 'Orbitron', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(this.state === 'ready' ? 'Dino Run' : 'Game Over', this.canvas.width / 2, 224);
      ctx.fillStyle = '#d2cae6';
      ctx.font = "400 18px 'Barlow', sans-serif";
      ctx.fillText(
        this.state === 'ready'
          ? 'Space starts. Space or Up Arrow jumps. Avoid every obstacle.'
          : `Final score ${Math.floor(this.score)}. Space restarts the run.`,
        this.canvas.width / 2,
        266
      );
      ctx.textAlign = 'left';
    }

    loop(timestamp){
      if(!this.lastTime) this.lastTime = timestamp;
      const delta = Math.min((timestamp - this.lastTime) / 1000, 0.032);
      this.lastTime = timestamp;
      this.update(delta);
      this.drawBackdrop();
      this.drawWorld();
      this.drawHud();
      this.drawOverlay();
      this.animationFrame = requestAnimationFrame(this.loop);
    }

    focus(){
      this.canvas.focus();
    }

    destroy(){
      cancelAnimationFrame(this.animationFrame);
      window.removeEventListener('keydown', this.handleKeydown);
      this.picker?.removeEventListener('click', this.handlePickerClick);
    }
  }

  window.VHGames.registerGame('dino-run', DinoRunGame);
})();
